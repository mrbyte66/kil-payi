/* Soğuk açılış ölçümü (V0.9.9): node tools/cold-gpu.mjs [ısınmalı|ısınmasız|ikisi]   (varsayılan: ikisi)
   Neden: kullanıcı "mağazaya ilk girişte, ilk İçeri gir'de ve ilk dokunuşlarda kasıyor, sonrakiler akıcı" dedi. Fark ana iş parçacığında değil ekran kartı tarafında
   (ilk kullanımda efekt programları derlenir, harfler atlasa işlenir, katmanlar açılır); bu araç gerçek ekran kartlı başsız Chrome'u HER SEFERİNDE TAZE PROFİLLE açar (soğuk gölgelendirici önbelleği)
   ve mağazadaki ilk/ikinci adımlarda kare aralıklarını (rAF) ölçer. Ölçü: en uzun kare aralığı, 33 ms üstü kare sayısı, "takılma" (20 ms'yi aşan fazlanın toplamı).
   Hedef: ısınmalı koşuda ilk giriş / ilk İçeri gir / ilk fiş, ikinci seferlerine yakın olmalı; ısınmasız koşuda ilk seferler belirgin kötüdür.
   Mac'in ekran kartı telefondan hızlıdır: mutlak sayılara değil ilk/ikinci ve ısınmalı/ısınmasız oranına bak. DEBUG=1 derlemesi gerekir (store-test üretir). */
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
if (!process.env.NOBUILD) execFileSync('sh', ['-c', 'DEBUG=1 ./build.sh'], { cwd: root, stdio: 'ignore' });
const URL = 'file://' + join(root, 'www', 'index.html');
const mode = process.argv[2] || 'ikisi';

const REC = `window.__rec=function(){var f=[];var on=true;(function l(t){if(on){f.push(t);requestAnimationFrame(l)}})(performance.now());return function(){on=false;var d=f.slice(1).map(function(t,i){return t-f[i]});return {n:f.length,max:Math.round(Math.max.apply(null,d.concat([0]))),o33:d.filter(function(x){return x>33}).length,o60:d.filter(function(x){return x>60}).length,jank:Math.round(d.reduce(function(a,x){return a+(x>20?x-16.7:0)},0))}}};1`;

const once = async warm => {
  const b = await launch({ width: 390, height: 844, dpr: 2, lang: 'tr-TR', gpu: true, warm, seed: 'document.documentElement.setAttribute("data-theme","light");' });
  const rows = [];
  try {
    await b.goto(URL);
    await b.eval(REC);
    await b.eval('(function(){var S=__kp.save;S.coins=2300;S.own={kron:1,kalkan:1,steto:0,kum:0};S.slots=2;S.equip=["kron","kalkan","",""];__kp.persist();__kp.refreshStats();__kp.SS.force="night";1})()');
    await b.sleep(warm ? 11000 : 9000);   // ısınmalı koşuda ısınmanın bitmesi için (≈ 1,3 + 5,9 sn) beklenir
    const warmed = await b.eval('!!(__kp.WARM&&__kp.WARM.done)');
    const step = async (name, act, wait) => {
      await b.eval('window.__stop=window.__rec();1');
      await b.eval(act); await b.sleep(wait);
      const r = await b.eval('JSON.stringify(window.__stop())');
      rows.push(Object.assign({ name }, JSON.parse(r)));
    };
    const click = sel => `(function(){var e=document.querySelector(${JSON.stringify(sel)});if(!e)throw new Error('YOK ${sel}');e.click();return 1})()`;
    await step('1) mağazaya İLK giriş', click('#bagBtn'), 2400);
    await step('2) İLK "İçeri gir"', click('#stCta'), 2600);
    await step('3) İLK ürün fişi', click('#stShop .itm[data-k="kalkan"]'), 1200);
    await step('   fiş kapanır', click('#stScrim'), 600);
    await step('   geri (sokağa)', click('#stShop [data-a=back]'), 1500);
    await step('4) kısayolla Hediye\'ye kaydır', click('#stDock .dk[data-i="3"]'), 1200);
    await step('5) Hediye dükkânına gir', click('#stCta'), 2800);
    await step('   geri', click('#stShop [data-a=back]'), 1500);
    await step('   mağazadan çık', click('#stHub [data-a=close]'), 1600);
    await step('6) mağazaya İKİNCİ giriş', click('#bagBtn'), 2400);
    await step('7) İKİNCİ "İçeri gir"', click('#stCta'), 2600);
    rows.warmed = warmed;
    rows.logs = b.logs.slice();
  } finally { await b.close(); }
  return rows;
};

const show = (title, rows) => {
  console.log('\n== ' + title + (rows.warmed ? ' (ısınma tamamlandı)' : '') + (rows.logs && rows.logs.length ? '\n   KONSOL: ' + rows.logs.join(' | ') : ''));
  console.log('   ' + 'adım'.padEnd(34) + 'en uzun'.padStart(8) + '  >33ms'.padStart(8) + '  >60ms'.padStart(8) + '  takılma'.padStart(10));
  rows.forEach(r => console.log('   ' + r.name.padEnd(34) + (r.max + ' ms').padStart(8) + String(r.o33).padStart(8) + String(r.o60).padStart(8) + (r.jank + ' ms').padStart(10)));
};
const runs = mode === 'ikisi' ? [['ısınmalı', true], ['ısınmasız', false]] : [[mode, mode === 'ısınmalı']];
const res = {};
for (const [name, warm] of runs) { res[name] = await once(warm); show(name, res[name]); }
if (res['ısınmalı'] && res['ısınmasız']) {
  const first = r => ['1)', '2)', '3)'].reduce((a, p) => a + r.find(x => x.name.indexOf(p) === 0).jank, 0);
  console.log('\nİlk üç adımın toplam takılması: ısınmasız ' + first(res['ısınmasız']) + ' ms → ısınmalı ' + first(res['ısınmalı']) + ' ms');
}
process.exit(0);
