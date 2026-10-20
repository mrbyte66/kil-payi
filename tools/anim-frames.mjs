/* Geçişleri kare kare görmek için: node tools/anim-frames.mjs <çıkış klasörü> [akış...]
   Akışlar: open (menüden mağazaya), enter (sokaktan dükkâna), back (dükkândan sokağa), close (mağazadan çıkış), swap (dükkândan dükkâna).
   Neden: gerçek zamanda ekran görüntüsü almak (geçiş 300-800 ms) tutarsızdır. Burada zamanlayıcılar sanal (setTimeout elle ilerletilir), CSS animasyonları ve
   geçişleri duraklatılıp currentTime ile istenen ana sürülür; her an için bir PNG çıkar (<akış>-<ms>.png). Tarayıcı "animasyonları kaldır" diyor taklit edilir (reduceMotion),
   oyun bu ayara bakmadığı için geçişler yine de oynar. DEBUG=1 ./build.sh ile derlenmiş www/index.html gerekir (node tools/store-test.mjs onu üretir).
   Dikkat: yalnızca CSS tarafını sürer; tuval (oyun) ve rAF ile sayılan animasyonlar bu yolla görülmez. */
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2], FLOWS = process.argv.slice(3);
if (!OUT) { console.log('kullanım: node tools/anim-frames.mjs <klasör> open enter back close swap'); process.exit(1); }
mkdirSync(OUT, { recursive: true });
const b = await launch({ width: 390, height: 844, dpr: 1, lang: 'tr-TR', reduceMotion: true, seed: 'document.documentElement.setAttribute("data-theme","light");' });
await b.goto('file://' + join(root, 'www', 'index.html'));
await b.eval('(function(){var S=__kp.save;S.coins=2300;S.own={kron:1,kalkan:1,steto:0,kum:0};S.slots=2;S.equip=["kron","kalkan","",""];__kp.persist();__kp.refreshStats();__kp.SS.force="night";return 1})()');
const VT = `(function(){
 if(window.__V)return 1;
 var V=window.__V={now:0,q:[],map:new Map(),old:new Set(),nid:1,real:window.setTimeout,realC:window.clearTimeout};
 V.reg=function(t0){document.getAnimations().forEach(function(a){if(!V.map.has(a)&&!V.old.has(a)){V.map.set(a,t0);a.pause()}})};
 V.at=function(t){for(;;){var due=V.q.filter(function(x){return x.at<=t}).sort(function(a,c){return a.at-c.at})[0];if(!due)break;V.q=V.q.filter(function(x){return x!==due});V.now=due.at;due.fn();V.reg(due.at)}V.now=t;V.map.forEach(function(st,a){try{a.currentTime=Math.max(0,t-st)}catch(e){}})};
 V.arm=function(){window.setTimeout=function(fn,ms){var id=V.nid++;V.q.push({id:id,fn:fn,at:V.now+(ms||0)});return id};window.clearTimeout=function(id){V.q=V.q.filter(function(x){return x.id!==id})};V.now=0;V.map=new Map();V.old=new Set(document.getAnimations())};
 V.settle=function(){window.setTimeout=V.real;window.clearTimeout=V.realC;V.q.forEach(function(x){V.real.call(window,x.fn,0)});V.q=[];V.map.forEach(function(s,a){try{a.finish()}catch(e){}});V.map=new Map()};
 return 1})()`;
await b.eval(VT);
const seq = async (name, times) => { for (const t of times) { await b.eval(`__V.at(${t})`); await b.sleep(45); await b.shot(`${OUT}/${name}-${String(t).padStart(4, '0')}.png`); } };
const run = async (name, act, times) => { await b.eval('__V.arm()'); await b.eval(act); await b.eval('__V.reg(0)'); await seq(name, times); await b.eval('__V.settle()'); await b.sleep(900); };
const FL = {
  open: () => run('a-open', "document.getElementById('bagBtn').click()", [0, 70, 140, 220, 320, 440, 600, 800, 1100]),
  enter: () => run('b-enter', "document.getElementById('stCta').click()", [0, 100, 200, 300, 400, 500, 560, 640, 760, 900, 1100]),
  back: () => run('c-back', "document.querySelector('#stShop [data-a=back]').click()", [0, 80, 160, 260, 380, 520, 700, 900]),
  close: () => run('d-close', '__kp.closeShop()', [0, 60, 120, 200, 280, 360]),
  swap: () => run('e-swap', "__kp.goShop('yet')", [0, 100, 200, 280, 400, 560, 800])
};
for (const f of FLOWS) if (FL[f]) await FL[f](); else console.log('bilinmeyen akış', f);
console.log(b.logs.length ? JSON.stringify(b.logs) : 'tamam: ' + FLOWS.join(' '));
await b.close();
