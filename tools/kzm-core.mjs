/* KZM — Kıl Payı Zorluk Modeli (çekirdek), 2026-11-19.
   Kullanıcı: "her pim, ibre hızı, ters dönme, nabız gibi şeylerin zorluğa, sıkıcılığa, kancaya etkisini matematiksel formüllerle hesapla; her parkurun
   1. bölümü %75, 2. %80, 3. %85 ... eşit standart; nabız ve değirmen gibi kilitlerin kendi ekstra zorluğu olsun".
   Bu dosya yalnızca matematik (oyuna girmez, tarayıcıya gerek yok). Üç katman:
     1) YÜRÜTME katmanı (fizik): ibre hızı, hedef genişliği, tuzaklar, kayan/nefes alan hedefler, gelgit, nabız => bir dokunuşun isabet penceresi ve ıska/tuzak olasılıkları.
        Oyuncu = zamanlama gürültüsü sigma (ms) + tuzaktan kaçınma av. Bot ölçümüyle (tools/kzm-calib.mjs) doğrulanır.
     2) İNSAN katmanı (HF): tahmin/hafıza/şaşırma gürültüsü. Mekaniğin kendi zorluğu: nabız, değirmen, hayalet, şipşak, ters dönme... Gürültüler VARYANS olarak eklenir:
        sigma_toplam^2 = sigma_oyuncu^2 + sum_m (c_m * d_m)^2.  d_m ms cinsinden, mekaniğin parametrelerinden fiziksel/psikofiziksel formülle (Weber oranı, ölçekli zamanlama,
        dur-sinyali tepki süresi) gelir; katsayılar tools/kzm-hf.json'da, telefon testine göre tek yerden ayarlanır. Bot (tools/bot.js) AYNI formülleri uygular (HF kipi).
     3) BÜTÜN: dalga DP'si (3 can, can pimi, gizli yardım) => bölümü geçme olasılığı P(sigma) => sigma50 (yarı yarıya geçen oyuncunun hassasiyeti) => Z puanı =
        o oyuncunun refleks YÜZDELİĞİ (Z=75: oyuncuların en iyi %25'inin alt sınırı bölümü yarı yarıya geçer).
   Ek ölçüler: sıkılma B (tekdüzelik, ölü zaman, JND altı adım), şaşırtma yoğunluğu A (olay sıklığı), gerilim (ölümün bölümde nerede olduğu), kanca H. */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));

/* ---------------- motor sabitleri (src/game.html ile aynı) ---------------- */
export const ENG = {
  GRACE: 0.05 * 180 / Math.PI,          // CFG.grace 0,05 rad = 2,865° her iki yanda
  LIVES: 3, DMG: [1, 2],                // ıska 1, tuzak 2
  OMMIN: 155, WMIN: 18, WMAX: 46,       // betikli bölümlerde taban hız ve genişlik sınırı (°/sn, °)
  HELP: [1.2, 1.4], HELPAT: [1, 3],     // gizli yardım: 1 kayıptan sonra ×1,2; 3'ten sonra ×1,4
  LIFE: { from: 4, p: 0.35, w: 0.6, amp: 24, f: 0.55, attempt: 0.9 },   // Kaçan can pimi
  SPAWN: [1.0, 5.6],                    // hedefin ibreden uzaklığı (rad) aralığı
};

