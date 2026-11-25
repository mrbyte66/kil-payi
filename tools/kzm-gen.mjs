#!/usr/bin/env node
/* KZM ÜRETEÇ (V1.0.28): bölümleri (4-55) Zorluk Modeli ile baştan üretir; Bölüm 1-3 (tek1-3, kullanıcının elle ayarı) dokunulmaz.
   Kullanım:  node tools/kzm-gen.mjs [--only 18,19] [--cand 12] [--seed 1] [--write]
   Her bölüm: (1) birikimli kadro (önceki parkurların öğeleri + kendi öğesi), (2) cümle/sıçrama/dinlenme/patron ritmi olan risk eğrisi,
   (3) her dalga için hız v ve genişlik d, o dalganın hedef riskini veren (v, d) olarak model ile çözülür, (4) tüm eğri tek çarpanla (dial)
   hedef zorluk puanı Z'ye (kitle yüzdeliği: Z puanlı oyuncu bölümü %50 geçer) oturtulur, (5) adaylar arasında kanca puanı en yükseği seçilir.
   Çıktı: tools/kzm-levels.json (+ --write ile src/game.html içinde BL_SC-START ile BL_SC-END işaretleri arası). */
import fs from 'node:fs';
import * as K from './kzm-core.mjs';

const ARGS = process.argv.slice(2), opt = n => { const i = ARGS.indexOf('--' + n); return i < 0 ? null : (ARGS[i + 1] && !ARGS[i + 1].startsWith('--') ? ARGS[i + 1] : true); };
const CAND = +(opt('cand') || 12), SEED0 = +(opt('seed') || 1);
const BIASF = new URL('./kzm-bias.json', import.meta.url).pathname, BIAS = fs.existsSync(BIASF) ? JSON.parse(fs.readFileSync(BIASF, 'utf8')) : {};   /* kapalı döngü: bölüm başına logit sapması (tools/kzm-fit.mjs bias) */
const ZF = (() => { try { return JSON.parse(fs.readFileSync(new URL('./kzm-z.json', import.meta.url).pathname, 'utf8')); } catch (e) { return {}; } })();
const ZL = ZF.ladder || [70, 73, 76, 79, 82];   /* basamak → hedef zorluk puanı (parkur 1-10); tools/kzm-z.json ile değişir (kullanıcı: çok zor olunca insanlar bırakır, yavaş zorlaşsın) */
const ZT0 = ZF.tek || { 4: 69, 5: 72 };          /* tek parkuru: 1-3 kullanıcının elle ayarı (ölçülen ≈ 30/36/67), 4-5 oradan çok yavaş sürer */
const DRIFT = ZF.drift != null ? ZF.drift : 0.4; /* parkur başına küçük artış: oyun boyunca yavaşça zorlaşır */
const NW = [20, 23, 26, 29, 32];          /* dalga sayısı (basamağa göre) */
const VMIN = 155, VMAX = 320, DMIN = 18, DMAX = 44;

const PK = [
  { id: 'tek', own: {} }, { id: 'kayan', own: { m: 'kayan', tk: 'kayanT' } }, { id: 'nefes', own: { m: 'nefes', tk: 'diken' } },
  { id: 'kasa', own: { st: 'kasa', e: 'kyon', tk: 'alarm' } }, { id: 'gelgit', own: { st: 'gelgit' } }, { id: 'degirmen', own: { e: 'degirmen' } },
  { id: 'ani', own: { m: 'ani' } }, { id: 'hayalet', own: { m: 'hayalet', tk: 'hayaletT' } }, { id: 'nabiz', own: { e: 'nabiz' } },
  { id: 'isin', own: { st: 'isin' } }, { id: 'serit', own: { e: 'serit' } },
];
const MODG = { kayan: 1, nefes: 2, ani: 6, hayalet: 7 }, ENVG = { kyon: 3, degirmen: 5, nabiz: 8, serit: 10 };
const STG = { tek: 0, cift: 0, kasa: 3, gelgit: 4, isin: 9 };

/* ---------------- yardımcılar ---------------- */
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, u) => a + (b - a) * u, r0 = x => Math.round(x), r1 = x => Math.round(x * 10) / 10, r2 = x => Math.round(x * 100) / 100;
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const wpick = (rng, o) => { const ks = Object.keys(o), s = ks.reduce((a, k) => a + o[k], 0); let u = rng() * s; for (const k of ks) { u -= o[k]; if (u <= 0) return k; } return ks[ks.length - 1]; };

