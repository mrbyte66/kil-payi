// Oyun dengesi simülatörü.
// src/game.html içindeki TUNE bloğunu okur ve farklı beceri düzeylerinde binlerce oyun oynatır.
// Kilit türleri (tek, çift, kayan, tuzak, iki halka) yaklaşık modellerle hesaba katılır.
// Kullanım: node tools/sim.mjs                 (eski ve yeni model karşılaştırması)
//           node tools/sim.mjs 2500 yeni       (yalnızca yeni model, ilk oyun)
//           node tools/sim.mjs 2500 kariyer    (yalnızca yeni model, tüm türler zaten açılmış)
//           node tools/sim.mjs curve           (zorluk eğrisi verisi, JSON)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, '..', 'src', 'game.html'), 'utf8');
const block = src.split('/*TUNE-START*/')[1].split('/*TUNE-END*/')[0];
const TUNE = new Function(block + '\nreturn { CFG, DIFF, KINDS, KIND, planGate, resolveHit, resolveMiss, drainAt, pickKind };')();
const { CFG, DIFF, KINDS, KIND } = TUNE;
// Deneme için: DIFF_OVERRIDE='{"rise":0.6}' CFG_OVERRIDE='{"hitGain":0.8}' KIND_OVERRIDE='{"iki":{"w":0.2}}' node tools/sim.mjs 2000 yeni
if (process.env.DIFF_OVERRIDE) Object.assign(DIFF, JSON.parse(process.env.DIFF_OVERRIDE));
if (process.env.CFG_OVERRIDE) Object.assign(CFG, JSON.parse(process.env.CFG_OVERRIDE));
if (process.env.KIND_OVERRIDE) { const o = JSON.parse(process.env.KIND_OVERRIDE); for (const k in o) Object.assign(KIND[k], o[k]); }
const TAU = Math.PI * 2;

const mulberry32 = a => () => {
  a |= 0; a = a + 0x6D2B79F5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
let rand = mulberry32(20261015);
const gauss = () => { let u = 0, v = 0; while (!u) u = rand(); while (!v) v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); };
const U = (a, b) => a + rand() * (b - a);

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

// Bir hedefi vurana kadar dener. Ölürse {dead:true} döner.
// o: { tArr (sn), omega, hw, sigmaMul, trap: {t, w} | null (zaman penceresi, sn) }
const attempt = (st, sk, o, drainFn) => {
  const S = st.S;
  let tArr = o.tArr, retry = false, firstTry = true;
  for (let guard = 0; guard < 40; guard++) {
    const err = tapError(sk, tArr, S.time, retry) * o.sigmaMul;
    const tTap = Math.max(0.06, tArr + err);
    const need = tTap * drainFn(S.n);
    if (S.time <= need) { st.clock += S.time / drainFn(S.n); S.time = 0; return { dead: true }; }
    S.time -= need; st.clock += tTap;
    const offset = o.omega * (tTap - tArr), ad = Math.abs(offset);
    if (ad <= o.hw + CFG.grace) {
      S.hw = o.hw;
      st.gates.push({ n: S.n, first: firstTry, kind: o.kind });
      TUNE.resolveHit(S, ad);
      return { dead: false, tTap, offset, firstTry };
    }
    const inTrap = o.trap && Math.abs(tTap - o.trap.t) <= o.trap.w;
    TUNE.resolveMiss(S, inTrap ? CFG.trapCost : CFG.missCost);
    firstTry = false; retry = true;
    if (S.time <= 0) return { dead: true };
    tArr = offset < 0 ? Math.max(0.08, -offset / o.omega) : (TAU - offset) / o.omega;
    if (o.trap) o.trap = null;
  }
  return { dead: true };
};

