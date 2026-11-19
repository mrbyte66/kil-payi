/* Bölümleri hedef kitleye göre ayarla (2026-11-17, kullanıcı: "sen ayarla tüm bölümleri; ilk 3 kilide dokunma; hız ve genişlik challenge noktasında"):
   node tools/bl-tune.mjs <durum.json> [bölümler] [koşu] [iş]
   durum.json: { P, M, KEEP: { kimlik: kurgu }, REF: { sp: 5×4 °/sn, wp: 5×4 ° } }  (P ve M laboratuvarın kayıtlı ayarları)
   Her bölüm için: kurgu = bölümün hazır kurgusu (KEEP'te varsa o), hız = REF.sp[basamak] (kullanıcının kendi ayarladığı Tek ve çift + Kayan ortalaması),
   genişlik = REF.wp[basamak] × q; q, basamağın hedef kitlesinin (laboratuvar S.B.aud) ilk denemede canı biten oranı S.B.tFt'ye oturana kadar aranır.
   Genişlik sınıra (wMin/wMax) dayanırsa pencerenin kalanı hızdan alınır (en yavaş omMin). Laboratuvarın kendi ölçüm hattı (runOne + passRate, aynı tohumlar);
   sonunda bölüm tam ölçülür (measureLevels + simLevel + hookScore). Çıktı: tools/bl-tune-son.json (bölüm başına sp, wp, kurgu, ölçüm). */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [sf, spec = '16-55', nArg = '30', jArg = '8'] = process.argv.slice(2);
