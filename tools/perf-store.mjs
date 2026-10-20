/* Mağaza sokağı performans ölçümü: node tools/perf-store.mjs   (GPU=1 ile gerçek ekran kartı; varsayılan yazılımla çizer)
   Ne ölçer: sokak açıkken boşta ve yatay kaydırırken (gerçek dokunma kaydırması) ana iş parçacığının meşguliyeti, ana iş parçacığında boyama sayısı,
   raster görevleri ve kare aralıkları (rAF). Hangi animasyon grubunun yük bindirdiğini görmek için gruplar tek tek durdurulup yeniden ölçülür.
   DEBUG=1 derlemesi gerekir (node tools/store-test.mjs onu üretir). Hedef: boşta ana iş parçacığı < %10, kaydırırken 24 ms üstü kare yok. */
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const b = await launch({ width: 390, height: 844, dpr: 2, lang: 'tr-TR', gpu: process.env.GPU === '1', seed: 'document.documentElement.setAttribute("data-theme","light");' });
await b.goto('file://' + join(root, 'www', 'index.html'));
await b.eval('(function(){var S=__kp.save;S.coins=2300;S.own={kron:1,kalkan:1,steto:0,kum:0};S.slots=2;S.equip=["kron","kalkan","",""];__kp.persist();__kp.refreshStats();__kp.SS.force="'+(process.env.DAY==='1'?'day':'night')+'";__kp.openShop("menu");return 1})()');
await b.sleep(2600);
if (process.env.HIDE) await b.eval('document.querySelectorAll(' + JSON.stringify(process.env.HIDE) + ').forEach(function(e){e.style.visibility="hidden"});1');   // deney: bu öğeler çizilmeseydi yük ne olurdu

let cur = [];
b.on('Tracing.dataCollected', p => cur.push(...p.value));
const trace = async act => {
  cur = [];
  const done = new Promise(r => b.on('Tracing.tracingComplete', r));
  await b.send('Tracing.start', { traceConfig: { includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'cc', 'viz', 'toplevel'] }, transferMode: 'ReportEvents' });
  await b.eval('window.__f=[];(function l(t){window.__f.push(t);window.__r=requestAnimationFrame(l)})(0);1');
  const t0 = Date.now(); await act(); const ms = Date.now() - t0;
  const fr = await b.eval('cancelAnimationFrame(window.__r);JSON.stringify(window.__f)');
  await b.send('Tracing.end'); await done;
  const main = cur.find(e => e.ph === 'M' && e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain');
  const sum = {}, cnt = {};
  const tn = {}; cur.filter(e => e.ph === 'M' && e.name === 'thread_name').forEach(e => { tn[e.pid + ':' + e.tid] = e.args.name; });
  const thr = {};
  for (const e of cur) if (e.ph === 'X' && /RunTask$/.test(e.name) && e.cat && /toplevel/.test(e.cat)) { const n = tn[e.pid + ':' + e.tid] || '?'; thr[n] = (thr[n] || 0) + (e.dur || 0) / 1000; }
  const th = n => (thr[n] || 0) / ms * 100;
  for (const e of cur) {
    if (e.ph !== 'X') continue;
    const isMain = main && e.tid === main.tid && e.pid === main.pid;
    const k = (isMain ? 'M:' : '') + e.name;
    sum[k] = (sum[k] || 0) + (e.dur || 0) / 1000; cnt[k] = (cnt[k] || 0) + 1;
  }
  const f = JSON.parse(fr), d = f.slice(1).map((t, i) => t - f[i]);
  return { ms, comp: th('Compositor'), gpu: th('CrGpuMain') + th('VizCompositorThread'), busy: (sum['M:RunTask'] || 0) / ms * 100, paint: (cnt['M:Paint'] || 0) / ms * 1000, raster: (cnt['RasterTask'] || 0) / ms * 1000, style: sum['M:UpdateLayoutTree'] || 0, layout: sum['M:Layout'] || 0,
    frames: f.length, over24: d.filter(x => x > 24).length, over40: d.filter(x => x > 40).length, max: Math.round(Math.max(0, ...d)) };
};
const idle = () => trace(() => b.sleep(3000));
const swipes = async () => {
  for (const dx of [-230, -230, 230, 230, -230, 230]) {
    await b.send('Input.synthesizeScrollGesture', { x: 200, y: 330, xDistance: dx, yDistance: 0, gestureSourceType: 'touch', speed: 900 });
    await b.sleep(450);
  }
};
const scroll = () => trace(swipes);
let layers = null; b.on('LayerTree.layerTreeDidChange', p => { if (p.layers) layers = p.layers; });
await b.send('LayerTree.enable'); await b.eval('document.getElementById("stg").style.outline="0";1'); await b.sleep(700);
const lay = async tag => { layers = null; await b.eval('document.getElementById("stg").style.outline="0";1'); await b.sleep(800); if (layers) { const dc = layers.filter(l => l.drawsContent && !l.invisible); console.log(tag.padEnd(14) + 'katman:', layers.length, 'çizen:', dc.length, 'toplam alan (MP, dpr2):', dc.reduce((t, l) => t + l.width * l.height * 4 / 1e6, 0).toFixed(1), '(ekran 1.3)'); } };
await lay('durgun:');
await b.eval('document.getElementById("stHub").classList.add("mv");1'); await lay('kaydırırken:');
await b.eval('document.getElementById("stHub").classList.remove("mv");1'); await b.sleep(300);
const names = JSON.parse(await b.eval('JSON.stringify(document.getAnimations().reduce(function(o,a){var n=a.animationName||"(geçiş)";o[n]=(o[n]||0)+1;return o},{}))'));
console.log('sokaktaki animasyonlar (ad: adet):', Object.entries(names).sort((x, y) => y[1] - x[1]).map(([k, v]) => k + ':' + v).join(' '));
const GROUPS = {
  'hepsi açık': [],
  'SVG dönenler (aSpin)': ['aSpin'],
  'sallanma/zıplama': ['aBob', 'aSw2', 'aSw3', 'aNxp', 'aNx', 'aSway', 'aTail', 'aBlink', 'aLmp', 'aFlag', 'aWig'],
  'parıltı/yıldız': ['aTw', 'aTw2', 'aGl', 'aGl2', 'aSunGlow', 'aSh', 'aSh2'],
  'bulut/kuş/kayan yıldız': ['cldMove', 'brdFly', 'brdBob', 'aShoot'],
  'ateş böceği/konfeti': ['aFf', 'aFall', 'aSpk'],
  'HEPSİ durdu': null
};
const row = (n, i, s) => console.log((n + ':').padEnd(26) + `boşta: ana ${i.busy.toFixed(0)}% derleyici ${i.comp.toFixed(0)}% gpu ${i.gpu.toFixed(0)}% | kaydırma: ana ${s.busy.toFixed(0)}% derleyici ${s.comp.toFixed(0)}% gpu ${s.gpu.toFixed(0)}% boyama ${s.paint.toFixed(0)}/sn kare ${s.frames} >24ms:${s.over24}`);
for (const [n, g] of Object.entries(GROUPS)) {
  if (process.env.ONLY && n !== 'hepsi açık') continue;
  const pz = g === null ? 'true' : `function(a){return ${JSON.stringify(g)}.indexOf(a.animationName)>=0}`;
  await b.eval(`document.getAnimations().forEach(function(a){if((${pz.startsWith('function') ? pz : 'function(){return true}'})(a))a.pause()});1`);
  const i = await idle(), s = await scroll();
  row(n, i, s);
  await b.eval('document.getAnimations().forEach(function(a){a.play()});1');
  await b.sleep(300);
}
await b.close();
