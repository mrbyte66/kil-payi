/* Yeni parkur dalga süresi ölçümü: node tools/pk-cal.mjs [beceri] [n] [bölümler] — en az süre kapısı kapalı (window.__noMinT), geçen koşuların süresi/dalga sayısı;
   hedef: bölüm 4+ için PK_ROWS.w × saniye/dalga ≥ ~55 sn (DEBUG=1). */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [skill = 'pro', n = '4', spec = '1-55'] = process.argv.slice(2);
const SK = { yeni: [0.12, 0.5], orta: [0.08, 0.75], iyi: [0.05, 0.9], usta: [0.03, 0.95], pro: [0.02, 1] };
const list = spec.split(',').flatMap(p => { const [a, b] = p.split('-').map(Number); return b ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a]; });
const b = await launch({ width: 390, height: 844, dpr: 1, lang: 'tr-TR', seed: 'window.requestAnimationFrame=function(){return 0};window.__noMinT=1;' });
try {
  await b.goto('file://' + join(root, 'www', 'index.html'));
  await b.eval(readFileSync(join(root, 'tools', 'bot.js'), 'utf8'));
  for (const lv of list) {
    const r = await b.eval(`(()=>{const k=__kp;let win=0,dur=[],wv=0,tot=0;
      for(let i=0;i<${+n};i++){runBot(${SK[skill][0]},${SK[skill][1]},1,400,1/60,{setup:()=>{k.save.bl.f={};k.blStart(${lv});window.__t0=k.G.clock}});
        const B=k.G.bl;tot++;if(k.G.mode==='blwin'){win++;dur.push(k.G.clock-window.__t0);wv=B.waves;}}
      k.goMenu();const m=dur.length?dur.reduce((a,x)=>a+x,0)/dur.length:0;return JSON.stringify({lv:${lv},win,tot,waves:wv,sec:+m.toFixed(1),spw:dur.length?+(m/wv).toFixed(2):0,min:dur.length?+Math.min(...dur).toFixed(1):0})})()`, { timeout: 590000 });
    console.log(r);
  }
} finally { await b.close(); }
process.exit(0);