/* mekanik ayarları: yoğunluk q (0-1) ile birlikte sertleşir; yalnız dalgada bulunan mekaniğin ayarı yazılır */
const PSCH = q => ({
  kayan: { amp: r0(lerp(14, 26, q)), f: r2(lerp(0.28, 0.45, q)) }, nefes: { a: r0(lerp(30, 52, q)), P: r1(lerp(1.9, 1.3, q)) },
  hayalet: { vis: r2(lerp(1.3, 0.75, q)), hid: r2(lerp(0.8, 1.3, q)) }, ani: { lead: r2(lerp(0.8, 0.5, q)) },
  nabiz: { per: r2(lerp(1.25, 1.05, q)), base: r2(lerp(0.7, 0.5, q)), pow: r1(lerp(1.8, 2.6, q)) }, degirmen: { w: r0(lerp(38, 62, q)), hw: r0(lerp(11, 15, q)), chg: r1(lerp(3.0, 2.2, q)) },
  kasa: { gap: r0(lerp(46, 34, q)), flip: r1(lerp(5.0, 3.0, q)), tell: r2(lerp(0.55, 0.42, q)) }, gelgit: { tideV: r2(lerp(0.85, 1.2, q)), tideW: r2(lerp(0.6, 0.9, q)) },
  isin: { isinGapT: r2(lerp(0.55, 0.42, q)) }, serit: { span: r0(lerp(18, 14, q)), gap: r0(lerp(130, 100, q)) },
});
const mechsOf = f => [].concat(f.m || [], (f.e || []).filter(e => !['nabizk', 'hizkanat', 'deg3'].includes(e)), (f.tr && f.tr.k) || [], f.s === 'kasa' || f.s === 'gelgit' || f.s === 'isin' ? [f.s] : [], f.x && f.x.shr ? ['shr'] : [], f.x && f.x.amb ? ['amb'] : []);
const hasAny = (f, t) => mechsOf(f).includes(t) || (f.e || []).includes(t);

/* uyumluluk: motorun kuramayacağı ya da anlamsız birleşimler */
const compat = f => {
  const e = f.e || [], m = f.m || [], s = f.s, has = t => e.includes(t) || m.includes(t) || (f.x && f.x[t]);
  if (has('serit') && (!['tek', 'cift'].includes(s) || m.length > 0 || e.some(q => ['nabiz', 'degirmen', 'kyon'].includes(q)) || (f.x && (f.x.amb || f.x.shr)))) return false;   /* oyunda kayan/nefes ile iki halka neredeyse oynanamıyor (ölçüldü) */
  if (has('degirmen') && (['kasa', 'isin'].includes(s) || m.includes('ani') || e.includes('nabiz') || e.includes('kyon') || (f.x && f.x.amb))) return false;
  if (has('nabiz') && (['gelgit', 'isin'].includes(s) || e.includes('kyon') || (f.x && f.x.amb))) return false;
  if (has('kyon') && (['gelgit', 'isin'].includes(s) || m.includes('ani') || (f.x && f.x.amb))) return false;
  if (m.includes('ani') && (['kasa', 'gelgit', 'isin'].includes(s) || m.includes('hayalet') || (f.x && f.x.shr))) return false;
  if (s === 'isin' && (m.some(q => q !== 'nefes') || (f.x && (f.x.amb || f.x.shr)))) return false;
  if (s === 'gelgit' && (m.includes('hayalet') || m.includes('ani') || (f.x && f.x.amb))) return false;
  if (s === 'kasa' && (m.includes('ani') || (f.x && f.x.shr && m.length > 1))) return false;
  if (f.x && f.x.amb && !['tek', 'cift', 'kasa'].includes(s)) return false;
  if (m.includes('hayalet') && m.includes('kayan') && m.includes('nefes')) return false;
  const k = (f.tr && f.tr.k) || [];
  if ((k.includes('kayanT') && !m.includes('kayan')) || (k.includes('diken') && !m.includes('nefes')) || (k.includes('hayaletT') && !m.includes('hayalet')) || (k.includes('alarm') && s !== 'kasa')) return false;
  return true;
};
const capOf = (k, x, boss) => Math.min(3, (x < 0.25 ? 1 : x < 0.65 ? (k >= 2 ? 2 : 1) : (k >= 4 ? 3 : 2)) + (boss ? 1 : 0));

