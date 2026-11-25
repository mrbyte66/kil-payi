#!/usr/bin/env node
/* KZM kalibrasyon uydurma: gerçek oyunda (insan katmanlı bot) ölçülen dalga hasarına göre modelin mekanik çarpanlarını (HF.cal) ayarlar.
     node tools/kzm-fit.mjs collect [koşu=14] [işçi=6]   → .claude/bl-work/wavedata.json (tüm bölümler, hedef sigma'da sanal canla oynatılır)
     node tools/kzm-fit.mjs fit                           → tools/kzm-hf.json (cal çarpanları), uyum özeti
   Yöntem: yinelemeli orantılı uydurma (Poisson benzeri): her mekanik için Σ ölçülen / Σ model oranı kadar (sönümlü) çarpan güncellenir. */
import fs from 'node:fs';
import * as K from './kzm-core.mjs';
import { openGame, runScript } from './kzm-run.mjs';
const DATA = new URL('../.claude/bl-work/wavedata.json', import.meta.url).pathname, LV = new URL('./kzm-levels.json', import.meta.url).pathname, HFJ = new URL('./kzm-hf.json', import.meta.url).pathname;
const cmd = process.argv[2];
const ids = n => ['tek', 'kayan', 'nefes', 'kasa', 'gelgit', 'degirmen', 'ani', 'hayalet', 'nabiz', 'isin', 'serit'][Math.floor((n - 1) / 5)] + ((n - 1) % 5 + 1);
if (cmd === 'collect') {
  const R = +(process.argv[3] || 14), NWK = +(process.argv[4] || 6), all = JSON.parse(fs.readFileSync(LV, 'utf8')), todo = [];
  for (let n = 4; n <= 55; n++) if (all[ids(n)]) todo.push(n);
  const out = [];
  await Promise.all(Array.from({ length: NWK }, async (_, k) => {
    const g = await openGame();
    for (let i = k; i < todo.length; i += NWK) {
      const n = todo[i], sc = all[ids(n)], sg = K.sigmaOfZ(sc.z), av = K.avOf(sg);
      const runs = await runScript(g, { n, script: null, sigma: sg, av, runs: R });
      const N = sc.w.length, dm = new Array(N).fill(0); runs.forEach(r => r.e.forEach(e => { dm[Math.min(N - 1, e[0])] += e[1] ? 2 : 1; }));
      out.push({ id: ids(n), n, sg, R, waves: sc.w.map((w, j) => ({ w, bot: dm[j] / R })) });
      process.stderr.write(`${ids(n)} `);
    }
    await g.close();
  }));
  fs.writeFileSync(DATA, JSON.stringify(out)); console.log('\nkaydedildi:', out.length, 'bölüm'); process.exit(0);
}
if (cmd === 'bias') {
  /* kapalı döngü: her bölümü gerçek canla, hedef sigma'da oynat; ölçülen geçme oranından logit sapmasını güncelle */
  const R = +(process.argv[3] || 150), NWK = +(process.argv[4] || 8), all = JSON.parse(fs.readFileSync(LV, 'utf8')), BF = new URL('./kzm-bias.json', import.meta.url).pathname;
  const bias = fs.existsSync(BF) ? JSON.parse(fs.readFileSync(BF, 'utf8')) : {}, todo = [], res = {};
  for (let n = 4; n <= 55; n++) if (all[ids(n)]) todo.push(n);
  await Promise.all(Array.from({ length: NWK }, async (_, k) => {
    const g = await openGame();
    for (let i = k; i < todo.length; i += NWK) {
      const n = todo[i], sc = all[ids(n)], sg = K.sigmaOfZ(sc.z), av = K.avOf(sg);
      let pb; try { pb = JSON.parse(await g.eval(`(() => { const k = __kp, G = k.G; let ok = 0; for (let r = 0; r < ${R}; r++) { runBot(${sg / 1000}, ${av}, 1, 400, 1/60, { hf: true, jitter: 0, setup: () => { k.save.bl.f = {}; k.blStart(${n}); } }); if (G.mode === 'blwin') ok++; k.goMenu(); } return JSON.stringify(ok / ${R}); })()`, { timeout: 150000 })); } catch (e) { process.stderr.write('(' + ids(n) + ' zaman aşımı) '); continue; }
      res[ids(n)] = pb;
    }
    await g.close();
  }));
  let dev = 0, c = 0; const rows = [];
  for (const id in res) { const p = Math.min(0.96, Math.max(0.04, res[id])), step = Math.log(p / (1 - p)); bias[id] = Math.max(-3, Math.min(3, (bias[id] || 0) - 0.85 * step)); dev += Math.abs(res[id] - 0.5); c++; rows.push(id + ' ' + (res[id] * 100).toFixed(0) + '%'); }
  fs.writeFileSync(BF, JSON.stringify(bias)); console.log(rows.join('  ')); console.log('ort |bot geçme − %50| =', (dev / c * 100).toFixed(1), 'puan  (', c, 'bölüm, koşu', R, ')'); process.exit(0);
}
if (cmd === 'fit') {
  const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  const KEYS = { nefes: w => K.has(w, 'nefes'), ani: w => K.has(w, 'ani'), nabiz: w => K.has(w, 'nabiz'), serit: w => K.has(w, 'serit'), degirmen: w => K.has(w, 'degirmen'), kasa: w => w.s === 'kasa', gelgit: w => w.s === 'gelgit', isin: w => w.s === 'isin',
    hayaletT: w => K.has(w, 'hayaletT'), kayanT: w => K.has(w, 'kayanT'), diken: w => K.has(w, 'diken'), cift: w => w.s === 'cift', kayan: w => K.has(w, 'kayan'), hayalet: w => K.has(w, 'hayalet'), trapM: w => w.tr && w.tr.n > 0, alarm: w => K.has(w, 'alarm'), shr: w => w.x && w.x.shr, kyon: w => K.has(w, 'kyon') };
  const cal = Object.assign({}, K.getHF().cal); for (const k in KEYS) cal[k] = k in KEYS && ['nabiz','degirmen','kasa','gelgit','isin','serit','nefes','ani','hayaletT','kayanT','diken'].includes(k) ? cal[k] : 1;
  const waves = []; for (const L of data) for (const o of L.waves) waves.push({ w: o.w, bot: o.bot, sg: L.sg, id: L.id });
  const model = () => waves.map(o => K.waveRisk(o.w, o.sg, K.avOf(o.sg), 1));
  const stat = m => { const byId = {}; waves.forEach((o, i) => { (byId[o.id] = byId[o.id] || [0, 0]); byId[o.id][0] += o.bot; byId[o.id][1] += m[i]; });
    const r = Object.values(byId).map(([b, mm]) => Math.log(Math.max(0.05, b) / Math.max(0.05, mm))); return { rmsLog: Math.sqrt(r.reduce((a, x) => a + x * x, 0) / r.length), mean: Object.values(byId).reduce((a, [b]) => a + b, 0) / r.length, mm: Object.values(byId).reduce((a, [, x]) => a + x, 0) / r.length }; };
  K.setHF({ cal }); const m0 = model(), s0 = stat(m0);
  for (let it = 0; it < 60; it++) {
    K.setHF({ cal }); const m = model();
    for (const k in KEYS) { let sb = 0, sm = 0; waves.forEach((o, i) => { if (KEYS[k](o.w)) { sb += o.bot; sm += m[i]; } }); if (sm > 0.2 && sb > 0) cal[k] = Math.max(0.25, Math.min(12, cal[k] * Math.pow((sb + 0.3) / (sm + 0.3), 0.35))); }
  }
  K.setHF({ cal }); const m1 = model(), s1 = stat(m1);
  console.log('bölüm toplam hasar log-hatası (RMS):', s0.rmsLog.toFixed(3), '→', s1.rmsLog.toFixed(3), ' | ort bot', s1.mean.toFixed(2), 'model önce', s0.mm.toFixed(2), 'sonra', s1.mm.toFixed(2));
  for (const k in KEYS) { let sb = 0, sm = 0, c = 0; waves.forEach((o, i) => { if (KEYS[k](o.w)) { sb += o.bot; sm += m1[i]; c++; } }); console.log(k.padEnd(9), 'dalga', String(c).padStart(4), ' çarpan', cal[k].toFixed(2), ' bot', sb.toFixed(1), ' model', sm.toFixed(1)); }
  fs.writeFileSync(HFJ, JSON.stringify({ cal }, null, 1)); console.log('yazıldı:', HFJ);
}
