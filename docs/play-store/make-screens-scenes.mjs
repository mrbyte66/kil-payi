import { launch } from '/Users/beytullahgonulal/Desktop/AndroidDevelopment/KilPayi/tools/cdp.mjs';
import { writeFileSync } from 'node:fs';
const ROOT = '/Users/beytullahgonulal/Desktop/AndroidDevelopment/KilPayi', OUT = process.argv[2], LANGC = process.argv[3] || 'en', only = process.argv[4];
const SC = [
  { n: 'tek',     lvl: 'normal',   L: 2, kind: 'tek',      score: 128, steps: 70, jok: true },
  { n: 'isin',    lvl: 'normal',   L: 7, kind: 'isin',     score: 342, steps: 40, jok: true },
  { n: 'gelgit',  lvl: 'usta',     L: 9, kind: 'gelgit',   score: 517, steps: 55, jok: true },
  { n: 'hayalet', lvl: 'normal',   L: 8, kind: 'hayalet',  score: 276, steps: 45, jok: true },
  { n: 'bomba',   lvl: 'normal',   L: 8, kind: 'bomba',    score: 290, steps: 30, jok: true },
  { n: 'trafik',  lvl: 'normal',   L: 6, kind: 'trafik',   score: 210, steps: 30, jok: true },
  { n: 'iki',     lvl: 'normal',   L: 7, kind: 'iki',      score: 330, steps: 30, jok: true },
  { n: 'cehennem',lvl: 'cehennem', L: 5, kind: 'kasa',     score: 640, steps: 60, jok: true },
  { n: 'kayan',   lvl: 'normal',   L: 3, kind: 'nefes',    score: 160, steps: 40, jok: true },
  { n: 'tutbirak',lvl: 'normal',   L: 10, kind: 'tutbirak',score: 410, steps: 30, jok: true }
];
const b = await launch({ width: 405, height: 720, dpr: 8 / 3, lang: LANGC === 'tr' ? 'tr-TR' : 'en-US', seed: 'window.requestAnimationFrame=function(){return 0};document.documentElement.setAttribute("data-theme","light");' });
await b.goto('file://' + ROOT + '/www/index.html');
for (const s of SC) {
  if (only && !only.split(',').includes(s.n)) continue;
  const js = `(async()=>{var K=window.__kp,S=K.save,G=K.G;
  Object.keys(K.INTRO).forEach(function(k){S.seen[k]=1});S.lvl=${JSON.stringify(s.lvl)};S.coins=1280;S.own={kron:1,kalkan:1,steto:1,kum:1};S.slots=4;S.equip=['steto','kron','kalkan','kum'];S.tools={steto:{n:3,l:1},kron:{n:3,l:1},kalkan:{n:2,l:1},kum:{n:3,l:1}};S.bests[${JSON.stringify(s.lvl)}]=${s.score + 60};K.persist();K.setLevel(${JSON.stringify(s.lvl)});
  K.start(${s.L});G.mode='play';G.count=0;G.banner=null;G.card=null;G.score=${s.score};G.time=6.2;
  K.spawn(false,${JSON.stringify(s.kind)});
  for(var i=0;i<${s.steps};i++){K.update(0.016);G.time=6.2}
  K.updateTools();K.updateHud();K.render();return G.kind+' L'+G.L+' ph:'+G.ph})()`;
  const r = await b.eval(js);
  await b.sleep(250);
  await b.eval('window.__kp.render();1');
  await b.shot(`${OUT}/${s.n}.png`);
  console.log(s.n, r);
}
console.log(b.logs.join('\n'));
await b.close(); process.exit(0);
