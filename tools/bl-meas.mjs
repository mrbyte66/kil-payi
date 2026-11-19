/* Bölümleri laboratuvarın bütün oranlarıyla ölç (2026-11-19, kullanıcı: "tek parametreden değil, çeşitli parametrelerden bakıp değerlendirmek lazım"):
   node tools/bl-meas.mjs <durum.json> <oyun.html (BL_OV'si okunur)> [bölümler] [koşu] [iş] [çıktı.json]
   durum.json: { P, M, KF } (laboratuvarın kayıtlı ayarları); oyun.html: hangi bölüm kurgusu/hız/genişlik ölçülecek (src/game.html ya da bir yedek).
   Her bölüm için hedef kitlenin (lab S.B.aud) oranları: ilk denemede canı biten, geçen, bırakan, reklam izleyen, teklif edilince izleme, sıkılan,
   kıl payı (canın son %40'ta bitmesi), erken ölüm (ilk %30), yıldız, oyuncu başına dakika, kanca puanı ve sınırdaki oyuncu. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [sf, gf, spec = '4-55', nArg = '24', jArg = '8', outF = ''] = process.argv.slice(2);
const st = JSON.parse(readFileSync(sf, 'utf8')), src = readFileSync(gf, 'utf8');
const ov = {}; { const i = src.indexOf('const BL_OV = {'), j = src.indexOf('\n};', i); for (const m of src.slice(i, j).matchAll(/^ {2}([a-z]+\d): (\{.*\}),?$/gm)) ov[m[1]] = JSON.parse(m[2]); }
const list = spec.split(',').flatMap(p => { const [a, b] = p.split('-').map(Number); return b ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a]; });
const N = +nArg, J = +jArg;
const PAGE = `
window.__setup = async (st, ov, prec) => {
  for (let i = 0; i < 200 && !(K && S && document.querySelector('.card')); i++) await new Promise(r => setTimeout(r, 50));
  await measReady; S.ui.pg = 'gorunum'; S.ui.prec = prec;
  Object.assign(S.P, JSON.parse(JSON.stringify(st.P))); if (st.KF) Object.assign(S.KF, st.KF);
  for (const kd in st.M) for (const q in st.M[kd]) if (S.M[kd] && S.M[kd][q]) S.M[kd][q] = st.M[kd][q].slice();
  S.OV = JSON.parse(JSON.stringify(ov)); normalize(S); SIMC.clear(); try { fr.contentWindow.requestAnimationFrame = () => 0; } catch (e) {}
};
window.__m = async n => {
  for (let i = 0; i < 4; i++) { while (MS.busy) await new Promise(r => setTimeout(r, 50)); await measureLevels([n]); if (MEAS[n] && MEAS[n].h === physHash(n)) break; }
  const s = simLevel(n, S.P, S.B), r = s.pop, h = hookScore(r, n); window.__H = r.histN.map(v => Math.round(v * 100)), e3 = r.histN.slice(0, 3).reduce((a, b) => a + b, 0);
  return { H: window.__H, n, id: idOf(n), fail: 1 - r.first, pass: r.pass, quit: r.quit, watch: r.watch, accept: r.accept, adsPP: r.adsPP, bored: r.bored, late: lateOf(r), early: e3, stars: r.stars, min: r.minPP, att: r.att, hook: h.v, edge: s.edge, E: edgeT(n), bx: monoOf(n).bx };
};0`;
const parts = Array.from({ length: J }, () => []); list.forEach((n, i) => parts[i % J].push(n));
const res = [];
await Promise.all(parts.filter(p => p.length).map(async mine => {
  const b = await launch({ width: 1200, height: 800, dpr: 1, lang: 'tr-TR', seed: 'window.confirm=()=>true;' });
  try {
    await b.goto('file://' + join(root, 'www', 'lab.html'));
    await new Promise(r => setTimeout(r, 1500));
    await b.eval(PAGE); await b.eval(`__setup(${JSON.stringify(st)}, ${JSON.stringify(ov)}, ${N})`, { timeout: 60000 });
    for (const n of mine) { const r = await b.eval(`__m(${n})`, { timeout: 600000 }); res.push(r); console.error(`${r.n} ${r.id} kanca ${r.hook}`); if (outF) writeFileSync(outF, JSON.stringify(res, null, 1)); }   /* her bölümden sonra yaz: kesintide iş kaybolmasın */
  } finally { await b.close(); }
}));
res.sort((a, b) => a.n - b.n);
const pc = v => String(Math.round(v * 100)).padStart(3);
for (const r of res) console.log(`${String(r.n).padStart(2)} ${r.id.padEnd(10)} canı biten %${pc(r.fail)} · geçen %${pc(r.pass)} · bırakan %${pc(r.quit)} · reklam izleyen %${pc(r.watch)} · teklifte izleme %${pc(r.accept)} · sıkılan %${pc(r.bored)} · kıl payı %${pc(r.late)} · erken ölüm %${pc(r.early)} · yıldız ${r.stars.toFixed(1)} · ${r.min.toFixed(1)} dk · tekdüze %${pc(r.bx)} · kanca ${r.hook} · sınır ${Math.round(r.edge)}/${Math.round(r.E)}`);
if (outF) writeFileSync(outF, JSON.stringify(res, null, 1));
process.exit(0);