/* bir dalga şekli örnekle (v, d sonra çözülür) */
const sample = (rng, g, k, x, ph, boss) => {
  const own = PK[g].own, f = { s: 'tek', n: 1, m: [], e: [], tr: { n: 0, k: [] }, x: null, p: {} };
  const tw = boss || (ph === 3 && x > 0.2), rest = ph === 4 || x < 0.1;   /* tatlı nokta: ters köşe (pusu, küçülen hedef) yalnız burada; dinlenme: sade */
  const stW = { tek: 3, cift: 2 }; if (g >= 3) stW.kasa = g === 3 ? 5 : 1.4; if (g >= 4) stW.gelgit = g === 4 ? 5 : 0.7; if (g >= 9) stW.isin = g === 9 ? 5 : 0.7;
  f.s = wpick(rng, stW);
  f.n = f.s === 'tek' ? wpick(rng, { 1: 4, 2: 5, 3: x > 0.5 ? 2 : 0.5 }) | 0 : f.s === 'cift' ? wpick(rng, { 2: 6, 3: 4 }) | 0 : f.s === 'kasa' ? (k <= 2 && x < 0.5 ? 2 : wpick(rng, { 2: 1, 3: 5 }) | 0) : f.s === 'gelgit' ? wpick(rng, { 1: 4, 2: 5 }) | 0 : 1;
  for (const mod in MODG) if (g >= MODG[mod]) { const pr = own.m === mod ? 0.72 : 0.22 + 0.06 * (g - MODG[mod] === 0 ? 0 : 1); if (rng() < pr * (rest ? 0.6 : 1)) f.m.push(mod); }
  for (const en in ENVG) if (g >= ENVG[en]) { const pr = own.e === en ? (en === 'kyon' ? 0.35 : 0.78) : 0.1; if (rng() < pr * (rest ? 0.5 : 1)) f.e.push(en); }
  if (f.e.includes('degirmen') && rng() < 0.5) f.e.push('hizkanat');
  if (f.e.includes('nabiz') && rng() < 0.35) f.e.push('nabizk');
  if (g >= 1 && tw && rng() < 0.45 && (g > 0 || k >= 4)) f.x = Object.assign(f.x || {}, { shr: { f: r2(lerp(0.7, 0.55, x)), t: r2(lerp(0.9, 0.7, x)) } });
  if (g >= 3 && tw && rng() < 0.5) f.x = Object.assign(f.x || {}, { amb: { L: r2(lerp(0.5, 0.38, x)), tell: r2(lerp(0.55, 0.45, x)), n: boss && rng() < 0.4 ? 2 : 1 } });
  const nt = (x < 0.15 || rest) ? 0 : wpick(rng, { 0: x < 0.5 ? 4 : 2.5, 1: 4, 2: tw ? 2 : 0 }) | 0; f.tr.n = nt;
  if (own.tk && f.tr.n && rng() < 0.5) f.tr.k.push(own.tk);
  else if (f.s === 'kasa' && rng() < 0.4 && g >= 3) f.tr.k.push('alarm');
  else for (const tk of ['kayanT', 'diken', 'hayaletT']) if (f.m.includes({ kayanT: 'kayan', diken: 'nefes', hayaletT: 'hayalet' }[tk]) && f.tr.n && rng() < 0.3) f.tr.k.push(tk);
  if (f.tr.n) { f.tr.w = r0(lerp(26, 20, x)); f.tr.g = r0(lerp(12, 7, x)); }
  return f;
};
const attach = (f, q) => { const P = PSCH(q), p = {}; for (const t of [].concat(f.m, f.e)) { const key = { hizkanat: 'degirmen', nabizk: 'nabiz', deg3: 'degirmen', kyon: 'kasa' }[t] || t; if (P[key]) for (const kk in P[key]) p['m.' + key + '.' + kk] = P[key][kk]; }
  if (f.s === 'kasa' || f.s === 'gelgit' || f.s === 'isin') for (const kk in P[f.s]) p['m.' + f.s + '.' + kk] = P[f.s][kk];
  if (f.s === 'kasa' && f.m.includes('kayan')) p['m.kasa.gap'] = Math.max(p['m.kasa.gap'] || 0, 2 * p['m.kayan.amp'] + 10);   /* komşu kayan kasa pimleri uçlarda üst üste binmesin */
  if (f.tr.k.includes('alarm')) for (const kk in P.kasa) p['m.kasa.' + kk] = p['m.kasa.' + kk] != null ? p['m.kasa.' + kk] : P.kasa[kk];
  f.p = p; return f; };

