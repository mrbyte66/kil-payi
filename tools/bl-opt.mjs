/* Bölümler genel optimizasyonu, Ayar Laboratuvarı'nın KENDİ ölçüm hattıyla (aynı koşular, aynı model, aynı kanca):
   node tools/bl-opt.mjs <varyantlar.json> [bölümler] [koşu] [iş]
   varyantlar.json: [{ ad, P: { phm, regen, size, t, om, wd, ... }, B: { ... } }, ...]
   Her varyantta her bölümün kilit katsayısı c, hedef kitlenin ilk denemede canı biten oranı goal(n).F'ye oturana kadar ayarlanır
   (laboratuvarın runOne + replay'i, ölçümle aynı tohumlar), sonra bölüm tam ölçülür (measureLevels) ve simLevel + hookScore okunur.
   Çıktı: varyant başına ortalama kanca, bileşenler, basamak ortalamaları; --yaz ile son varyantın c değerleri tools/bl-opt-c.json'a yazılır. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [vf, spec = '1-80', nArg = '30', jArg = '8'] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const WRITE = process.argv.includes('--yaz');
const variants = JSON.parse(readFileSync(vf, 'utf8'));
const list = spec.split(',').flatMap(p => { const [a, b] = p.split('-').map(Number); return b ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a]; });
const N = +nArg, J = +jArg;
const PAGE = `
window.__setup = async (cfg, prec) => { for (let i = 0; i < 200 && !(K && S && document.querySelector('.card')); i++) await new Promise(r => setTimeout(r, 50)); await measReady; S.ui.pg = 'gorunum'; S.ui.prec = prec; Object.assign(S.P, JSON.parse(JSON.stringify(cfg.P || {}))); Object.assign(S.B, cfg.B || {}); if (cfg.KF) Object.assign(S.KF, cfg.KF); if (cfg.M) for (const kd in cfg.M) for (const q in cfg.M[kd]) S.M[kd][q] = cfg.M[kd][q].slice();
  if (cfg.PH) for (const n in cfg.PH) { const o = ovDef0(+n); cfg.PH[n].forEach((m, i) => { o.ph[i].om = m; }); S.OV[idOf(+n)] = o; }   /* kısım hız katları (bölüm kurgusu) */
  normalize(S); SIMC.clear(); try { fr.contentWindow.requestAnimationFrame = () => 0; } catch (e) {} };
