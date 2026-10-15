// Oyun dengesi simülatörü.
// src/game.html içindeki TUNE bloğunu okur ve farklı beceri düzeylerinde binlerce oyun oynatır.
// Kullanım: node tools/sim.mjs            (karşılaştırma tablosu)
//           node tools/sim.mjs curve      (zorluk eğrisi verisi, JSON)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, '..', 'src', 'game.html'), 'utf8');
const block = src.split('/*TUNE-START*/')[1].split('/*TUNE-END*/')[0];
const TUNE = new Function(block + '\nreturn { CFG, DIFF, planGate, resolveHit, resolveMiss, drainAt };')();
const { CFG, DIFF } = TUNE;
// Deneme için: DIFF_OVERRIDE='{"rise":0.6}' CFG_OVERRIDE='{"hitGain":0.8}' node tools/sim.mjs 2000 yeni
if (process.env.DIFF_OVERRIDE) Object.assign(DIFF, JSON.parse(process.env.DIFF_OVERRIDE));
if (process.env.CFG_OVERRIDE) Object.assign(CFG, JSON.parse(process.env.CFG_OVERRIDE));
const TAU = Math.PI * 2;

const mulberry32 = a => () => {
  a |= 0; a = a + 0x6D2B79F5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
let rand = mulberry32(20261015);
const gauss = () => { let u = 0, v = 0; while (!u) u = rand(); while (!v) v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); };

// sigma: dokunuş zamanlama sapması (sn). lapse: dikkat kaybı olasılığı.
const SKILLS = {
  baslangic: { sigma: 0.100, lapse: 0.06 },
  rahat: { sigma: 0.070, lapse: 0.04 },
  iyi: { sigma: 0.050, lapse: 0.025 },
  usta: { sigma: 0.032, lapse: 0.012 },
  pro: { sigma: 0.022, lapse: 0.006 }
};

const tapError = (sk, tArr, timeLeft, retry) => {
  let s = sk.sigma;
  if (tArr < 0.35) s *= 1.4;
  if (timeLeft < 1.5) s *= 1.15;
  if (retry) s *= 1.25;
  if (rand() < sk.lapse) return (rand() * 2 - 1) * 0.35;
  return gauss() * s;
};

const oldPlan = n => ({
  I: 0, relief: false,
  omega: 2.2 + 1.9 * (1 - Math.exp(-n / 20)),
  hw: Math.max(0.22, 0.5 * Math.pow(0.985, n))
});
const MODELS = {
  eski: S => oldPlan(S.n),
  yeni: S => TUNE.planGate(S.n, S.adapt, S.mercy)
};

const playRun = (plan, sk, maxSeconds) => {
  const S = { time: CFG.startTime, n: 0, score: 0, combo: 0, maxCombo: 0, near: 0, adapt: 0, mercy: 0, hw: 0, omega: 0, I: 0, relief: false };
  let clock = 0, first = true;
  const gates = [];
  const apply = () => { const p = plan(S); S.hw = p.hw; S.omega = p.omega; S.I = p.I; S.relief = p.relief; };
  const done = cause => ({ n: S.n, score: S.score, dur: clock, near: S.near, cause, gates, I: S.I });
  apply();
  while (clock < maxSeconds) {
    const dist = first ? 1.6 + rand() * 0.7 : CFG.spawnMin + rand() * (CFG.spawnMax - CFG.spawnMin);
    first = false;
    let tArr = dist / S.omega, retry = false, firstTry = true, ok = false;
    while (!ok) {
      const err = tapError(sk, tArr, S.time, retry);
      const tTap = Math.max(0.06, tArr + err);
      const need = tTap * (plan === MODELS.eski ? 1 : TUNE.drainAt(S.n));
      if (S.time <= need) { clock += S.time / (need / tTap); S.time = 0; return done('sure'); }
      S.time -= need; clock += tTap;
      const offset = S.omega * (tTap - tArr);
      const ad = Math.abs(offset);
      if (ad <= S.hw + CFG.grace) {
        gates.push({ n: S.n, I: S.I, relief: S.relief, first: firstTry });
        TUNE.resolveHit(S, ad);
        ok = true;
      } else {
        TUNE.resolveMiss(S);
        firstTry = false; retry = true;
        if (S.time <= 0) return done('hata');
        tArr = offset < 0 ? Math.max(0.08, -offset / S.omega) : (TAU - offset) / S.omega;
      }
    }
    apply();
  }
  return done('limit');
};

const pct = (arr, p) => { const a = [...arr].sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(p * a.length))]; };
const fmt = (x, d = 0) => x.toFixed(d);