/* ---------------- oyuncu nüfusu (laboratuvarla aynı) ---------------- */
export const TIERS = [
  { id: 'kusursuz', s: 12, av: 1.00, share: 1 },
  { id: 'pro', s: 20, av: 1.00, share: 4 },
  { id: 'usta', s: 30, av: 0.95, share: 10 },
  { id: 'iyi', s: 50, av: 0.90, share: 20 },
  { id: 'orta', s: 80, av: 0.75, share: 35 },
  { id: 'acemi', s: 100, av: 0.65, share: 20 },
  { id: 'yeni', s: 120, av: 0.50, share: 10 },
];
/* en iyiden başlayarak her kademenin orta yüzdeliği */
const MID = (() => { let c = 0; return TIERS.map(t => { const m = c + t.share / 2; c += t.share; return m; }); })();
const LS = TIERS.map(t => Math.log(t.s));
/* pctBetter(s): nüfusun yüzde kaçı s ms'den daha hassas (daha iyi); log-doğrusal arakesit */
export const pctBetter = s => {
  const ls = Math.log(s);
  if (ls <= LS[0]) return MID[0] * (s / TIERS[0].s);
  const n = TIERS.length - 1;
  if (ls >= LS[n]) return Math.min(99.5, MID[n] + (100 - MID[n]) * 0.9 * (1 - TIERS[n].s / s));
  for (let i = 0; i < n; i++) if (ls <= LS[i + 1]) { const u = (ls - LS[i]) / (LS[i + 1] - LS[i]); return MID[i] + (MID[i + 1] - MID[i]) * u; }
  return 50;
};
/* Z: s ms hassasiyetli oyuncunun refleks yüzdeliği (yüksek = nadir iyi) */
export const zOfSigma = s => 100 - pctBetter(s);
export const sigmaOfZ = z => { let lo = 3, hi = 600; for (let i = 0; i < 60; i++) { const m = Math.sqrt(lo * hi); if (zOfSigma(m) > z) lo = m; else hi = m; } return Math.sqrt(lo * hi); };
export const avOf = s => {
  const ls = Math.log(s);
  if (ls <= LS[0]) return TIERS[0].av;
  const n = TIERS.length - 1;
  if (ls >= LS[n]) return TIERS[n].av;
  for (let i = 0; i < n; i++) if (ls <= LS[i + 1]) { const u = (ls - LS[i]) / (LS[i + 1] - LS[i]); return TIERS[i].av + (TIERS[i + 1].av - TIERS[i].av) * u; }
  return 0.75;
};

