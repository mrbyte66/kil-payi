/* Bölümler bot ölçümü (V1.1): node tools/bl-run.mjs [beceri] [n] [bölümler, ör. 1-10 ya da 3,7,12]
   DEBUG=1 derlemesi gerekir. Her bölüm için n deneme: geçme %, ortalama hata, ölümde kalınan dalga; motor hatası varsa yazar. */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [skill = 'orta', n = '20', spec = '1-80'] = process.argv.slice(2);
const SK = { yeni: [0.12, 0.5], orta: [0.08, 0.75], iyi: [0.05, 0.9], usta: [0.03, 0.95], pro: [0.02, 1] };
const list = spec.split(',').flatMap(p => { const [a, b] = p.split('-').map(Number); return b ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a]; });
const b = await launch({ width: 390, height: 844, dpr: 1, lang: 'tr-TR', seed: 'window.requestAnimationFrame=function(){return 0};window.__errs=[];window.addEventListener("error",e=>__errs.push(e.message));' });
try {
  await b.goto('file://' + join(root, 'www', 'index.html'));
  await b.eval(readFileSync(join(root, 'tools', 'bot.js'), 'utf8'));
  for (const lv of list) {
    const r = await b.eval(`(()=>{const k=__kp;if(k.blSoon(${lv}))return 'yakında';let win=0,miss=0,wv=[],err='',dur=0;
      for(let i=0;i<${+n};i++){try{runBot(${SK[skill][0]},${SK[skill][1]},1,400,1/60,{setup:()=>{k.save.bl.f={};k.blStart(${lv});window.__t0=k.G.clock}});}catch(e){err=e.message;break}
        const B=k.G.bl;if(!B){err='bl yok';break}if(k.G.mode==='blwin'){win++;dur+=k.G.clock-window.__t0;}else wv.push(B.wave+'/'+B.waves);miss+=B.miss;}
      k.goMenu();return (err?'HATA '+err+' · ':'')+k.blId(${lv})+' geçti %'+Math.round(win*100/${+n})+' · '+(win?Math.round(dur/win):'-')+' sn · hata ort '+(miss/${+n}).toFixed(1)+(wv.length?' · ölüm '+wv.slice(0,6).join(' '):'')})()`, { timeout: 590000 });
    console.log(String(lv).padStart(2) + '  ' + r);
  }
  const errs = await b.eval('JSON.stringify(window.__errs)');
  if (errs !== '[]') console.log('konsol hataları: ' + errs);
} finally { await b.close(); }
process.exit(0);