const playRun = (model, sk, opts) => {
  const S = { time: CFG.startTime, n: 0, score: 0, combo: 0, maxCombo: 0, near: 0, adapt: 0, mercy: 0, hw: 0, omega: 0, I: 0, relief: false, gainMul: 1 };
  const st = { S, clock: 0, gates: [] };
  const drainFn = model === 'eski' ? () => 1 : TUNE.drainAt;
  const kinds = {};
  let last = 'tek', first = true;
  const unl = opts.career ? { cift: true, kayan: true, tuzak: true, iki: true } : {};
  const done = cause => ({ n: S.n, score: S.score, dur: st.clock, near: S.near, cause, gates: st.gates, kinds });
  while (st.clock < opts.maxSeconds) {
    let plan, kind = 'tek';
    if (model === 'eski') { plan = oldPlan(S.n); }
    else {
      plan = TUNE.planGate(S.n, S.adapt, S.mercy);
      kind = (first || model === 'yeni-tek') ? 'tek' : TUNE.pickKind(S.n, plan.relief, unl, last, rand());
    }
    const km = KIND[kind];
    const omega = plan.omega * km.omMul, hw = Math.min(0.8, plan.hw * km.hwMul);
    S.relief = plan.relief; S.I = plan.I; S.hw = hw; S.gainMul = km.gain;
    kinds[kind] = (kinds[kind] || 0) + 1;
    last = kind;
    const dist = first ? U(1.6, 2.3) : U(CFG.spawnMin, CFG.spawnMax);
    first = false;
    const base = { omega, hw, sigmaMul: 1, trap: null, kind };
    if (kind === 'tek') {
      if (attempt(st, sk, { ...base, tArr: dist / omega }, drainFn).dead) return done('sure');
    } else if (kind === 'cift') {
      const d1 = U(1.0, 2.0), cd = hw * 2 + U(0.3, 0.8);
      const r1 = attempt(st, sk, { ...base, tArr: d1 / omega, sigmaMul: 1.1 }, drainFn);
      if (r1.dead) return done('sure');
      const rem = Math.max(0.12, (cd - r1.offset) / omega);
      if (attempt(st, sk, { ...base, tArr: rem, sigmaMul: 1.15 }, drainFn).dead) return done('sure');
    } else if (kind === 'kayan') {
      if (attempt(st, sk, { ...base, tArr: U(1.4, 2.6) / omega, sigmaMul: 1.3 }, drainFn).dead) return done('sure');
    } else if (kind === 'tuzak') {
      const d = U(1.2, 2.4), th = hw * 1.1, off = hw + th + U(0.35, 0.9);
      const before = rand() < 0.5;
      const tTrap = (d + (before ? -off : off)) / omega;
      const trap = { t: Math.max(0.02, tTrap), w: (th + 0.02) / omega };
      if (attempt(st, sk, { ...base, tArr: d / omega, trap }, drainFn).dead) return done('sure');
    } else if (kind === 'iki') {
      const dA = U(1.0, 2.2), dB = U(1.0, 2.0), omB = omega * 0.85, hwB = Math.min(0.85, hw * 1.15);
      const tA = dA / omega, tB = dB / omB;
      const early = tA <= tB;
      const first1 = early
        ? attempt(st, sk, { ...base, tArr: tA, sigmaMul: 1.3 }, drainFn)
        : attempt(st, sk, { ...base, omega: omB, hw: hwB, tArr: tB, sigmaMul: 1.3 }, drainFn);
      if (first1.dead) return done('sure');
      const t1 = early ? tA : tB, t2 = early ? tB : tA;
      const second = early
        ? { ...base, omega: omB, hw: hwB, tArr: Math.max(0.15, t2 - t1), sigmaMul: 1.3 }
        : { ...base, tArr: Math.max(0.15, t2 - t1), sigmaMul: 1.3 };
      if (attempt(st, sk, second, drainFn).dead) return done('sure');
    }
  }
  return done('limit');
};

const pct = (arr, p) => { const a = [...arr].sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(p * a.length))]; };
const fmt = (x, d = 0) => x.toFixed(d);

export const evaluate = (model, skillName, runs = 3000, opts = {}) => {
  const o = { maxSeconds: 900, career: false, ...opts };
  const sk = SKILLS[skillName];
  const ns = [], durs = [], scores = [], nears = [];
  const mix = {};
  const byKind = {};
  for (let i = 0; i < runs; i++) {
    const r = playRun(model, sk, o);
    ns.push(r.n); durs.push(r.dur); scores.push(r.score); nears.push(r.near);
    for (const k in r.kinds) mix[k] = (mix[k] || 0) + r.kinds[k];
    for (const g of r.gates) { const b = (byKind[g.kind] = byKind[g.kind] || { g: 0, ok: 0 }); b.g++; if (g.first) b.ok++; }
  }
  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  const tot = Object.values(mix).reduce((s, x) => s + x, 0) || 1;
  return {
    model, skillName,
    nP10: pct(ns, 0.1), nP50: pct(ns, 0.5), nP90: pct(ns, 0.9),
    durMean: mean(durs), durP50: pct(durs, 0.5), durP90: pct(durs, 0.9),
    nearMean: mean(nears),
    over30: durs.filter(d => d > 30).length / runs,
    over60: durs.filter(d => d > 60).length / runs,
    over120: durs.filter(d => d > 120).length / runs,
    mix: Object.fromEntries(Object.entries(mix).map(([k, v]) => [k, v / tot])),
    firstTry: Object.fromEntries(Object.entries(byKind).map(([k, v]) => [k, v.ok / v.g]))
  };
};

const table = rows => {
  console.log('model        beceri      hamle(p10/p50/p90)   süre sn (ort/p50/p90)  >30s  >60s  >2dk  kıl payı');
  for (const r of rows) {
    console.log(
      r.model.padEnd(12), r.skillName.padEnd(10),
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
    out.push({ n, eski: +(2 * o.hw / o.omega * 1000).toFixed(0), yeni: +(2 * w.hw / w.omega * 1000).toFixed(0), yeniI: +w.I.toFixed(3) });
  }
  console.log(JSON.stringify(out));
} else {
  const runs = Number(process.argv[2]) || 2000;
  const only = process.argv[3];
  const rows = [];
  const plan = only === 'yeni' ? [['yeni', false]] : only === 'kariyer' ? [['yeni', true]] : [['eski', false], ['yeni-tek', false], ['yeni', false], ['yeni', true]];
  for (const [m, career] of plan) {
    for (const s of Object.keys(SKILLS)) {
      const r = evaluate(m, s, runs, { career });
      if (career) r.model = 'kariyer';
      rows.push(r);
    }
  }
  table(rows);
  console.log('\nTür başına ilk denemede vurma oranı ve gördüğü tür dağılımı (son satır grubu):');
  const lastGroup = rows.slice(-Object.keys(SKILLS).length);
  for (const r of lastGroup) {
    const ft = KINDS.map(k => (k + ' ' + (r.firstTry[k] !== undefined ? fmt(r.firstTry[k] * 100) : '-') + '%').padEnd(12)).join('');
    const mx = KINDS.map(k => (k + ' ' + fmt((r.mix[k] || 0) * 100) + '%').padEnd(12)).join('');
    console.log(r.skillName.padEnd(10), 'vurma:', ft);
    console.log(''.padEnd(10), 'dağılım:', mx);
  }
}