export const evaluate = (planName, skillName, runs = 3000, maxSeconds = 900) => {
  const sk = SKILLS[skillName], plan = MODELS[planName];
  const ns = [], durs = [], scores = [], nears = [];
  let causes = { sure: 0, hata: 0, limit: 0 };
  const hz = {}; // n kovası -> {gates, firstOk}
  const ph = Array.from({ length: DIFF.period }, () => ({ g: 0, ok: 0 })); // dalga içindeki konum (20-79. vuruşlar)
  for (let i = 0; i < runs; i++) {
    const r = playRun(plan, sk, maxSeconds);
    ns.push(r.n); durs.push(r.dur); scores.push(r.score); nears.push(r.near); causes[r.cause]++;
    for (const g of r.gates) {
      const b = Math.floor(g.n / 10);
      (hz[b] = hz[b] || { g: 0, ok: 0 }); hz[b].g++; if (g.first) hz[b].ok++;
      if (g.n >= 20 && g.n < 80) { const p = ph[g.n % DIFF.period]; p.g++; if (g.first) p.ok++; }
    }
  }
  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  return {
    planName, skillName,
    nMean: mean(ns), nP10: pct(ns, 0.1), nP50: pct(ns, 0.5), nP90: pct(ns, 0.9),
    durMean: mean(durs), durP50: pct(durs, 0.5), durP90: pct(durs, 0.9),
    scoreMean: mean(scores), nearMean: mean(nears),
    over30: durs.filter(d => d > 30).length / runs,
    over60: durs.filter(d => d > 60).length / runs,
    over120: durs.filter(d => d > 120).length / runs,
    limitShare: causes.limit / runs,
    firstTry: Object.keys(hz).map(Number).sort((a, b) => a - b).slice(0, 12).map(b => hz[b].ok / hz[b].g),
    phase: ph.map(p => (p.g ? p.ok / p.g : NaN))
  };
};

const table = rows => {
  console.log('model  beceri      hamle(p10/p50/p90)   süre sn (ort/p50/p90)  >30s  >60s  >2dk  kıl payı');
  for (const r of rows) {
    console.log(
      r.planName.padEnd(6), r.skillName.padEnd(10),
      `${fmt(r.nP10)}/${fmt(r.nP50)}/${fmt(r.nP90)}`.padEnd(20),
      `${fmt(r.durMean)}/${fmt(r.durP50)}/${fmt(r.durP90)}`.padEnd(22),
      `${fmt(r.over30 * 100)}%`.padEnd(6), `${fmt(r.over60 * 100)}%`.padEnd(6), `${fmt(r.over120 * 100)}%`.padEnd(6),
      fmt(r.nearMean, 1)
    );
  }
};

if (process.argv[2] === 'curve') {
  const out = [];
  for (let n = 0; n <= 80; n++) {
    const o = oldPlan(n), w = TUNE.planGate(n, 0, 0);
    out.push({ n, eski: +(2 * o.hw / o.omega * 1000).toFixed(0), yeni: +(2 * w.hw / w.omega * 1000).toFixed(0), yeniI: +w.I.toFixed(3), eskiOmega: +o.omega.toFixed(2), yeniOmega: +w.omega.toFixed(2) });
  }
  console.log(JSON.stringify(out));
} else {
  const runs = Number(process.argv[2]) || 2500;
  const only = process.argv[3];
  const rows = [];
  for (const m of ['eski', 'yeni']) {
    if (only && only !== m) continue;
    for (const s of Object.keys(SKILLS)) rows.push(evaluate(m, s, runs));
  }
  table(rows);
  if (only === 'yeni') {
    console.log('\nDalga konumuna göre ilk denemede vurma (yeni, 20-79. vuruşlar):');
    for (const s of Object.keys(SKILLS)) {
      const r = rows.find(x => x.skillName === s);
      console.log(s.padEnd(10), r.phase.map(v => fmt(v * 100)).join(' '));
    }
    process.exit(0);
  }
  console.log('\nİlk denemede vurma oranı, 10 vuruşluk dilimler (yeni model):');
  for (const s of Object.keys(SKILLS)) {
    const r = rows.find(x => x.planName === 'yeni' && x.skillName === s);
    console.log(s.padEnd(10), r.firstTry.map(v => fmt(v * 100)).join(' '));
  }
  console.log('\nİlk denemede vurma oranı (eski model):');
  for (const s of Object.keys(SKILLS)) {
    const r = rows.find(x => x.planName === 'eski' && x.skillName === s);
    console.log(s.padEnd(10), r.firstTry.map(v => fmt(v * 100)).join(' '));
  }
  console.log('\nDalga içindeki konuma göre ilk denemede vurma (yeni model, 20-79. vuruşlar; konum 0..9, 7-9 = nefes):');
  for (const s of Object.keys(SKILLS)) {
    const r = rows.find(x => x.planName === 'yeni' && x.skillName === s);
    console.log(s.padEnd(10), r.phase.map(v => fmt(v * 100)).join(' '));
  }
}
