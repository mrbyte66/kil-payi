/* V1.0.0 mağaza görselleri, 1. adım: gerçek oyundan ham kareler. `DEBUG=1 ./build.sh` sonrası: node capture.mjs <klasör> <tr|en> */
import { launch } from '../../../tools/cdp.mjs';
import { writeFileSync } from 'node:fs';
const ROOT = new URL('../../../', import.meta.url).pathname, OUT = process.argv[2], L = process.argv[3] || 'tr', lang = L === 'tr' ? 'tr-TR' : 'en-US';
const setup = `var K=window.__kp,S=K.save,G=K.G;Object.keys(K.INTRO).forEach(function(k){S.seen[k]=1;S.book[k]=1});S.book.tek=1;S.coins=1280;S.runs=24;S.own={kron:1,kalkan:1,steto:1,kum:1};S.slots=4;S.equip=['kron','kalkan','steto','kum'];S.tools={steto:{n:3,l:1},kron:{n:3,l:1},kalkan:{n:2,l:1},kum:{n:3,l:1}};S.bests={rahat:96,normal:128,usta:214,cehennem:77};S.obM=0;S.ob=0;S.tut=true;`;
const SC = [
  { n: 'hero', lvl: 'normal', L: 2, kind: 'tek', score: 128, t: 7.4, steps: 30, hit: true },
  { n: 'isin', lvl: 'normal', L: 7, kind: 'isin', score: 342, t: 5.6, steps: 40 },
  { n: 'cehennem', lvl: 'cehennem', L: 5, kind: 'kasa', score: 640, t: 4.3, steps: 60 },
  { n: 'bomba', lvl: 'normal', L: 8, kind: 'bomba', score: 290, t: 6.2, steps: 30 },
  { n: 'trafik', lvl: 'usta', L: 6, kind: 'trafik', score: 210, t: 5.1, steps: 30 },
  { n: 'gelgit', lvl: 'usta', L: 9, kind: 'gelgit', score: 517, t: 6.8, steps: 55 },
  { n: 'joker', lvl: 'normal', L: 4, kind: 'tek', score: 184, t: 2.4, steps: 40 }
];
const b = await launch({ width: 405, height: 720, dpr: 8 / 3, lang, seed: 'window.requestAnimationFrame=function(){return 0};document.documentElement.setAttribute("data-theme","light");' });
await b.goto('file://' + ROOT + 'www/index.html');
const V = {};
for (const s of SC) {
  const r = await b.eval(`(()=>{${setup}S.lvl=${JSON.stringify(s.lvl)};K.start(${s.L});G.mode='play';G.count=0;G.banner=null;G.card=null;G.score=${s.score};G.time=${s.t};
  K.spawn(false,${JSON.stringify(s.kind)});
  for(var i=0;i<${s.steps};i++){K.update(0.016);G.time=${s.t}}
  ${s.hit ? `var p=G.pins[0];G.ang=K.pinCenter(p);K.tap();for(var j=0;j<7;j++){K.update(0.016)}` : ''}
  G.time=${s.t};G.banner=null;K.updateTools();K.updateHud();K.render();return G.kind+' L'+G.L+' '+G.mode})()`);
  await b.sleep(300);
  await b.eval('window.__kp.render();1');
  await b.shot(`${OUT}/${s.n}.png`);
  V[s.n] = await b.eval('(()=>{var v=window.__kp.view;return [v.cx,v.cy,v.r,window.__kp.G.ang]})()');
  console.log(s.n, r);
}
console.log(b.logs.join('\n'));
await b.close();
const m = await launch({ width: 405, height: 720, dpr: 8 / 3, gpu: true, lang, seed: 'document.documentElement.setAttribute("data-theme","light");' });
await m.goto('file://' + ROOT + 'www/index.html');
await m.eval(`(()=>{${setup}S.lvl='normal';S.run=null;K.goMenu();1})()`);
/* ibre yazının üstüne binmesin: kare döngüsünü durdur, ibreyi dilim aralığına koy */
const still = async (name, ang) => {
  await m.eval(`(()=>{window.__raf=window.requestAnimationFrame;window.requestAnimationFrame=function(c){window.__pend=c;return 0};return 1})()`);
  await m.sleep(120);
  await m.eval(`(()=>{var K=window.__kp;K.G.ang=${ang};K.render();return 1})()`);
  await m.sleep(120); await m.shot(OUT + '/' + name + '.png');
  await m.eval(`(()=>{window.requestAnimationFrame=window.__raf;window.__raf(window.__pend);return 1})()`);
};
await m.sleep(1800); await still('menu', 85 * Math.PI / 180);
V.menu = await m.eval('(()=>{var v=window.__kp.view;return [v.cx,v.cy,v.r,window.__kp.G.ang]})()');
await m.eval(`window.__kp.MN.lvl=1;1`); await m.sleep(1500); await still('zorluk', 45 * Math.PI / 180);
await m.eval(`window.__kp.MN.lvl=0;1`); await m.sleep(900);
await m.eval(`(()=>{var K=window.__kp,G=K.G;K.start();G.score=74;G.n=36;G.raw=60;K.die();1})()`);
for (let i = 0; i < 80 && !(await m.eval(`window.__kp.OV.st==='ch'&&window.__kp.OV.k===1`)); i++) await m.sleep(100);
await m.sleep(1500); await m.shot(OUT + '/sans.png');
await m.eval(`(()=>{var K=window.__kp;K.OV.st='';K.goMenu();1})()`); await m.sleep(700);
await m.eval('window.__kp.SS.force="night";window.__kp.openShop("menu");1');
await m.sleep(3500); await m.shot(OUT + '/shop.png');
console.log(m.logs.join('\n'));
writeFileSync(OUT + '/view.json', JSON.stringify(V));
await m.close(); process.exit(0);