window.__fail = (n, c, prec) => {
  S.KF[idOf(n)] = c; SIMC.clear();
  const w = mf.contentWindow, k = w.__kp, AW = audW(n); let f = 0, tw = 0;   /* basamağın hedef kitlesi (laboratuvar audW); asıl ayar aracı artık tools/bl-tune.mjs */
  for (const ps of S.PS) { if (ps.id === 'ideal') continue; const wt = AW[ps.id] || 0; if (!(wt > 0)) continue;
    const runs = []; for (let i = 0; i < prec; i++) runs.push(runOne(w, k, n, ps, 0, hashS(n + '|' + ps.id + '|0|' + i)));
    f += wt * (1 - passRate(runs, S.P)); tw += wt; }
  return f / tw;
};
window.__cal = async (n, prec) => {
  await measReady;
  const T = goal(n).F, lg = p => { p = Math.min(0.99, Math.max(0.01, p)); return Math.log(p / (1 - p)); };
  const LO = Math.log(0.3), HI = Math.log(3.5), tries = []; let x = Math.log(S.KF[idOf(n)] || 1), f = __fail(n, Math.exp(x), prec); tries.push([x, f]);
  /* köşeli kesen: c büyüdükçe canı biten azalır; a = hedeften zor taraftaki en geniş nokta, b = kolay taraftaki en dar nokta; kesen aralığın dışına çıkarsa ikiye bölünür */
  let a = null, b = null; const upd = (x, f) => { if (f > T) { if (!a || x > a[0]) a = [x, f]; } else if (!b || x < b[0]) b = [x, f]; }; upd(x, f);
  for (let it = 0; it < 10 && Math.abs(f - T) > 0.012; it++) {
    const pv = tries.length > 1 ? tries[tries.length - 2] : null; let sl = pv && Math.abs(x - pv[0]) > 1e-3 ? (lg(f) - lg(pv[1])) / (x - pv[0]) : -3; if (!(sl < -0.3)) sl = -3;
    let nx = x + (lg(T) - lg(f)) / sl; if (a && b && !(nx > a[0] && nx < b[0])) nx = (a[0] + b[0]) / 2;
    nx = Math.max(LO, Math.min(HI, nx)); nx = Math.log(Math.round(Math.exp(nx) * 100) / 100);
    if (tries.some(t => Math.abs(t[0] - nx) < 1e-9)) { if (a && b && b[0] - a[0] > 0.015) nx = Math.log(Math.round(Math.exp((a[0] + b[0]) / 2) * 100) / 100); if (tries.some(t => Math.abs(t[0] - nx) < 1e-9)) break; }
    x = nx; f = __fail(n, Math.exp(x), prec); tries.push([x, f]); upd(x, f);
  }
  const best = tries.reduce((a, t) => Math.abs(t[1] - T) < Math.abs(a[1] - T) ? t : a); S.KF[idOf(n)] = +Math.exp(best[0]).toFixed(2);
  /* ölçüm başka iş sürerken dönebilir (MS.busy): bitmesini bekle, ölçüm yoksa yeniden dene */
  for (let i = 0; i < 4; i++) { while (MS.busy) await new Promise(r => setTimeout(r, 50)); await measureLevels([n]); if (MEAS[n] && MEAS[n].h === physHash(n)) break; }
  const s = simLevel(n, S.P, S.B), r = s.pop, h = hookScore(r, n);
  return { n, id: idOf(n), c: S.KF[idOf(n)], T, f0: tries[0][1], fc: best[1], it: tries.length, fa: 1 - s.all.first, qa: s.all.quit, ba: s.all.bored, f: 1 - r.first, w: r.watch, a: r.adsPP, q: r.quit, b: r.bored, k: h.late, v: h.v, sD: h.sD, sW: h.sW, sQ: h.sQ, sB: h.sB, sK: h.sK, G: h.G };
};0`;
const runVariant = async v => {
  const parts = Array.from({ length: J }, () => []); list.forEach((n, i) => parts[i % J].push(n));
  const res = [];
  await Promise.all(parts.filter(p => p.length).map(async mine => {
    const b = await launch({ width: 1200, height: 800, dpr: 1, lang: 'tr-TR', seed: 'window.confirm=()=>true;' });
    try {
      await b.goto('file://' + join(root, 'www', 'lab.html'));
      await new Promise(r => setTimeout(r, 1500));
      await b.eval(PAGE); await b.eval(`__setup(${JSON.stringify(v)}, ${N})`, { timeout: 60000 });
      for (const n of mine) { const r = await b.eval(`(async () => { if (K.blSoon(${n})) return null; return await __cal(${n}, ${N}); })()`, { timeout: 900000 }); if (r) res.push(r); }
    } finally { await b.close(); }
  }));
  return res.sort((a, b) => a.n - b.n);
};
const avg = (a, f) => a.reduce((s, x) => s + f(x), 0) / Math.max(1, a.length);
const summary = (v, res) => {
  const tiers = [0, 1, 2, 3, 4].map(t => res.filter(r => (r.n - 1) % 5 === t));
  const p = x => Math.round(x * 100);
  console.log(`\n== ${v.ad}: kanca ort ${avg(res, r => r.v).toFixed(1)} · en düşük ${Math.min(...res.map(r => r.v))} · bileşen ort zorluk ${avg(res, r => r.sD).toFixed(2)} reklam ${avg(res, r => r.sW).toFixed(2)} bırakan ${avg(res, r => r.sQ).toFixed(2)} sıkılan ${avg(res, r => r.sB).toFixed(2)} kıl payı ${avg(res, r => r.sK).toFixed(2)}`);
  tiers.forEach((tr, t) => console.log(`  ${t + 1}. basamak: kanca ${avg(tr, r => r.v).toFixed(0)} · canı biten %${p(avg(tr, r => r.f))}/${p(avg(tr, r => r.T))} · izleyen %${p(avg(tr, r => r.w))} · reklam ${avg(tr, r => r.a).toFixed(2)} · bırakan %${p(avg(tr, r => r.q))} · sıkılan %${p(avg(tr, r => r.b))} · kıl payı %${p(avg(tr, r => r.k))} · c ${avg(tr, r => r.c).toFixed(2)}`));
};
const all = [];
for (const v of variants) { const t0 = Date.now(); const res = await runVariant(v); all.push({ ad: v.ad, res }); summary(v, res); console.log(`  (${((Date.now() - t0) / 1000).toFixed(0)} sn)`); }
writeFileSync(join(root, 'tools', 'bl-opt-son.json'), JSON.stringify(all, null, 1));
if (WRITE) { const last = all[all.length - 1].res; writeFileSync(join(root, 'tools', 'bl-opt-c.json'), JSON.stringify(Object.fromEntries(last.map(r => [r.id, r.c])), null, 1)); console.log('c değerleri tools/bl-opt-c.json'); }
process.exit(0);