/* risk eğrisi: yükselen rampa × cümle (5'lik: ısın, yüksel, yüksel, sıçra, dinlen) × ısınma/patron */
const shapeOf = (N, gamma, rng) => {
  const s = [], mod = [0.55, 0.9, 1.1, 1.8, 0.45];
  for (let i = 0; i < N; i++) { const x = i / (N - 1); let v = (0.38 + Math.pow(x, gamma)) * mod[i % 5] * (0.92 + 0.16 * rng()); if (i < 2) v *= 0.7; if (i === N - 2) v *= 0.6; if (i === N - 1) v = Math.max(v, 1.1) * 1.6; s.push(v); }
  const m = s.reduce((a, b) => a + b, 0) / N; return s.map(v => clamp(v / m, 0.42, 3.2));
};
const vNomOf = (N, k, g) => { const a = 168 + 7 * (k - 1) + 1.5 * g, b = a + 78 + 4 * k; return Array.from({ length: N }, (_, i) => lerp(a, b, Math.pow(i / (N - 1), 0.85))); };

/* açısal doluluk sınırı (≤ 300°) bu dalga için en çok kaç derece genişliğe izin verir */
const dCap = f => { const n = f.s === 'kasa' ? clamp(f.n, 2, 3) : f.s === 'isin' ? 1 : f.n, A = (f.m || []).includes('kayan') ? 2 * K.gp(f, 'kayan.amp') + 8 : 0, tr = f.tr && f.tr.n ? f.tr.n * ((f.tr.w != null ? f.tr.w : 26) + 2 * (f.tr.g != null ? f.tr.g : 20)) : 0, kg = f.s === 'kasa' ? (n - 1) * K.gp(f, 'kasa.gap') : 0; return (297 - tr - kg) / n - A; };
/* (v, d) çöz: dalganın modeldeki riski hedefe eşit olsun */
const solveWave = (f, rT, v0, sg, av) => {
  let v = Math.max(VMIN, v0), d = 30; const w = Object.assign({}, f, { v, d }), DM = Math.min(DMAX, dCap(f));
  const R = dd => { w.d = dd; w.v = v; return K.waveRisk(w, sg, av, 1); };
  for (let it = 0; it < 9; it++) {
    let lo = DMIN, hi = DM;
    if (R(lo) <= rT) { d = lo; if (v >= VMAX - 0.5) break; v = Math.min(VMAX, v * 1.06); continue; }
    if (R(hi) >= rT) { d = hi; if (v <= VMIN + 0.5) break; v = Math.max(VMIN, v / 1.06); continue; }
    for (let j = 0; j < 14; j++) { const m = (lo + hi) / 2; if (R(m) > rT) lo = m; else hi = m; }
    d = (lo + hi) / 2; break;
  }
  return { v: r0(v), d: r1(d) };
};
const STY = { b: 1, t: 0.84, f: 1.14, r: 0.9 };   /* üslup: sıkı (yavaş, dar), hızlı (hızlı, geniş), dengeli, dinlenme */
const build = (figs, shape, vNom, sty, lam, sg, av) => {
  const W = []; let prev = null;
  for (let i = 0; i < figs.length; i++) {
    let v0 = vNom[i] * STY[sty[i]]; if (prev) v0 = clamp(v0, prev.v * 0.7, prev.v * 1.4);
    const s = solveWave(figs[i], clamp(lam * shape[i], 0.004, 1.1), v0, sg, av);
    W.push(Object.assign({}, figs[i], s)); prev = s;
  }
  return W;
};
const dial = (figs, shape, vNom, sty, sg, av, z, pt = 0.5) => {
  let lo = Math.log(0.01), hi = Math.log(2.5), best = null;
  for (let i = 0; i < 14; i++) { const m = (lo + hi) / 2, W = build(figs, shape, vNom, sty, Math.exp(m), sg, av), p = K.passProb({ z, w: W }, sg); best = { W, lam: Math.exp(m), p }; if (p > pt) lo = m; else hi = m; }
  return best;
};

