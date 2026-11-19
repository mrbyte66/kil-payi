/* Öğretim (V0.11.0) uçtan uca denemesi: yeni kurulum, GERÇEK dokunuşla (CDP touch) ilk tur, mağaza, ilk gerçek oyunda joker. DEBUG=2 ile derler (duraklatma açık), sonunda DEBUG=1'e döner.
   Kullanım: node tools/ob-test.mjs [ekran görüntüsü klasörü] */
import { execSync } from 'node:child_process';
import { launch } from './cdp.mjs';
const root = new URL('..', import.meta.url).pathname, page = 'file://' + root + 'www/index.html';
const shotDir = process.argv[2] || '';
execSync('DEBUG=2 ./build.sh', { cwd: root, stdio: 'ignore' });
let fail = 0;
const T = (n, ok, extra) => { if (!ok) fail++; console.log((ok ? 'ok   ' : 'HATA ') + n + (extra !== undefined ? '  [' + extra + ']' : '')); };
const b = await launch({ width: 390, height: 844, dpr: 2, lang: 'tr-TR', ob: true });
await b.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
const touch = async (x, y) => {
  await b.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await b.sleep(40);
  await b.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await b.sleep(60);
};
const wait = async (cond, ms = 15000) => { const s = Date.now(); while (Date.now() - s < ms) { if (await b.eval(cond)) return true; await b.sleep(25); } return false; };
const shot = async n => { if (shotDir) await b.shot(shotDir + '/' + n + '.png'); };
const K = '__kp', S = K + '.save', G = K + '.G';
const ctr = sel => b.eval(`(()=>{const e=${sel};if(!e)return null;const r=e.getBoundingClientRect();return r.width?[r.left+r.width/2,r.top+r.height/2]:null})()`);
const tapEl = async sel => { const p = await ctr(sel); if (!p) throw new Error('öğe yok: ' + sel); await touch(p[0], p[1]); };
const tgIs = sel => `(()=>{const t=${K}.obTarget();return !!(t&&t.el&&t.el.matches('${sel}'))})()`;

