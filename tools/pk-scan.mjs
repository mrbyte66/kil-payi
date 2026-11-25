/* Yeni parkur süre kazancı taraması: node tools/pk-scan.mjs <beceri> <n> <bölümler> <kazanç,kazanç,...> — her kazanç değeri için geçme % ve ortalama süre (DEBUG=1; window.__pkGain) */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [skill = 'iyi', n = '4', spec = '4,6,9,11', gains = '1.35,1.7'] = process.argv.slice(2);
const SK = { yeni: [0.12, 0.5], orta: [0.08, 0.75], iyi: [0.05, 0.9], usta: [0.03, 0.95], pro: [0.02, 1] };
const list = spec.split(',').flatMap(p => { const [a, b] = p.split('-').map(Number); return b ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a]; });
const b = await launch({ width: 390, height: 844, dpr: 1, lang: 'tr-TR', seed: 'window.requestAnimationFrame=function(){return 0};' });
try {
  await b.goto('file://' + join(root, 'www', 'index.html'));
  await b.eval(readFileSync(join(root, 'tools', 'bot.js'), 'utf8'));
  for (const g of gains.split(',')) {
    const row = [];
    for (const lv of list) {
      const r = await b.eval(`(()=>{window.__pkGain=${+g};const k=__kp;let win=0,dur=0,miss=0;
        for(let i=0;i<${+n};i++){runBot(${SK[skill][0]},${SK[skill][1]},1,400,1/60,{setup:()=>{k.save.bl.f={};k.blStart(${lv});window.__t0=k.G.clock}});
          if(k.G.mode==='blwin'){win++;dur+=k.G.clock-window.__t0;}miss+=k.G.bl.miss;}
        k.goMenu();return Math.round(win*100/${+n})+'%/'+(win?Math.round(dur/win):'-')+'s/h'+(miss/${+n}).toFixed(1)})()`, { timeout: 590000 });
      row.push(lv + ':' + r);
    }
    console.log('kazanç ' + g + '  ' + row.join('  '));
  }
} finally { await b.close(); }
process.exit(0);