/* kadro: dalga şekilleri, tekrar ve sahiplik kuralları, ağırlık hedefi */
/* YUMUŞAK RAMPA (kullanıcı: "her pim vuruşunda belli kuralda hızlansın, pim boyu zorluğa göre küçülsün, yavaşça zorlaşsın, ani zıplama olmasın"):
   hız dalga dalga doğrusal artar ve her dalga içinde vuruş başına bir sonraki dalganın hızına doğru ilerler (v → v1); genişlik bölüm boyunca doğrusal küçülür.
   Tüm bölümün zorluğu TEK çarpan lam (0 kolay uç, 1 zor uç; dışına taşabilir) ile ayarlanır, dalga başına tek tek çözülmez. */
const RAMP = { vLo: [165, 195], vHi: [195, 285], dLo: [42, 36], dHi: [34, 20] };
const build2 = (figs, lam) => {
  const N = figs.length, vS = lerp(RAMP.vLo[0], RAMP.vHi[0], lam), vE = lerp(RAMP.vLo[1], RAMP.vHi[1], lam), dS = lerp(RAMP.dLo[0], RAMP.dHi[0], lam), dE = lerp(RAMP.dLo[1], RAMP.dHi[1], lam);
  const vAt = i => Math.max(VMIN, lerp(vS, vE, i / N)), dAt = i => clamp(lerp(dS, dE, i / (N - 1)), DMIN, DMAX);
  return figs.map((f, i) => Object.assign({}, f, { v: r0(vAt(i)), v1: r0(vAt(i + 1)), d: r1(Math.min(dAt(i), dCap(f))) }));
};
const dial2 = (figs, k, sg, av, z, pt = 0.5) => {
  let lo = -0.6, hi = 1.4, best = null;
  for (let i = 0; i < 16; i++) { const m = (lo + hi) / 2, W = build2(figs, m), p = K.passProb({ z, w: W }, sg); best = { W, lam: m, p }; if (p > pt) lo = m; else hi = m; }
  return best;
};
const castFor = (g, k, N, rng) => {
  const figs = [], sigs = []; let ownN = 0;
  for (let i = 0; i < N; i++) {
    const x = i / (N - 1), boss = i === N - 1, cap = Math.min(3, capOf(k, x, boss) + ((i % 5 === 3 && x > 0.2) ? 1 : 0)), tL = lerp(0.35, 1.9, Math.pow(x, 0.9)) * lerp(0.9, 1.15, (k - 1) / 4) * (boss ? 1.5 : [0.8, 1, 1.1, 1.3, 0.7][i % 5]);
    let bestF = null, bestS = -1e9;
    for (let t = 0; t < 36; t++) {
      const f = attach(sample(rng, g, k, x, i % 5, boss), x * 0.7 + (k - 1) / 4 * 0.3);
      if (!compat(f) || mechsOf(f).length > cap || dCap(f) < (boss ? 30 : 34)) continue;
      const own = ownOf(g, f), sg = K.sigOf(f);
      let sc = -Math.abs(K.loadOf(f) - tL) * 1.2;
      if (sigs.slice(-3).includes(sg)) sc -= 2.5; else if (sigs.slice(-6).includes(sg)) sc -= 0.6;
      const q = ownN / Math.max(1, i); if (g > 0) sc += own ? (q < 0.62 ? 1.4 : 0.2) : (q > 0.8 ? 0.8 : -0.2);
      if (i < (k === 1 ? 3 : 1) && g > 0) sc += (own && mechsOf(f).length <= 2 ? 2.2 : -1.5);
      if (boss) sc += 0.4 * mechsOf(f).length + (own ? 1 : -1);
      sc += rng() * 0.3; if (sc > bestS) { bestS = sc; bestF = f; }
    }
    if (!bestF) bestF = attach({ s: 'tek', n: 2, m: [], e: [], tr: { n: 0, k: [] }, x: null, p: {} }, 0.3);
    figs.push(bestF); sigs.push(K.sigOf(bestF)); if (ownOf(g, bestF)) ownN++;
  }
  return figs;
};
const ownOf = (g, f) => { const o = PK[g].own; if (g === 0) return true; return (o.m && (f.m || []).includes(o.m)) || (o.e && (f.e || []).includes(o.e)) || (o.st && f.s === o.st) || (o.tk && ((f.tr && f.tr.k) || []).includes(o.tk)); };