/* ---------------- sayısal yardımcılar ---------------- */
export const erf = x => { const t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
export const Phi = x => 0.5 * (1 + erf(x / Math.SQRT2));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
/* Gauss-Hermite (olasılıkçı) 5 nokta: oturum "formu" log-normal (bot: exp(N(0,0,25))) */
const GH = [[-2.856970, 0.011257], [-1.355626, 0.222076], [0, 0.533333], [1.355626, 0.222076], [2.856970, 0.011257]];
export const noiseComps = sigma => {
  const lam = 0.01 + 0.15 * sigma / 1000, out = [];
  for (const [z, w] of GH) { const s = sigma * Math.exp(0.25 * z); out.push({ w: w * (1 - lam), s }, { w: w * lam, s: 3 * s }); }
  return out;
};

/* ---------------- insan katsayıları (HF): tools/kzm-hf.js (bot da aynısını kullanır) ---------------- */
import './kzm-hf.js';
const K = globalThis.KZM_HF;
export const HF0 = K.HF0;
export const getHF = () => K.HF;
const hfFile = join(HERE, 'kzm-hf.json');
export const setHF = o => K.setHF(o);
if (existsSync(hfFile)) { try { K.setHF(JSON.parse(readFileSync(hfFile, 'utf8'))); } catch (e) { /* bozuk dosya yok sayılır */ } }
export const HFv = () => K.HF;

/* ---------------- dalga betiği ----------------
   w = { s:'tek'|'cift'|'kasa'|'isin'|'gelgit', n, m:[kayan|nefes|hayalet|ani], e:[nabiz|nabizk|degirmen|deg3|hizkanat|kyon|serit], tr:{n,w,g,k:[kayanT|diken|hayaletT|alarm|tuzakk]},
         v (°/sn), v1 (°/sn), d (°), p:{'m.<tür>.<ayar>':değer}, x:{shr:{f,t}, amb:{L,tell,n}} } */
export const DEF = K.DEF;
export const gp = K.gp, has = K.has, nTargets = K.nTargets, sigmaX = K.sigmaX;
const vAvg = K.vAvg;

/* ---------------- hedef senaryoları: ibre hızı, kayma, nefes, daralma dağılımları ---------------- */
const lin = (a, b, n) => Array.from({ length: n }, (_, i) => a + (b - a) * (i + 0.5) / n);
/* hedefteki ibre hızı çarpanı dağılımı: [{w, m}] */
const speedScen = w => {
  const out = [];
  if (w.s === 'gelgit') {
    const tv = gp(w, 'gelgit.tideV'), tw = gp(w, 'gelgit.tideW'), base = 0.88, f = s => base + tv * s * s * (3 - 2 * s);
    // 0,54: hedef bandın hemen dışında (taban hız); 0,46: ibrenin önünde rastgele (bandın içine düşme olasılığı 2w/2π)
    const pin = Math.min(1, (2 * tw) / (2 * Math.PI));
    out.push({ w: 0.54 + 0.46 * (1 - pin), m: base });
    for (const s of lin(0, 1, 6)) out.push({ w: 0.46 * pin / 6, m: f(s) });
  } else out.push({ w: 1, m: 1 });
  if (has(w, 'nabiz')) {
    const base = gp(w, 'nabiz.base'), pow = gp(w, 'nabiz.pow'), per = gp(w, 'nabiz.per'), ex = has(w, 'nabizk') ? gp(w, 'nabiz.extra') : 0;
    const beats = (x) => (x ? [0, 0.24, 0.62] : [0, 0.24]);
    const mu = u => { let bo = 0; for (const b of beats(false)) { const d = u - b; if (d >= 0 && d < 0.15) bo = Math.max(bo, 1 - d / 0.15); } return base + pow * bo; };
    const mu3 = u => { let bo = 0; for (const b of beats(true)) { const d = u - b; if (d >= 0 && d < 0.15) bo = Math.max(bo, 1 - d / 0.15); } return base + pow * bo; };
    const prev = out.splice(0), N = 28, nb = [];
    for (let i = 0; i < N; i++) { const u = (i + 0.5) * per / N; nb.push({ w: (1 - ex) / N, m: mu(u) }); if (ex > 0) nb.push({ w: ex / N, m: mu3(u) }); }
    for (const a of prev) for (const b of nb) out.push({ w: a.w * b.w, m: a.m * b.m });
  }
  return out;
};
/* göreli hız çarpanı (kayan hedef): |1 + kappa cos(theta)| */
const slideScen = (w, m) => {
  if (!has(w, 'kayan')) return [{ w: 1, r: 1 }];
  const A = gp(w, 'kayan.amp'), f = gp(w, 'kayan.f'), kap = (A * 2 * Math.PI * f) / (vAvg(w) * m);
  return lin(0, Math.PI, 12).map(th => ({ w: 1 / 12, r: Math.max(0.15, Math.abs(1 + kap * Math.cos(th))) }));
};
const breathScen = w => {
  if (!has(w, 'nefes')) return [{ w: 1, k: 1 }];
  const a = gp(w, 'nefes.a') / 100;
  return lin(0, Math.PI, 8).map(ph => ({ w: 1 / 8, k: 1 - a * (0.5 - 0.5 * Math.cos(ph)) }));
};

/* model → oyun kalibrasyon çarpanı (HF.cal): dalgadaki mekaniklerin çarpımı */
const calOf = w => { const C = K.HF.cal, hs = t => has(w, t); let c = 1;
  if (hs('nefes')) c *= C.nefes; if (hs('ani')) c *= C.ani; if (hs('nabiz')) c *= C.nabiz; if (hs('serit')) c *= C.serit; if (hs('degirmen')) c *= C.degirmen;
  if (w.s === 'kasa') c *= C.kasa; if (w.s === 'gelgit') c *= C.gelgit; if (w.s === 'isin') c *= C.isin;
  if (hs('hayaletT')) c *= C.hayaletT; if (hs('kayanT')) c *= C.kayanT; if (hs('diken')) c *= C.diken;
  if (w.s === 'cift') c *= C.cift; if (hs('kayan')) c *= C.kayan; if (hs('hayalet')) c *= C.hayalet; if (w.tr && w.tr.n) c *= C.trapM; if (hs('alarm')) c *= C.alarm; if (w.x && w.x.shr) c *= C.shr; if (hs('kyon')) c *= C.kyon; return c; };
/* tek bir hedefin sonuç olasılıkları: {pH, pM, pT, pA} (bir geçişte) */
export const targetProbs = (w, idx, sigma, av, help = 1) => {
  const v0 = vAvg(w), n = nTargets(w), comps = noiseComps(sigma), sx = sigmaX(w, idx, help);
  const kasa = w.s === 'kasa';
  const hk = kasa ? gp(w, 'kasa.hk') : 1, h0 = (w.d * help / 2) * hk;
  const A = has(w, 'kayan') ? gp(w, 'kayan.amp') : 0;
  const shrF = w.x && w.x.shr ? 1 - K.HF.cal.shrEff * (1 - w.x.shr.f) : 1;
  const tr = w.tr || {}, trN = tr.n || 0, wT = tr.w != null ? tr.w : 1.1 * w.d, gT = tr.g != null ? tr.g : 20;
  const piSide = Math.min(1, trN / (2 * Math.max(1, kasa ? 1 : n)));
  const alarm = kasa && n >= 3 && (tr.k || []).includes('alarm');
  const diken = has(w, 'diken') && has(w, 'nefes');
  let pH = 0, pM = 0, pT = 0, pA = 0, wsum = 0;
  const calT = K.HF.cal.trap || 1;
  for (const sp of speedScen(w)) {
    const v = v0 * sp.m;
    for (const sl of slideScen(w, sp.m)) for (const br of breathScen(w)) {
      const wt = sp.w * sl.w * br.w, vr = v * sl.r;
      const h = h0 * br.k * shrF, Th = ((h + ENG.GRACE) / vr) * 1000;
      const zones = [];   // [t1,t2,weight] ms, her iki taraf ayrı
      const zt = (a1, a2, wz) => { const t1 = (a1 / v) * 1000, t2 = (a2 / v) * 1000; zones.push([t1, t2, wz], [-t2, -t1, wz]); };
      if (trN > 0) zt(h0 + A + gT + ENG.GRACE * 0, h0 + A + gT + wT, piSide * calT);
      if (alarm) {
        const step = 2 * h0 + gp(w, 'kasa.gap'), free = step - 2 * h0, aw = clamp(free / 2 - ENG.GRACE, 5.7, 10.3);
        const side = idx === 0 ? [0.5] : idx === n - 1 ? [0.5] : [0.5, 0.5];   // alarm kendi komşu aralığına 1/2 olasılıkla düşer
        for (const ws of side) { const t1 = ((step / 2 - aw) / v) * 1000, t2 = ((step / 2 + aw) / v) * 1000; zones.push([t1, t2, ws], [-t2, -t1, 0]); }
      }
      if (diken) { const hb = (h0 + ENG.GRACE) / v * 1000; if (hb > Th) zones.push([Th, hb, 1], [-hb, -Th, 1]); }
      for (const c of comps) {
        const std = Math.sqrt(c.s * c.s + sx * sx), ww = wt * c.w;
        const hit = 2 * Phi(Th / std) - 1;
        let pz = 0;
        for (const [t1, t2, wz] of zones) if (wz) pz += wz * (Phi(t2 / std) - Phi(t1 / std));
        pz = Math.min(pz, 1 - hit);
        pH += ww * hit; pT += ww * pz * (1 - av); pA += ww * pz * av; pM += ww * (1 - hit - pz);
        wsum += ww;
      }
    }
  }
  const P = { pH: pH / wsum, pM: pM / wsum, pT: pT / wsum, pA: pA / wsum, sx, Th: null }, fail = P.pM + P.pT, cc = calOf(w);
  if (cc !== 1 && fail > 0) { const s = Math.min(fail * cc, 1 - P.pA - 0.02) / fail; P.pM *= s; P.pT *= s; P.pH = 1 - P.pA - P.pM - P.pT; }
  return P;
};

/* dalgadaki ek hasar olayları (ters dönme): [{p, d}] */
export const waveEvents = (w, sigma, dur) => {
  const ev = [];
  const pf = K.pfAmb;
  if (w.x && w.x.amb) { const a = w.x.amb; for (let i = 0; i < (a.n || 1); i++) ev.push({ p: Math.min(0.97, K.HF.mult.amb * K.HF.cal.ambEv * pf(a.tell, a.L)), d: 1 }); }
  if (has(w, 'kyon')) {
    const F = gp(w, 'kasa.flip'), tell = gp(w, 'kasa.tell'), nf = dur / F, pd = 0.6;   // flip dalga içinde pd olasılıkla bir hedefin yaklaşmasına denk gelir
    ev.push({ p: Math.min(0.9, K.HF.cal.kyonEv * nf * pd * pf(tell, 0.35)), d: 1 });
  }
  return ev;
};

/* ---------------- dalga süresi (sn), tahmini ---------------- */
export const waveDur = (w, risk = 0) => {
  const om = vAvg(w) * Math.PI / 180, n = nTargets(w), lo = ENG.SPAWN[0], hi = ENG.SPAWN[1];
  let arc = lo + (hi - lo) * n / (n + 1);
  if (w.s === 'kasa') arc = 1.4 + (n - 1) * 0.6;
  if (w.s === 'isin') arc = 4.0;
  let t = arc / om + 0.25;
  if (w.s === 'cift' && n > 1) t += (n - 1) * 0.3 * (2 * Math.PI / om);
  if (w.s === 'isin') t += 0.5;
  if (has(w, 'serit')) t += 0.8;
  if (w.x && w.x.amb) t += (w.x.amb.n || 1) * 0.5 * (2 * Math.PI / om) * 0.7;
  return t + risk * (2 * Math.PI / om);
};

/* ---------------- DP: yaşayan can dağılımı ---------------- */
const tgtChain = (dist, pr) => {
  // pr: {pH,pM,pT,pA}; tekrar denemeli: f_L = s d_L + m f_{L-1} + t f_{L-2}
  const nz = pr.pH + pr.pM + pr.pT;
  const s = nz > 1e-12 ? pr.pH / nz : 0, m = nz > 1e-12 ? pr.pM / nz : 1, t = nz > 1e-12 ? pr.pT / nz : 0;
  const L = ENG.LIVES, F = [];   // F[l][j]: l can ile başlayıp j can ile biter (j=0: öldü)
  for (let l = 0; l <= L; l++) { F[l] = new Array(L + 1).fill(0); if (l === 0) { F[0][0] = 1; continue; } F[l][l] += s; for (let j = 0; j <= L; j++) { F[l][j] += m * F[l - 1][j] + t * (l >= 2 ? F[l - 2][j] : (j === 0 ? 1 : 0)); } }
  const out = new Array(L + 1).fill(0);
  for (let l = 0; l <= L; l++) if (dist[l]) for (let j = 0; j <= L; j++) out[j] += dist[l] * F[l][j];
  return out;
};
const applyEvent = (dist, p, d) => { const L = ENG.LIVES, out = new Array(L + 1).fill(0); for (let l = 0; l <= L; l++) { if (!dist[l]) continue; if (l === 0) { out[0] += dist[l]; continue; } out[l] += dist[l] * (1 - p); out[Math.max(0, l - d)] += dist[l] * p; } return out; };

/* Kaçan can pimi: bir denemede başarı olasılığı (dar, hızlı kayan pin) */
const lifePinQ = (w, sigma, av, help) => {
  const L = ENG.LIFE, d = Math.max(0.06 * 2 * 180 / Math.PI, (w.d || 30) * L.w * help);
  const ww = { s: 'tek', n: 1, m: ['kayan'], e: [], v: vAvg(w), d, p: { 'm.kayan.amp': L.amp, 'm.kayan.f': L.f } };
  return targetProbs(ww, 0, sigma, av, 1);
};

/* Bölüm: P(geç), ölüm kütlesi (dalga başına), yardım/deneme */
export const levelDP = (script, sigma, av = avOf(sigma), opt = {}) => {
  const help = opt.help || 1, W = script.w, L = ENG.LIVES, lifeOn = script.lifePin !== false && (opt.lifePin !== false) && (script.lifeFrom == null ? true : script.lifeFrom);
  let dist = new Array(L + 1).fill(0); dist[L] = 1;
  const deathAt = new Array(W.length).fill(0);
  for (let i = 0; i < W.length; i++) {
    const w = W[i], before = dist[0];
    if (lifeOn && !has(w, 'serit') && i > 0) {   // can pimi: can eksikken
      const pr = lifePinQ(w, sigma, av, help), q = pr.pH / Math.max(1e-9, pr.pH + pr.pM + pr.pT), pa = ENG.LIFE.p * ENG.LIFE.attempt;
      const out = new Array(L + 1).fill(0);
      for (let l = 0; l <= L; l++) { if (!dist[l]) continue; if (l === 0 || l === L) { out[l] += dist[l]; continue; } out[l] += dist[l] * (1 - pa); out[l + 1] += dist[l] * pa * q; out[l - 1] += dist[l] * pa * (1 - q); }
      dist = out;
    }
    const n = nTargets(w);
    for (let t = 0; t < n; t++) dist = tgtChain(dist, targetProbs(w, t, sigma, av, help));
    const dur = waveDur(w, 0.3);
    for (const e of waveEvents(w, sigma, dur)) dist = applyEvent(dist, e.p, e.d);
    deathAt[i] = dist[0] - before;
  }
  const pass = dist[1] + dist[2] + dist[3];
  return { pass, deathAt, dist };
};
export const passProb = (script, sigma, opt) => levelDP(script, sigma, opt && opt.av, opt).pass;
export const sigma50 = (script, opt) => {
  let lo = 4, hi = 500;
  if (passProb(script, lo, opt) < 0.5) return lo;
  if (passProb(script, hi, opt) > 0.5) return hi;
  for (let i = 0; i < 28; i++) { const m = Math.sqrt(lo * hi); if (passProb(script, m, opt) > 0.5) lo = m; else hi = m; }
  return Math.sqrt(lo * hi);
};
export const levelZ = (script, opt) => zOfSigma(sigma50(script, opt));

/* yardımlı denemeler: P(n denemede geçer) ve beklenen deneme (kayıp başına genişleme) */
export const attempts = (script, sigma, maxN = 40) => {
  const mul = f => (f >= ENG.HELPAT[1] ? ENG.HELP[1] : f >= ENG.HELPAT[0] ? ENG.HELP[0] : 1);
  let alive = 1, E = 0; const cum = [];
  for (let n = 1; n <= maxN; n++) { const p = passProb(script, sigma, { help: mul(n - 1) }); E += alive; alive *= 1 - p; cum.push(1 - alive); }
  return { E, cum, p1: cum[0] };
};

/* ---------------- dalga başına risk (sonsuz canla beklenen hasar) ---------------- */
export const waveRisk = (w, sigma, av = avOf(sigma), help = 1) => {
  let r = 0; const n = nTargets(w);
  for (let t = 0; t < n; t++) {
    const p = targetProbs(w, t, sigma, av, help), nz = p.pH + p.pM + p.pT, s = Math.max(1e-6, p.pH / nz);
    r += Math.min(9, (p.pM / nz + 2 * p.pT / nz) / s);
  }
  for (const e of waveEvents(w, sigma, waveDur(w, 0.3))) r += e.p * e.d;
  return r;
};

/* ---------------- bilişsel yük, imza, şaşırtma olayları ---------------- */
export const LOAD = { tek: 0.15, cift: 0.3, kasa: 0.45, isin: 0.55, gelgit: 0.45, serit: 0.55, kayan: 0.3, nefes: 0.3, hayalet: 0.45, ani: 0.55, nabiz: 0.6, nabizk: 0.15, degirmen: 0.7, hizkanat: 0.25, deg3: 0.1, kyon: 0.55, amb: 0.6, shr: 0.25,
  tuzak: 0.1, kayanT: 0.3, diken: 0.3, hayaletT: 0.35, alarm: 0.3, tuzakk: 0.2 };
export const loadOf = w => {
  let c = LOAD[w.s] || 0.2; if (w.s === 'cift') c += 0.1 * Math.max(0, (w.n || 2) - 2);
  let nm = 1;
  for (const m of w.m || []) { c += LOAD[m] || 0; nm++; }
  for (const e of w.e || []) { c += LOAD[e] || 0; if (!['nabizk', 'hizkanat', 'deg3'].includes(e)) nm++; }
  if (w.x && w.x.shr) { c += LOAD.shr; nm++; } if (w.x && w.x.amb) { c += LOAD.amb; nm++; }
  const tr = w.tr || {}; c += 0.1 * Math.min(3, tr.n || 0); for (const k of tr.k || []) c += LOAD[k] || 0.2;
  return c * (1 + 0.15 * Math.max(0, nm - 2));
};
export const sigOf = w => [w.s, (w.m || []).slice().sort().join('+'), (w.e || []).filter(e => !['nabizk', 'deg3'].includes(e)).sort().join('+'), (w.x && w.x.shr ? 'S' : '') + (w.x && w.x.amb ? 'A' : ''), (w.tr && w.tr.n ? 'T' + Math.min(2, w.tr.n) : '')].join('|');
export const surprises = (w, dur) => {
  let k = 0; if (w.x && w.x.amb) k += w.x.amb.n || 1; if (has(w, 'kyon')) k += dur / gp(w, 'kasa.flip'); if (has(w, 'ani')) k += 0.35 * nTargets(w); if (has(w, 'hizkanat')) k += dur / gp(w, 'degirmen.chg');
  return k;
};

/* ---------------- adalet kuralları (kesin kurallar): ihlaller listesi ---------------- */
export const violations = w => {
  const o = [], v = Math.min(w.v, w.v1 || w.v);
  if (v < ENG.OMMIN - 0.01) o.push(`hız ${v} < ${ENG.OMMIN}`);
  if (w.d < ENG.WMIN - 0.01 || w.d > ENG.WMAX + 0.01) o.push(`genişlik ${w.d}`);
  if (w.x && w.x.amb && (w.x.amb.tell < 0.4 - 1e-9)) o.push('ters dönme uyarısı < 0,4 sn');
  if (has(w, 'kyon') && gp(w, 'kasa.tell') < 0.4 - 1e-9) o.push('kyon uyarısı < 0,4 sn');
  if (has(w, 'ani') && gp(w, 'ani.lead') * (has(w, 'yakin') ? gp(w, 'ani.near') : 1) < 0.4 - 1e-9) o.push('şipşak payı < 0,4 sn');
  if (has(w, 'hayalet') && gp(w, 'hayalet.vis') < 0.5) o.push('hayalet görünür kalma < 0,5 sn');
  if (w.s === 'kasa') { const h0 = (w.d / 2) * gp(w, 'kasa.hk'), gap = gp(w, 'kasa.gap'); if (gap < 12) o.push('kasa aralığı < 12°'); if (has(w, 'kayan')) { const A = gp(w, 'kayan.amp'); if (2 * A + 2 * h0 + 6 > 2 * h0 + gap + 2 * h0 * 0 + 2 * h0) o.push('kasa + kayan: genlik komşuya biner'); } }
  // açısal doluluk: hedefler + tuzaklar + boşluklar ≤ 300°
  const n = nTargets(w), tr = w.tr || {}, occ = n * (w.d + (has(w, 'kayan') ? 2 * gp(w, 'kayan.amp') : 0)) + (tr.n || 0) * ((tr.w != null ? tr.w : 1.1 * w.d) + 2 * (tr.g != null ? tr.g : 20)) + (w.s === 'kasa' ? (n - 1) * gp(w, 'kasa.gap') : 0);
  if (occ > 300) o.push(`açısal doluluk ${Math.round(occ)}° > 300°`);
  return o;
};

/* ---------------- bölüm ölçüleri: sıkılma B, şaşırtma A, gerilim, kanca H ---------------- */
const JND = 0.10;
export const metrics = (script, opt = {}) => {
  const W = script.w, N = W.length, s50 = opt.sigma50 || sigma50(script), av = avOf(s50);
  const risks = W.map(w => waveRisk(w, s50, av)), durs = W.map((w, i) => waveDur(w, risks[i])), total = durs.reduce((a, b) => a + b, 0);
  const sigs = W.map(sigOf), loads = W.map(loadOf);
  // B: ölü zaman (risk çok düşük), aynı imza, JND altı adım
  const rMean = risks.reduce((a, b) => a + b, 0) / N, rMin = 0.25 * rMean;
  let B = 0;
  for (let i = 0; i < N; i++) {
    let F = 0; for (let j = Math.max(0, i - 6); j < i; j++) if (sigs[j] === sigs[i]) F += Math.exp(-(i - j) / 3);
    let b = 0.45 * (1 - Math.exp(-F / 0.8)) + 0.45 * Math.max(0, 1 - risks[i] / Math.max(1e-9, rMin));
    if (i > 0) { const rv = Math.abs(W[i].v - W[i - 1].v) / W[i - 1].v, rd = Math.abs(W[i].d - W[i - 1].d) / W[i - 1].d; if (sigs[i] === sigs[i - 1] && rv < JND && rd < JND) b += 0.2; }
    B += Math.min(1, b);
  }
  B /= N;
  // A: şaşırtma olayı yoğunluğu (olay/sn)
  let A = 0; for (let i = 0; i < N; i++) { const lam = surprises(W[i], durs[i]) / durs[i]; A += 1 - Math.exp(-((lam / 1.1) ** 2)); } A /= N;
  // ölüm dağılımı
  const dp = levelDP(script, s50, av), dm = dp.deathAt, dsum = dm.reduce((a, b) => a + b, 0) || 1;
  let early = 0, late = 0; for (let i = 0; i < N; i++) { if (i < 0.3 * N) early += dm[i] / dsum; if (i >= 0.6 * N) late += dm[i] / dsum; }
  // çeşitlilik: imza entropisi (normalize) ve adım ödülü/şoku
  const cnt = {}; sigs.forEach(s => { cnt[s] = (cnt[s] || 0) + 1; });
  let H = 0; for (const k in cnt) { const p = cnt[k] / N; H -= p * Math.log(p); }
  const variety = clamp(H / Math.log(Math.max(2, Math.min(N, 10))), 0, 1);
  let step = 0; for (let i = 1; i < N; i++) { const rv = Math.abs(W[i].v - W[i - 1].v) / W[i - 1].v, rd = Math.abs(W[i].d - W[i - 1].d) / W[i - 1].d, r = Math.max(rv, rd); const nov = 1 - Math.exp(-((r / JND) ** 2)), shock = Math.min(1, ((Math.max(0, r - 0.3)) / 0.2) ** 2); step += nov * (1 - shock); } step /= Math.max(1, N - 1);
  const mean = rMean, sd = Math.sqrt(risks.reduce((a, b) => a + (b - mean) ** 2, 0) / N), cv = sd / Math.max(1e-9, mean);
  const viol = [].concat(...W.map(violations));
  const Z = zOfSigma(s50);
  const tension = clamp(late / 0.5, 0, 1) * Math.sqrt(clamp(1 - early / 0.2, 0, 1));
  const parts = { bored: clamp(1 - B / 0.25, 0, 1), annoy: clamp(1 - A / 0.30, 0, 1), tension, variety: 0.5 * variety + 0.5 * clamp(step / 0.5, 0, 1), rhythm: Math.exp(-(((Math.log(Math.max(0.05, cv) / 1.0)) / 0.55) ** 2)), fair: viol.length ? 0 : 1 };
  let g = 1, k = 0; for (const p in parts) { g *= Math.max(0.02, parts[p]); k++; }
  const hook = 100 * Math.pow(g, 1 / k);
  return { Z, sigma50: s50, N, total, risks, durs, loads, B, A, early, late, cv, variety, step, parts, hook, viol, passAtZ: dp.pass };
};

/* ---------------- yardımcı: biçimli döküm ---------------- */
export const describe = script => {
  const m = metrics(script);
  const lines = script.w.map((w, i) => `${String(i + 1).padStart(2)} ${(w.s + (w.n > 1 ? w.n : '')).padEnd(7)} m:${(w.m || []).join(',').padEnd(14)} e:${(w.e || []).join(',').padEnd(14)} v${String(Math.round(w.v)).padStart(3)}${w.v1 ? '→' + Math.round(w.v1) : '   '} d${String(Math.round(w.d)).padStart(3)} risk ${m.risks[i].toFixed(2)} yük ${m.loads[i].toFixed(2)} ${m.durs[i].toFixed(1)}sn`);
  return lines.join('\n') + `\nZ=${m.Z.toFixed(1)} σ50=${m.sigma50.toFixed(1)}ms  süre ${m.total.toFixed(0)}sn  B=${m.B.toFixed(2)} A=${m.A.toFixed(2)} erken=${m.early.toFixed(2)} geç=${m.late.toFixed(2)} kanca=${m.hook.toFixed(0)}  ${JSON.stringify(Object.fromEntries(Object.entries(m.parts).map(([k, v]) => [k, +v.toFixed(2)])))}${m.viol.length ? '\nİHLAL: ' + m.viol.join('; ') : ''}`;
};

/* ---------------- komut satırı: kısa kontrol ---------------- */
if (process.argv[1] && process.argv[1].endsWith('kzm-core.mjs')) {
  const cmd = process.argv[2] || 'demo';
  if (cmd === 'demo') {
    console.log('Z ↔ σ50: ' + [60, 70, 75, 80, 85, 90, 95, 98].map(z => `Z${z}=${sigmaOfZ(z).toFixed(1)}ms`).join('  '));
    const w = (d, v, extra = {}) => Object.assign({ s: 'tek', n: 2, m: [], e: [], tr: { n: 0 }, v, d }, extra);
    for (const [d, v] of [[40, 160], [36, 190], [32, 210], [28, 230], [24, 250], [20, 280]]) {
      const sc = { w: Array.from({ length: 24 }, () => w(d, v)) };
      console.log(`24 dalga, 2 hedef, d${d}° v${v}°/sn  =>  σ50 ${sigma50(sc).toFixed(1)} ms  Z ${levelZ(sc).toFixed(1)}`);
    }
  }
}