await b.goto(page + '?ob=1'); await b.sleep(300);
if (process.env.CALM) await b.eval(`${S}.anim=false;${K}.applyMotion()`);   /* Animasyonlar kapalı: akış aynı çalışmalı */
/* --- 1. Parkur, ilk kilit, Bölüm 1 (kullanıcı 2026-11-18 sırası) --- */
T('yeni oyuncu: 0 altın, 0 joker, öğretim Parkur ile başlar', await b.eval(`${S}.coins===0&&!${S}.own.kron&&${S}.tools.kron.n===0&&${S}.ob===12`));
T('el Parkur dilimini gösterir, arka plan çizgili', await wait(tgIs('#blBtn'), 12000) && await b.eval(`document.getElementById('app').classList.contains('obth')`));
await b.sleep(300); await shot('1-parkur');
await tapEl(`document.getElementById('bagBtn')`); await b.sleep(300);
T('başka dilim kilitli', await b.eval(`!${K}.SS.open&&${G}.mode==='menu'`));
await tapEl(`document.getElementById('blBtn')`);
T('liste açılır, el ilk kilitte', await wait(`document.getElementById('blList').classList.contains('on')&&(()=>{const t=${K}.obTarget();return !!(t&&t.r)})()`, 4000));
await b.sleep(300); await shot('2-ilk-kilit');
const p1 = await b.eval(`(()=>{const t=${K}.obTarget(),a=document.getElementById('app').getBoundingClientRect();return [a.left+t.x,a.top+t.y]})()`);
await touch(p1[0], p1[1]);
T('kilit kırılır, Bölüm 1 kısa hâliyle başlar', await wait(`!!${G}.bl&&${G}.bl.n===1&&${S}.ob===13&&${G}.bl.waves<=4`, 8000));
await b.sleep(1500); await shot('3-bolum1');
T('Öğretici şeridi görünür', await b.eval(`!document.getElementById('obTag').hidden`));
await wait(`${G}.mode==='play'`, 15000);
await b.eval(`${K}.blWin()`);
T('Bölüm 1 bitti: 500 altın hediye, sıra çarşıda', await b.eval(`${S}.coins>=500&&${S}.ob===14`));
T('geri sayım yok, el Bölüm listesi düğmesinde', await wait(tgIs('#blStop'), 8000) && await b.eval(`!document.querySelector('#blCsR .go.cdo')`));
await b.sleep(300); await shot('4-bolum-bitti');
await tapEl(`document.querySelector('#blCsR .blk.on [data-go]')||document.getElementById('hudScore')`); await b.sleep(300);
T('Oyna kilitli', await b.eval(`${G}.mode==='blwin'`));
await tapEl(`document.getElementById('blStop')`);
T('liste, el kapatmada', await wait(tgIs('#blClose'), 4000));
await tapEl(`document.getElementById('blClose')`);
/* --- 2. çarşı --- */
T('ana ekran, el çarşıda', await wait(`${G}.mode==='menu'&&${S}.ob===2&&${tgIs('#bagBtn')}`, 6000));
await b.sleep(400); await shot('5-menu-carsi');
const coins0 = await b.eval(`${S}.coins`);
await tapEl(`document.getElementById('setBtn')`);
T('Ayarlar kilitli', await b.eval(`!document.getElementById('settings').classList.contains('on')`));
await b.goto(page + '?ob=2'); await b.sleep(500);
T('yeniden açılış: hediye tekrar verilmez, aşama sürer', await b.eval(`${S}.coins===${coins0}&&${S}.ob===2&&${G}.mode==='menu'`));
await wait(tgIs('#bagBtn'), 6000);
await tapEl(`document.getElementById('bagBtn')`);
T('mağaza açılır', await wait(`${K}.SS.open`, 1500));
T('el İçeri gir', await wait(tgIs('[data-a="gosel"]'), 4000));
await tapEl(`document.querySelector('#stHub [data-a="close"]')`);
T('mağazadan çıkış kilitli', await b.eval(`${K}.SS.open`));
await tapEl(`document.querySelector('#stHub [data-a="gosel"]')`);
T('el kronometre', await wait(tgIs('.itm[data-k="kron"]'), 4000));
await tapEl(`document.querySelector('#stShop .itm[data-k="kron"]')`);
T('açıklama yavaşça yazılır, el önce gelmez', await wait(`${K}.SS.typing===true`, 2000) && !(await b.eval(tgIs('[data-a="unl"]'))));
T('el aç düğmesi (yazı bitince)', await wait(tgIs('[data-a="unl"]'), 12000));
await tapEl(`document.querySelector('#stSheet [data-a="unl"]')`);
T('kilit açıldı: 300 altın gitti, stok 1, yuvada', await b.eval(`${S}.coins===${coins0}-300&&${S}.own.kron===1&&${S}.tools.kron.n===1&&${S}.equip[0]==='kron'&&${S}.ob===3`));
T('el geri', await wait(tgIs('[data-a="back"]'), 4000));
await b.sleep(200); await shot('6-yuvada');
await tapEl(`document.querySelector('#stShop [data-a="back"]')`);
T('el mağazadan çıkış', await wait(tgIs('[data-a="close"]'), 4000));
await tapEl(`document.querySelector('#stHub [data-a="close"]')`);
/* --- 3. Maraton, joker, yumuşak bitiş --- */
T('el Maraton dilimini gösterir', await wait(`${S}.ob===11&&${G}.mode==='menu'&&${tgIs('#playBtn')}`, 4000));
await tapEl(`document.getElementById('playBtn')`);
T('el Normal dilimini gösterir', await wait(tgIs('[data-m="normal"]'), 3000));
await tapEl(`document.querySelector('#mSet2 [data-m="normal"]')`);
T('Maraton Normal başlar, arka plan çizgili', await wait(`${G}.mode==='play'&&!${G}.bl&&${S}.ob===9&&${S}.lvl==='normal'`, 3000) && await b.eval(`document.getElementById('app').classList.contains('obth')`));
const tStart = Date.now();
T('süre 4 sn\'ye geriler, oyun durur, el kronometrede', await wait(`${G}.mode==='hold'&&${G}.hold==='joker'`, 20000), Math.round((Date.now() - tStart) / 1000) + ' sn');
T('süre 4', await b.eval(`Math.abs(${G}.time-4)<0.3`), await b.eval(`${G}.time`));
await b.sleep(300); await shot('7-joker');
await touch(195, 500);
T('başka dokunuş sayılmaz', await b.eval(`${G}.mode==='hold'&&${S}.tools.kron.n===1`));
await tapEl(`document.querySelector('.tool[data-tool="kron"]')`);
T('joker: süre 8, oyun sürer', await b.eval(`${G}.mode==='play'&&${S}.tools.kron.n===0&&${S}.ob===10&&${G}.time>=7.5`), await b.eval(`${G}.time`));
T('3 sn sonra öğretici yumuşakça biter, oyun sürer', await wait(`${S}.ob===0&&${G}.mode==='play'`, 5000));
await b.sleep(500); await shot('8-hazirsin');
T('"Hazırsın" şeridi, sonra kaybolur; çizgili arka plan söner', await b.eval(`!document.getElementById('obTag').hidden`) && await wait(`document.getElementById('obTag').hidden&&!document.getElementById('app').classList.contains('obth')`, 4000));
T('duraklat artık serbest', await (async () => { await tapEl(`document.getElementById('pauseBtn')`); return b.eval(`${G}.mode==='pause'`); })());
await b.goto(page + '?ob=3'); await b.sleep(500);
T('yeniden açılış: öğretim dönmez', await b.eval(`${S}.ob===0&&${G}.mode==='menu'&&!document.getElementById('obFx').classList.contains('on')`));
await tapEl(`document.getElementById('bagBtn')`);
T('bitince mağaza serbest', await wait(`${K}.SS.open`, 1500));
await b.eval(`${K}.closeShop()`); await b.sleep(700);
/* joker sırası: kendisi basarsa da biter; ölürse sonraki oyuna kalır, menü kilitlenmez */
await b.eval(`${S}.run=null;${S}.ob=9;${S}.tools.kron.n=1;${K}.start()`);
await b.eval(`${K}.useTool('kron')`);
T('elle joker: durma olmaz, Parkur sırası', await b.eval(`${S}.ob===10&&${G}.mode==='play'`));
await b.eval(`${S}.ob=9;${S}.tools.kron.n=1;${K}.die()`);
await wait(`${G}.mode==='over'`, 6000);
T('ölünce joker sırası kalır, kilit yok', await b.eval(`${S}.ob===9`) && !(await b.eval(`document.getElementById('obFx').classList.contains('on')`)));
await b.eval(`${S}.ob=0;${S}.run=null;${K}.goMenu()`); await b.sleep(300);
/* ilk görüş: ikililerde yalnız cezalı olan */
/* Maraton'da ilk görüş tanıtımı yok (2026-11-18); eşleme Parkur'da (G.bl varken) geçerli */
T('Maraton: tanıtım kuyruğa girmez', await b.eval(`(()=>{const o=${G}.bl;${G}.bl=null;${G}.introQ.length=0;${S}.intro={};${S}.seen={};${K}.queueIntro('kayan');const r=${G}.introQ.length;${G}.bl=o;return r===0})()`));
const q = k => b.eval(`(()=>{const o=${G}.bl;${G}.bl=o||{};${G}.introQ.length=0;${S}.intro={};${S}.seen={};${K}.queueIntro('${k}');const r=${G}.introQ.join();${G}.introQ.length=0;${G}.bl=o;return r})()`);
T('kayan: kendi değil, tuzaklı olanı', (await q('kayan')) === 'kayanT');
T('tutbirak: sıcak yayı (basılı tutmayı da gösterir)', (await q('tutbirak')) === 'sicak');
T('ikiz gelince de kendi sahnesi', (await q('kayanT')) === 'kayanT');
T('ikizsiz kilit kendi sahnesi', (await q('isin')) === 'isin' && (await q('bomba')) === 'bomba' && (await q('trafik')) === 'trafik');
T('ikiz gösterildiyse ne kilitte ne ikizde tekrar', await b.eval(`(()=>{const o=${G}.bl;${G}.bl=o||{};${G}.introQ.length=0;${S}.intro={kayanT:1};${S}.seen={};${K}.queueIntro('kayan');${K}.queueIntro('kayanT');const r=${G}.introQ.length;${G}.bl=o;return r===0})()`));
T('konsol temiz', !b.logs.length, b.logs.join(' | '));
/* eski oyuncu (V0.10.4 kaydı: ob alanı yok): öğretim görmez, kronometresi ve parası durur */
const old = await b.eval(`(()=>{const o=JSON.parse(JSON.stringify(${S}));delete o.ob;delete o.obM;o.coins=777;o.own={kron:1};o.tools.kron.n=2;o.equip=['kron','','',''];o.run=null;const body=JSON.stringify(o);return body.slice(0,-1)+',"sig":"'+${K}.sigOf(body)+'"}'})()`);
await b.close();
const b2 = await launch({ width: 390, height: 844, dpr: 1, lang: 'tr-TR', ob: true, seed: 'localStorage.setItem("kilpayi.v1",' + JSON.stringify(old) + ');' });
await b2.goto(page + '?ob=4'); await b2.sleep(1000);
T('eski oyuncu öğretim görmez', await b2.eval(`${S}.ob===0&&${S}.obM===0&&${S}.coins===777&&${S}.own.kron===1&&${S}.tools.kron.n===2&&${G}.mode==='menu'&&!document.getElementById('obFx').classList.contains('on')`));
await b2.close();
execSync('DEBUG=1 ./build.sh', { cwd: root, stdio: 'ignore' });
console.log(fail ? fail + ' HATA' : 'hepsi geçti');
process.exit(fail ? 1 : 0);
