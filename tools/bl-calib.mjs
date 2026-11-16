/* ESKİ YOL (yalnız oyunla, can yenilenmesi ve hız dalgası oyunun kendisi): ASIL ARAÇ tools/bl-opt.mjs (laboratuvarın kendi ölçüm hattı ve kancası).
   Bölümler zorluk ayarı (laboratuvar hedefleriyle): node tools/bl-calib.mjs [iş sayısı] [bölümler] [koşu]
   DEBUG=1 derlemesi gerekir. Her bölüm için kilit katsayısı c'yi (pencere ×c) öyle bulur ki hedef kitlenin (oyuncu tipleri × nüfus payı × hedef ağırlığı)
   ilk denemede canı biten oranı basamağın hedefine otursun: Kolay %22 → Cehennem %62 doğrusal, her kilit grubunda +%0,3.
   Ortak tohum (aynı koşular) ile 3 adımlı kesen yöntemi; sonuç tools/bl-calib.json. Hız ve genişlik merdiveni aşağıdaki LADDER'dan oyuna yazılır. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [jobs = '8', spec = '1-80', runsArg = '20'] = process.argv.slice(2);
export const LADDER = { om: [2.9, 3.25, 3.6, 3.9, 4.2], wd: [44, 38, 33, 29, 26], wMin: 8, wMax: 60 };
const TF = { f1: 0.22, f5: 0.62, drift: 0.003 };
const target = n => { const g = Math.floor((n - 1) / 5), u = ((n - 1) % 5) / 4; return Math.min(0.98, TF.f1 + (TF.f5 - TF.f1) * u + TF.drift * g); };
/* laboratuvarın oyuncu tipleri ve nüfusu (lab.html PS0, B0: log-normal 65 ms, 0,45) */
const PS = [['kusursuz', 0.012, 1, 0.4], ['pro', 0.02, 1, 0.7], ['usta', 0.03, 0.95, 1], ['iyi', 0.05, 0.9, 1], ['orta', 0.08, 0.75, 1], ['acemi', 0.10, 0.65, 0.45], ['yeni', 0.12, 0.5, 0.15]];
const erf = x => { const t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
const cdf = ms => ms <= 0 ? 0 : 0.5 * (1 + erf((Math.log(ms) - Math.log(65)) / (0.45 * Math.SQRT2)));
const W = PS.map(([, sg, , tg], i) => { const lo = i ? Math.sqrt(PS[i - 1][1] * sg) * 1000 : 0, hi = i < PS.length - 1 ? Math.sqrt(sg * PS[i + 1][1]) * 1000 : Infinity; return ((hi === Infinity ? 1 : cdf(hi)) - cdf(lo)) * tg; });
const WS = W.reduce((a, b) => a + b, 0), WN = W.map(w => w / WS);
const R = +runsArg, RUNS = WN.map(w => Math.max(6, Math.round(R * Math.min(1, w * 4))));
const list = spec.split(',').flatMap(p => { const [a, b] = p.split('-').map(Number); return b ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a]; });
const out = existsSync(join(root, 'tools', 'bl-calib.json')) ? JSON.parse(readFileSync(join(root, 'tools', 'bl-calib.json'), 'utf8')) : {};
const logit = p => Math.log(Math.max(0.01, Math.min(0.99, p)) / (1 - Math.max(0.01, Math.min(0.99, p))));
const worker = async (mine, wi) => {
  const b = await launch({ width: 390, height: 844, dpr: 1, lang: 'tr-TR', seed: 'window.requestAnimationFrame=function(){return 0};' });
  try {
    await b.goto('file://' + join(root, 'www', 'index.html'));
    await b.eval(readFileSync(join(root, 'tools', 'bot.js'), 'utf8'));
    await b.eval(`window.__L=${JSON.stringify(LADDER)};window.__PS=${JSON.stringify(PS)};window.__RUNS=${JSON.stringify(RUNS)};window.__WN=${JSON.stringify(WN)};
      const k=__kp;Object.assign(k.BL_P,{om:__L.om.slice(),wd:__L.wd.slice(),wMin:__L.wMin,wMax:__L.wMax});
      window.__mul=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
      window.__fail=(n,c)=>{const id=k.blId(n);k.BL_KF[id]=[k.BL_KF[id]?k.BL_KF[id][0]:2,c];const R0=Math.random;let f=0;
        __PS.forEach((p,i)=>{let lose=0;for(let j=0;j<__RUNS[i];j++){Math.random=__mul(n*7919+i*104729+j*31);
          runBot(p[1],p[2],1,400,1/60,{setup:()=>{k.save.bl.f={};k.blStart(n)}});if(k.G.mode!=='blwin')lose++;k.goMenu();}
          f+=__WN[i]*lose/__RUNS[i];});Math.random=R0;return f;};0`);
    for (const n of mine) {
      const id = await b.eval(`__kp.blSoon(${n})?'':__kp.blId(${n})`); if (!id) continue;
      const T = target(n), c0 = await b.eval(`(__kp.BL_KF['${id}']||[0,1])[1]`);
      const F = async c => await b.eval(`__fail(${n},${c})`, { timeout: 590000 });
      /* kesen yöntemi logit(canı biten) ~ ln c düzleminde; en çok 6 adım, hedefe ±%1,5 yaklaşınca durur */
      const tries = []; let x = Math.log(c0), f = await F(c0); tries.push([x, f]);
      for (let it = 0; it < 5 && Math.abs(f - T) > 0.015; it++) {
        const [xa, fa] = tries.length > 1 ? tries[tries.length - 2] : [null, null];
        let sl = xa != null && Math.abs(x - xa) > 1e-3 ? (logit(f) - logit(fa)) / (x - xa) : -3;
        if (!(sl < -0.3)) sl = -3;
        x = Math.max(Math.log(0.35), Math.min(Math.log(3.2), x + (logit(T) - logit(f)) / sl));
        x = Math.log(Math.round(Math.exp(x) * 100) / 100);
        f = await F(Math.exp(x)); tries.push([x, f]);
      }
      const best = tries.reduce((a, t) => Math.abs(t[1] - T) < Math.abs(a[1] - T) ? t : a), c2 = +Math.exp(best[0]).toFixed(2), f2 = best[1];
      const x0 = tries[0][0], f0 = tries[0][1], x1 = (tries[1] || tries[0])[0], f1 = (tries[1] || tries[0])[1];
      out[id] = { n, T: +T.toFixed(3), c: c2, f: +f2.toFixed(3), tries: tries.map(t => [+Math.exp(t[0]).toFixed(2), +t[1].toFixed(3)]) };
      writeFileSync(join(root, 'tools', 'bl-calib.json'), JSON.stringify(out, null, 1));
      console.log(`${String(n).padStart(2)} ${id.padEnd(10)} hedef %${Math.round(T * 100)} → c ${c2} canı biten %${Math.round(f2 * 100)}  (${tries.length} adım)`);
    }
  } finally { await b.close(); }
};
if (process.argv[1] && process.argv[1].endsWith('bl-calib.mjs')) {
  console.log('ağırlık', PS.map((p, i) => p[0] + ' ' + (WN[i] * 100).toFixed(0) + '% ×' + RUNS[i]).join(', '));
  const J = +jobs, parts = Array.from({ length: J }, () => []); list.forEach((n, i) => parts[i % J].push(n));
  await Promise.all(parts.filter(p => p.length).map(worker));
  process.exit(0);
}