/* ---------------- ana döngü ---------------- */
const idOf = n => { const g = Math.floor((n - 1) / 5), k = (n - 1) % 5 + 1; return PK[g].id + k; };
const zOf = n => { const g = Math.floor((n - 1) / 5), k = (n - 1) % 5 + 1; return (g === 0 ? ZT0[k] : ZL[k - 1]) + DRIFT * g + ((ZF.offset || {})[PK[g].id] || 0); };
const only = opt('only') ? String(opt('only')).split(',').map(Number) : null;
const levels = {}, report = [], VC = {};
for (let n = 4; n <= 55; n++) {
  if (only && !only.includes(n)) continue;
  const g = Math.floor((n - 1) / 5), k = (n - 1) % 5 + 1, z = zOf(n), N = NW[k - 1], sg = K.sigmaOfZ(z), av = K.avOf(sg);
  let best = null;
  for (let c = 0; c < CAND; c++) {
    const rng = mulberry(SEED0 * 100003 + n * 977 + c * 31);
    const figs = castFor(g, k, N, rng), d = dial2(figs, k, sg, av, z, 1 / (1 + Math.exp(-(BIAS[idOf(n)] || 0))));
    const sc = { z, w: d.W }, viol = [].concat(...d.W.map(K.violations)); if (viol.length) { VC[viol[0]] = (VC[viol[0]] || 0) + 1; continue; }
    const Zr = K.levelZ(sc), M = K.metrics(sc, { sigma50: K.sigmaOfZ(Zr) }), score = M.hook;
    if (!best || score > best.score) best = { score, sc, Z: Zr, M, gamma: d.lam, c };
  }
  if (!best) { console.log(`Bölüm ${n} ${idOf(n)}: aday yok`, JSON.stringify(VC)); continue; }
  levels[idOf(n)] = best.sc;
  const own = best.sc.w.filter(w => ownOf(g, w)).length, vs = best.sc.w.map(w => w.v), ds = best.sc.w.map(w => w.d);
  report.push([n, idOf(n), z, r1(best.Z), r0(best.M.hook), N, r0(own / N * 100) + '%', r0(Math.min(...vs)) + '-' + r0(Math.max(...vs)), r0(Math.min(...ds)) + '-' + r0(Math.max(...ds)), r0(best.M.total) + 'sn', 'B' + r2(best.M.B), 'A' + r2(best.M.A), 'erk' + r2(best.M.early), 'geç' + r2(best.M.late), 'λ' + r2(best.gamma), 'zayıf:' + Object.entries(best.M.parts).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([k, v]) => k + r2(v)).join(',')]);
  console.log(report[report.length - 1].join(' '));
}
const outf = new URL('./kzm-levels.json', import.meta.url).pathname;
const old = fs.existsSync(outf) ? JSON.parse(fs.readFileSync(outf, 'utf8')) : {};
fs.writeFileSync(outf, JSON.stringify(Object.assign(old, levels)));
if (report.length) console.log('kanca ort', r1(report.reduce((a, b) => a + b[4], 0) / report.length), ' Z sapma ort', r2(report.reduce((a, b) => a + Math.abs(b[3] - b[2]), 0) / report.length));

/* oyuna yaz: src/game.html içindeki işaretler arası (kısa sözdizimi: anahtarsız tırnak) */
if (opt('write')) {
  const all = JSON.parse(fs.readFileSync(outf, 'utf8')), ser = o => { if (Array.isArray(o)) return '[' + o.map(ser).join(',') + ']'; if (o && typeof o === 'object') return '{' + Object.entries(o).filter(([, v]) => !(v == null || (Array.isArray(v) && !v.length) || (v && typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length))).map(([k, v]) => (/^[A-Za-z_]\w*$/.test(k) ? k : JSON.stringify(k)) + ':' + ser(v)).join(',') + '}'; return JSON.stringify(o); };
  const body = Object.keys(all).map(id => `${id}:${ser({ z: all[id].z, w: all[id].w.map(w => { const o = Object.assign({}, w); if (o.tr && !o.tr.n) delete o.tr; return o; }) })},`).join('\n');
  const p = new URL('../src/game.html', import.meta.url).pathname; let s = fs.readFileSync(p, 'utf8');
  const a = s.indexOf('/*BL_SC-START*/'), b = s.indexOf('/*BL_SC-END*/'); if (a < 0 || b < 0) throw new Error('BL_SC işaretleri yok');
  fs.writeFileSync(p, s.slice(0, a + 15) + '\n' + body + '\n' + s.slice(b)); console.log('src/game.html güncellendi:', Object.keys(all).length, 'bölüm');
}