const st = JSON.parse(readFileSync(sf, 'utf8'));
const list = spec.split(',').flatMap(p => { const [a, b] = p.split('-').map(Number); return b ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a]; });
const N = +nArg, J = +jArg;
const PAGE = `
window.__setup = async (st, prec) => {
  for (let i = 0; i < 200 && !(K && S && document.querySelector('.card')); i++) await new Promise(r => setTimeout(r, 50));
  await measReady; S.ui.pg = 'gorunum'; S.ui.prec = prec;
  Object.assign(S.P, JSON.parse(JSON.stringify(st.P))); if (st.KF) Object.assign(S.KF, st.KF);
  for (const kd in st.M) for (const q in st.M[kd]) if (S.M[kd] && S.M[kd][q]) S.M[kd][q] = st.M[kd][q].slice();
  S.OV = {}; normalize(S); SIMC.clear(); window.__ST = st; try { fr.contentWindow.requestAnimationFrame = () => 0; } catch (e) {}
};
window.__setQ = (n, q) => {
  const k0 = (n - 1) % 5, R = __ST.REF, o = S.OV[idOf(n)], sp = [], wp = [];
  for (let i = 0; i < 4; i++) {
    /* hız senin hızının ±%15'inde kalır (fazla yavaş sıkar, fazla hızlı pes ettirir); pencerenin kalanı genişlikten.
       durum.json WCAP (nokta başına en geniş °, 2026-11-19 kullanıcı: "50 çok geniş, tatlı bir tonda") ve SLOW (hız en çok bu kata iner) verirse onlar */
    const cap = __ST.WCAP ? (Array.isArray(__ST.WCAP) ? __ST.WCAP[i] : __ST.WCAP) : S.P.wMax, slow = __ST.SLOW || 0.85;
    const want = R.wp[k0][i] * q, w = Math.min(cap, S.P.wMax, Math.max(S.P.wMin, want)), r = Math.max(1 / 1.15, Math.min(1 / slow, want / w));
    wp.push(Math.round(w * 2) / 2); sp.push(Math.round(Math.max(S.P.omMin, (__ST.SPMIN && __ST.SPMIN[i]) || 0, R.sp[k0][i] / r)));   /* SPMIN: noktaya göre en yavaş °/sn (2026-11-19 kullanıcı: "105 çok yavaş") */
  }
  o.sp = sp; o.wp = wp; SIMC.clear();
};
/* q'da bütün tiplerin ilk denemede canı biten oranı ve sınırdaki oyuncu (ms) */
window.__prof = (n, prec) => {
  const w = mf.contentWindow, k = w.__kp, fails = {};
  for (const ps of S.PS) { if (ps.id === 'ideal') continue; const runs = []; for (let i = 0; i < prec; i++) runs.push(runOne(w, k, n, ps, 0, hashS(n + '|' + ps.id + '|0|' + i))); fails[ps.id] = 1 - passRate(runs, S.P); }
  /* durum.json TGT: 'aud' (2026-11-19, kullanıcı: "tüm bölümler hedef kitleye göre: iyi, usta, pro, belki kusursuz"): ölçü sınırdaki oyuncu değil,
     hedef kitlenin (S.B.aud × nüfus payı) ilk denemede canı biten oranı; hedef S.B.tFt. e alanı o zaman 'logit(1 - canı biten)' gibi davranır (q ile artar) */
  if (__ST.TGT === 'aud') { const w = audW(n), tw = Object.keys(fails).reduce((a, id) => a + (w[id] || 0), 0), f = Object.keys(fails).reduce((a, id) => a + (w[id] || 0) * fails[id], 0) / Math.max(1e-9, tw);
    const fc = Math.min(0.97, Math.max(0.03, f)); return { fails, f, e: 100 * Math.exp(Math.log((1 - fc) / fc) / 2) }; }
  return { fails, e: edgeMs(fails) };
};
window.__fail = (n, q, prec) => { __setQ(n, q); return __prof(n, prec); };
/* kullanıcının kendi ayarladığı bölümü olduğu gibi ölç (kıyas için): kitlenin canı biten oranı, tip tip */
window.__meas = (n, prec) => {
  const id = idOf(n); S.OV[id] = JSON.parse(JSON.stringify(__ST.FIX[id])); normalize(S); SIMC.clear();
  const r = __prof(n, prec), ps = Object.fromEntries(Object.entries(r.fails).map(([k, v]) => [k, Math.round(v * 100)]));
  return { n, id, e: r.e, E: Math.round(edgeT(n)), ps, sp: lvPts(n).sp.map(Math.round), wp: lvPts(n).wp };
};
window.__tune = async (n, prec) => {
  await measReady;
  const id = idOf(n), { g, k } = K.blGK(n);
  if (__ST.FIX && __ST.FIX[id]) return __meas(n, prec);
  S.OV[id] = __ST.KEEP && __ST.KEEP[id] ? JSON.parse(JSON.stringify(__ST.KEEP[id])) : ovDef0(n);
  normalize(S);
  /* sınırdaki oyuncu (ms) q ile artar (geniş = kolay); log-log kesen + aralık */
  const E = __ST.TGT === 'aud' ? (() => { const F = goal(n).F; return 100 * Math.exp(Math.log((1 - F) / F) / 2); })() : edgeT(n), LO = Math.log(27 / 41 / 1.15), HI = Math.log(50 / 30 * (__ST.SLOW ? 1 / __ST.SLOW : 1.18)), tries = [];
  let x = 0, rr = __fail(n, 1, prec), y = Math.log(rr.e); tries.push([x, y, rr]);
  let a = null, b = null; const upd = (x, y) => { if (y < Math.log(E)) { if (!a || x > a[0]) a = [x, y]; } else if (!b || x < b[0]) b = [x, y]; }; upd(x, y);
  for (let it = 0; it < 9 && Math.abs(Math.exp(y) - E) > (__ST.TGT === 'aud' ? 1.5 : 2); it++) {
    const pv = tries.length > 1 ? tries[tries.length - 2] : null; let sl = pv && Math.abs(x - pv[0]) > 1e-3 ? (y - pv[1]) / (x - pv[0]) : 0.8; if (!(sl > 0.15)) sl = 0.8;
    let nx = x + (Math.log(E) - y) / sl; if (a && b && !(nx > a[0] && nx < b[0])) nx = (a[0] + b[0]) / 2;
    nx = Math.max(LO, Math.min(HI, nx)); nx = Math.log(Math.round(Math.exp(nx) * 100) / 100);
    if (tries.some(t => Math.abs(t[0] - nx) < 1e-9)) { if (a && b && b[0] - a[0] > 0.015) nx = Math.log(Math.round(Math.exp((a[0] + b[0]) / 2) * 100) / 100); if (tries.some(t => Math.abs(t[0] - nx) < 1e-9)) break; }
    x = nx; rr = __fail(n, Math.exp(x), prec); y = Math.log(rr.e); tries.push([x, y, rr]); upd(x, y);
  }
  const best = tries.reduce((a, t) => Math.abs(t[1] - Math.log(E)) < Math.abs(a[1] - Math.log(E)) ? t : a), q = +Math.exp(best[0]).toFixed(2);
  __setQ(n, q);
  for (let i = 0; i < 4; i++) { while (MS.busy) await new Promise(r => setTimeout(r, 50)); await measureLevels([n]); if (MEAS[n] && MEAS[n].h === physHash(n)) break; }
  const s = simLevel(n, S.P, S.B), r = s.pop, h = hookScore(r, n), ps = {};
  for (const p of S.PS) { const x = s.ps[p.id]; if (x && p.id !== 'ideal') ps[p.id] = Math.round(100 * (1 - x.first / x.NP)); }
  return { n, id, q, E: Math.round(E), e: Math.exp(best[1]), T: goal(n).F, prof: Object.fromEntries(Object.entries(best[2].fails).map(([k, v]) => [k, Math.round(v * 100)])), it: tries.length, tries: tries.map(t => [+Math.exp(t[0]).toFixed(2), Math.round(Math.exp(t[1]))]), ov: JSON.parse(JSON.stringify(S.OV[id])), f: 1 - r.first, w: r.watch, a: r.adsPP, qu: r.quit, b: r.bored, k: h.late, v: h.v, ps, all: 1 - s.all.first };
};0`;
const parts = Array.from({ length: J }, () => []); list.forEach((n, i) => parts[i % J].push(n));
const res = [];
await Promise.all(parts.filter(p => p.length).map(async mine => {
  const b = await launch({ width: 1200, height: 800, dpr: 1, lang: 'tr-TR', seed: 'window.confirm=()=>true;' });
  try {
    await b.goto('file://' + join(root, 'www', 'lab.html'));
    await new Promise(r => setTimeout(r, 1500));
    await b.eval(PAGE); await b.eval(`__setup(${JSON.stringify(st)}, ${N})`, { timeout: 60000 });
    for (const n of mine) {
      const r = await b.eval(`(async () => { if (K.blSoon(${n})) return null; return await __tune(${n}, ${N}); })()`, { timeout: 1800000 });
      if (r && !r.ov) { res.push(r); console.log(`${r.id.padEnd(10)} SENİN AYARIN · sınırdaki ${Math.round(r.e)}/${r.E} ms · sp ${r.sp.join('/')} · wp ${r.wp.map(v => v.toFixed(1)).join('/')} · tip ${Object.entries(r.ps).map(([k, v]) => k + ' ' + v).join(' ')}`); continue; }
      if (r) { res.push(r); writeFileSync(join(root, 'tools', 'bl-tune-son.json'), JSON.stringify(res, null, 1));   /* her bölümden sonra yaz: kesintide iş kaybolmasın */ console.log(`${r.id.padEnd(10)} q ${r.q.toFixed(2)} · sınırdaki ${Math.round(r.e)}/${r.E} ms · kitle canı biten %${Math.round(r.f * 100)} · kanca ${r.v} · sp ${r.ov.sp.join('/')} · wp ${r.ov.wp.join('/')} · tip ${Object.entries(r.prof).map(([k, v]) => k + ' ' + v).join(' ')} · denemeler ${r.tries.map(t => t.join(':')).join(' ')}`); }
    }
  } finally { await b.close(); }
}));
res.sort((a, b) => a.n - b.n);
writeFileSync(join(root, 'tools', 'bl-tune-son.json'), JSON.stringify(res, null, 1));
process.exit(0);
