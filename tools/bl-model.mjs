/* Bölümler zorluk modeli ölçümü: node tools/bl-model.mjs <curve|sureli|level> ...
   curve: düz pimde (Bölüm 1, hız ve genişlik sabit) zaman penceresi τ = 2·hw/ω ile orta botun vuruş başına hata oranı.
   sureli: Süreli kademelerinde orta botun vuruş başına hata oranı ve ortalama ibre hızı.
   level [iş=6] [bölümler=1-80]: her bölümün kilit katsayısını (c) ve dalga sayısını bulur, tools/bl-kf.json yazar; geçme oranlarını (orta, iyi) gösterir.
   DEBUG=1 derlemesi gerekir. */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [mode = 'curve', ...rest] = process.argv.slice(2);
const SK = { yeni: [0.12, 0.5], orta: [0.08, 0.75], iyi: [0.05, 0.9], usta: [0.03, 0.95] };
const b = await launch({ width: 390, height: 844, dpr: 1, lang: 'tr-TR', seed: 'window.requestAnimationFrame=function(){return 0};' });
/* düz pim eğrisi (curve orta, 2026-11-12): τ (sn) → vuruş başına hata oranı */
const CURVE = [[0.08, 0.4467], [0.10, 0.4097], [0.12, 0.3533], [0.15, 0.2634], [0.18, 0.1724], [0.22, 0.1369], [0.27, 0.0855], [0.33, 0.0536], [0.40, 0.0199], [0.50, 0.0158], [0.60, 0.0106]];
const pAt = tau => { for (let i = 1; i < CURVE.length; i++) if (tau <= CURVE[i][0]) { const [a, pa] = CURVE[i - 1], [c, pc] = CURVE[i], u = (tau - a) / (c - a); return Math.exp(Math.log(pa) + u * (Math.log(pc) - Math.log(pa))); } return CURVE[CURVE.length - 1][1]; };
if (mode === 'level') {
  await b.close();
  const { writeFileSync, existsSync } = await import('node:fs');
  const out = join(root, 'tools', 'bl-kf.json'), table = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : {};
  const jobs = +(rest[0] || 6), spec = rest[1] || '1-80';
  const list = spec.split(',').flatMap(p => { const [a, c] = p.split('-').map(Number); return c ? Array.from({ length: c - a + 1 }, (_, i) => a + i) : [a]; });
  const PAGE = `window.__lv = (lv, pT, T) => {
    const k = __kp, G = k.G, id = k.blId(lv);
    const meas = (c, n) => { k.BL_KF[id] = [40, c]; let h = 0, m = 0, tm = 0, wv = 0;
      for (let i = 0; i < n; i++) { runBot(0.08, 0.75, 1, 900, 1 / 60, { setup: () => { k.save.bl.f = {}; k.blStart(lv); G.bl.lives = 999; window.__t0 = G.clock; } }); h += G.n; m += G.mev; tm += G.clock - window.__t0; wv += G.bl.wave + (k.G.mode === 'blwin' ? 0 : 0); }
      return { p: m / Math.max(1, h + m), spw: tm / Math.max(1, wv) }; };
    let lo = Math.log(0.45), hi = Math.log(3.2), r, c = 1;
    if (pT < 0) { lo = hi = Math.log(-pT); }   /* sabit katsayı (Trafik: hata kırmızı ışıktan, genişlik çözmez) */
    for (let it = 0; it < (pT < 0 ? 0 : 8); it++) { c = Math.exp((lo + hi) / 2); r = meas(c, +(window.__nRuns || 20)); if (r.p > pT) lo = Math.log(c); else hi = Math.log(c); }
    c = Math.exp((lo + hi) / 2); r = meas(c, 40);
    const w = Math.max(6, Math.min(70, Math.round(T / r.spw)));
    k.BL_KF[id] = [w, c];
    const pass = sk => { let win = 0, d = 0; for (let i = 0; i < 40; i++) { runBot(sk[0], sk[1], 1, 900, 1 / 60, { setup: () => { k.save.bl.f = {}; k.blStart(lv); window.__t0 = G.clock; } }); if (G.mode === 'blwin') { win++; d += G.clock - window.__t0; } } return [win / 40, win ? d / win : 0]; };
    const po = pass([0.08, 0.75]), pi = pass([0.05, 0.9]);
    k.goMenu();
    return { id, c, w, p: r.p, po: po[0], dur: po[1], pi: pi[0] };
  };`;
  const worker = async ids => {
    const b = await launch({ width: 390, height: 844, dpr: 1, lang: 'tr-TR', seed: 'window.requestAnimationFrame=function(){return 0};' });
    try {
      await b.goto('file://' + join(root, 'www', 'index.html'));
      await b.eval(readFileSync(join(root, 'tools', 'bot.js'), 'utf8'));
      await b.eval(PAGE);
      for (const lv of ids) {
        if (await b.eval(`__kp.blSoon(${lv})`)) continue;
        const kk = await b.eval(`__kp.blGK(${lv}).k`), tau = 0.40 / [1, 1.25, 1.5625, 1.875, 2.15625][kk - 1], fixc = await b.eval(`__kp.blId(${lv}).startsWith('trafik')`), pT = fixc ? -1.25 : pAt(tau), T = [45, 50, 55, 60, 65][kk - 1];
        const r = await b.eval(`__lv(${lv}, ${pT}, ${T})`, { timeout: 1800000 });
        table[r.id] = [r.w, +r.c.toFixed(3)];
        writeFileSync(out, JSON.stringify(table));
        console.log(String(lv).padStart(2) + ' ' + r.id.padEnd(9) + ' c ' + r.c.toFixed(2) + '  dalga ' + String(r.w).padStart(2) + '  hata %' + (r.p * 100).toFixed(1) + ' (hedef ' + (pT < 0 ? 'sabit c' : '%' + (pT * 100).toFixed(1)) + ')  geçme orta %' + Math.round(r.po * 100) + ' iyi %' + Math.round(r.pi * 100) + '  süre ' + Math.round(r.dur) + ' sn');
      }
    } finally { await b.close(); }
  };
  const parts = Array.from({ length: jobs }, () => []);
  list.forEach((lv, i) => parts[i % jobs].push(lv));
  await Promise.all(parts.filter(p => p.length).map(worker));
  process.exit(0);
}
try {
  await b.goto('file://' + join(root, 'www', 'index.html'));
  await b.eval(readFileSync(join(root, 'tools', 'bot.js'), 'utf8'));
  if (mode === 'curve') {
    const sk = SK[rest[0] || 'orta'];
    for (const tau of [0.08, 0.1, 0.12, 0.15, 0.18, 0.22, 0.27, 0.33, 0.4, 0.5, 0.6]) {
      const r = await b.eval(`(()=>{const k=__kp,G=k.G;let h=0,m=0;
        window.__blForce={om:2.6,hw:${tau}*2.6/2};
        for(let i=0;i<20;i++){runBot(${sk[0]},${sk[1]},1,600,1/60,{setup:()=>{k.save.bl.f={};k.BL_KF[k.blId(1)]=[60,1];k.blStart(1);G.bl.lives=999;}});h+=G.n;m+=G.mev;}
        window.__blForce=null;k.goMenu();return [h,m];})()`, { timeout: 600000 });
      console.log('τ ' + tau.toFixed(2) + ' sn  vuruş ' + r[0] + '  hata ' + r[1] + '  hata oranı %' + (100 * r[1] / (r[0] + r[1])).toFixed(2));
    }
  } else if (mode === 'sureli') {
    const sk = SK[rest[0] || 'orta'];
    for (const lv of ['rahat', 'normal', 'usta', 'cehennem']) {
      const r = await b.eval(`(()=>{const k=__kp,G=k.G;let h=0,m=0,om=0,hw=0,c=0;window.__logChal=true;window.__chalLog=[];
        k.save.lvl='${lv}';k.setLevel&&k.setLevel('${lv}');
        for(let i=0;i<30;i++){runBot(${sk[0]},${sk[1]},1,1500,1/60);h+=G.n;m+=G.mev;}
        for(const e of __chalLog){if(e.om>0){om+=e.om;hw+=e.hw;c++;}}
        window.__logChal=false;k.goMenu();return [h,m,om/c,hw/c];})()`, { timeout: 600000 });
      console.log(lv.padEnd(9) + ' vuruş ' + r[0] + '  hata ' + r[1] + '  hata oranı %' + (100 * r[1] / (r[0] + r[1])).toFixed(2) + '  ort. ibre hızı ' + r[2].toFixed(2) + ' rad/sn  ort. hedef yarı gen. ' + r[3].toFixed(3) + ' rad');
    }
  }
} finally { await b.close(); }
process.exit(0);
