/* Yeni parkur tanı aracı: node tools/pk-diag.mjs <bölüm> [beceri] [n] — bot oynar, saniye saniye süre, vuruş, ıska ve tur atlamaları yazılır (DEBUG=1). */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [lv = '24', skill = 'iyi', n = '3'] = process.argv.slice(2);
const SK = { yeni: [0.12, 0.5], orta: [0.08, 0.75], iyi: [0.05, 0.9], usta: [0.03, 0.95], pro: [0.02, 1] };
const b = await launch({ width: 390, height: 844, dpr: 1, lang: 'tr-TR', seed: 'window.requestAnimationFrame=function(){return 0};' });
try {
  await b.goto('file://' + join(root, 'www', 'index.html'));
  await b.eval(readFileSync(join(root, 'tools', 'bot.js'), 'utf8'));
  const r = await b.eval(`(()=>{const k=__kp,out=[];for(let i=0;i<${+n};i++){let last=-1,line=[],hits=0,lap=0,pa=0;
    runBot(${SK[skill][0]},${SK[skill][1]},1,200,1/60,{setup:()=>{k.save.bl.f={};k.blStart(${+lv});},stop:()=>{const G=k.G;if(!G.bl)return false;const s=Math.floor(G.clock);if(s!==last){last=s;line.push(G.time.toFixed(1)+"/w"+G.bl.wave);}return false;}});
    const G=k.G;out.push((G.mode==='blwin'?'GEÇTİ ':'YANDI ')+'hata '+G.bl.miss+' · '+line.join(' '));}k.goMenu();return out.join('\\n');})()`, { timeout: 300000 });
  console.log(r);
} finally { await b.close(); }
process.exit(0);
