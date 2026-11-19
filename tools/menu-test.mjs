/* Kadran menü (V0.12.0): GERÇEK dokunuşla (CDP touch) dilimler, etiketler, zorluk geçişi, kaydırma, yarım oyun. DEBUG=1 derlemesiyle çalışır (`DEBUG=1 ./build.sh`).
   Kullanım: node tools/menu-test.mjs [ekran görüntüsü klasörü] */
import { launch } from './cdp.mjs';
const root = new URL('..', import.meta.url).pathname, page = 'file://' + root + 'www/index.html';
const shotDir = process.argv[2] || '';
let fail = 0;
const T = (n, ok, extra) => { if (!ok) fail++; console.log((ok ? 'ok   ' : 'HATA ') + n + (extra !== undefined ? '  [' + extra + ']' : '')); };
const open = async o => {
  const b = await launch(Object.assign({ width: 390, height: 844, dpr: 2, lang: 'tr-TR' }, o));
  await b.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await b.goto(page); await b.sleep(900);
  b.touch = async (x, y, x2) => {
    await b.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
    await b.sleep(30);
    if (x2 != null) { for (let i = 1; i <= 8; i++) { await b.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (x2 - x) * i / 8, y, id: 1 }] }); await b.sleep(16); } }
    await b.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await b.sleep(40);
  };
  b.wait = async (cond, ms = 3000) => { const s = Date.now(); while (Date.now() - s < ms) { if (await b.eval(cond)) return true; await b.sleep(15); } return false; };
  b.slice = deg => b.eval(`(()=>{const v=__kp.view,q=${deg}*Math.PI/180;return [v.cx+Math.sin(q)*v.r,v.cy-Math.cos(q)*v.r]})()`);
  b.tapSlice = async deg => { const p = await b.slice(deg); await b.touch(p[0], p[1]); };
  b.center = () => b.eval('[__kp.view.cx,__kp.view.cy]');
  return b;
};
const shot = async (b, n) => { if (shotDir) await b.shot(shotDir + '/' + n + '.png'); };
const G = '__kp.G', M = '__kp.MN', S = '__kp.save';

let b = await open({});
await shot(b, 'm1-menu');
const ids = ['playBtn', 'bagBtn', 'bookBtn', 'setBtn'];
T('yazılar halkanın içinde: halka ekrana sığar', await b.eval(`__kp.view.cx+__kp.view.r*1.17<innerWidth&&__kp.view.cx-__kp.view.r*1.17>0`));
T('Ayarlar dokunulabilir, dilimlerin üstünde görünmez engel yok', await b.eval(`(()=>{const e=document.getElementById('setBtn'),r=e.getBoundingClientRect(),h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2),v=__kp.view,p=document.elementFromPoint(v.cx,v.cy-v.r);return (h===e||e.contains(h))&&p&&document.getElementById('menu').contains(p)})()`));
await b.touch(195, 790);
await b.sleep(250);
T('halkanın dışına dokunuş oyun başlatmaz', await b.eval(`${G}.mode==='menu'`));
/* beklemek yok: ibre dilimin tam karşısındayken */
await b.eval(`${G}.ang=(45*Math.PI/180+Math.PI)`);
const t0 = Date.now(); await b.tapSlice(45);
T('ibre karşıdayken bile Oyna hemen zorlukları açar', await b.wait(`${M}.lvl===1`, 600), Date.now() - t0 + ' ms');
await b.wait(`${M}.hv===1`, 1500);
await b.tapSlice(90);
T('zorluk seçince oyun başlar', await b.wait(`${G}.mode==='play'`, 600));
await b.sleep(700); await shot(b, 'm2-oyun');
T('oyunda halka normal (dilimler sönük)', await b.eval(`${M}.mf<0.05`));
await b.close();

b = await open({});
/* Oyna */
await b.tapSlice(45);
T('Oyna dilimi: halka zorluklara döner', await b.wait(`${M}.lvl===1`, 600));
await b.sleep(120); await shot(b, 'm3-gecis');
T('Cehennem katmanı kayıyor', await b.eval(`getComputedStyle(document.getElementById('mHell')).visibility==='visible'`));
await b.wait(`${M}.hv===1`, 1500); await b.sleep(100); await shot(b, 'm4-zorluk');
const c = await b.center();
await b.touch(c[0], c[1]);
T('orta: Geri', await b.wait(`${M}.lvl===0&&${M}.hv===0`, 1500));
T('Cehennem katmanı gizlendi', await b.eval(`getComputedStyle(document.getElementById('mHell')).visibility==='hidden'`));
/* kaydırma */
await b.touch(340, 760, 120);
T('sola kaydırınca zorluklar', await b.wait(`${M}.lvl===1&&${M}.hv===1`, 1500));
await b.touch(60, 760, 300);
T('sağa kaydırınca geri', await b.wait(`${M}.lvl===0&&${M}.hv===0`, 1500));
/* zorluk seçimi */
await b.tapSlice(45); await b.wait(`${M}.hv===1`, 1500);
await b.tapSlice(90);
T('Normal dilimi: oyun başlar', await b.wait(`${G}.mode==='play'&&${S}.lvl==='normal'`, 800));
T('arka plan açığa döner', await b.wait(`${M}.hv===0`, 1500));
await b.close();

b = await open({});
await b.tapSlice(45); await b.wait(`${M}.hv===1`, 1500);
await b.tapSlice(270);
T('Cehennem dilimi: Cehennem başlar', await b.wait(`${G}.mode==='play'&&${S}.lvl==='cehennem'`, 800));
await b.sleep(900); await shot(b, 'm5-cehennem');
T('Cehennem teması açık, katman kalktı', await b.eval(`${G}.thT===1&&getComputedStyle(document.getElementById('mHell')).visibility==='hidden'`));
await b.eval(`__kp.save.lvl='normal'`);
await b.close();

b = await open({});
/* Mağaza, Defter: dilim ve etiket */
await b.tapSlice(135);
T('Mağaza dilimi', await b.wait(`__kp.SS.open`, 800));
await b.eval(`__kp.closeShop()`); await b.sleep(800);
await b.tapSlice(225);
T('Öğretici dilimi: Bölümler listesi Öğretici satırı açık gelir', await b.wait(`document.getElementById('blList').classList.contains('on')&&__kp.save.bl.row===1`, 800));
await b.eval(`document.getElementById('blClose').click()`); await b.sleep(300);
await b.tapSlice(-45);
T('Bölümler dilimi', await b.wait(`document.getElementById('blList').classList.contains('on')`, 800));
await b.eval(`document.getElementById('blClose').click()`); await b.sleep(300);
/* yarım oyun */
await b.eval(`__kp.start();__kp.G.score=42;__kp.persistRun()`);
await b.eval(`document.getElementById('pauseMenuBtn').click()`); await b.sleep(500);
T('yarım oyun: Devam et', await b.eval(`document.getElementById('playT').textContent==='Devam et'&&!document.getElementById('newBtn').hidden`), await b.eval(`document.getElementById('mSub').textContent`));
await shot(b, 'm6-devam');
await b.tapSlice(45);
T('yarım oyunda Süreli zorluk halkasını açar', await b.wait(`${M}.lvl===1`, 800));
const runLv = await b.eval(`__kp.save.run.lvl`);
await b.sleep(700);
await b.tapSlice({ rahat: 0, normal: 90, usta: 180, cehennem: 270 }[runLv]);
T('yarım oyunun dilimi sürer', await b.wait(`${G}.mode==='count'||${G}.mode==='play'`, 800), runLv);
await b.eval(`__kp.persistRun()`);
await b.goto(page); await b.sleep(900);
await b.touch(340, 760, 120); await b.wait(`${M}.hv===1`, 1500);
await b.tapSlice(180);
T('başka zorluk: önce sorar', await b.wait(`document.getElementById('swap').classList.contains('on')`, 800));
await b.eval(`document.getElementById('swapYes').click()`);
T('onaylayınca o zorlukta başlar', await b.wait(`${G}.mode==='play'&&${S}.lvl==='usta'`, 800));
T('konsol temiz', !b.logs.length, b.logs.join(' | '));
await b.close();

/* küçük ekran, İngilizce, animasyon kapalı */
b = await open({ width: 320, height: 568, lang: 'en-US' });
await shot(b, 'm7-kucuk');
T('küçük ekran: halka ekrana sığar', await b.eval(`__kp.view.cx+__kp.view.r*1.17<innerWidth&&__kp.view.cx-__kp.view.r*1.17>0&&__kp.view.cy-__kp.view.r*1.17>0`));
T('İngilizce başlık sığar', await b.eval(`document.querySelector('#mCenter .title').getBoundingClientRect().width<__kp.view.r*1.55`));
await b.eval(`__kp.save.anim=false;__kp.applyMotion()`);
await b.tapSlice(45);
T('animasyon kapalı: zorluklar hemen', await b.wait(`${M}.lvl===1&&${M}.hv===1`, 300));
await b.tapSlice(0);
T('animasyon kapalı: zorluk çalışır', await b.wait(`${G}.mode==='play'`, 300));
T('konsol temiz', !b.logs.length, b.logs.join(' | '));
await b.close();
/* oyun sonu: ikinci şans kadranı, süre bitince alt sayfa */
b = await open({});
await b.eval(`${S}.bests.normal=128;${S}.coins=100;${S}.obM=0;__kp.start();${G}.score=74;${G}.n=36;${G}.raw=60;__kp.die()`);
T('çember yanar, sonra ikinci şans kadranı', await b.wait(`${G}.mode==='over'&&__kp.OV.st==='ch'&&__kp.OV.k===1`, 6000));
T('üst bilgi gizli, sayfa kapalı', await b.eval(`getComputedStyle(document.getElementById('hud')).opacity==='0'&&getComputedStyle(document.getElementById('ovSheet')).visibility==='hidden'`));
await b.sleep(200); await shot(b, 'o1-sans');
const t1 = Date.now();
await b.eval(`__kp.save.coins=100`);
await b.tapSlice(263);
T('altın dilimi: oyun sürer, 25 altın gider', await b.wait(`${G}.mode==='play'&&${S}.coins===75`, 800), Date.now() - t1 + ' ms');
T('üst bilgi geri geldi', await b.wait(`getComputedStyle(document.getElementById('hud')).opacity==='1'&&${G}.contN===1`, 1500));
await b.eval(`__kp.die()`);
await b.wait(`${G}.mode==='over'&&__kp.OV.st==='ch'`, 6000);
T('süre dolunca alt sayfa', await b.wait(`__kp.OV.st==='end'`, 8000));
await b.sleep(700); await shot(b, 'o2-sayfa');
T('kadran sayfanın üstüne küçülür', await b.eval(`(()=>{const v=__kp.view,t=document.getElementById('ovSheet').getBoundingClientRect().top;return v.cy+v.r*1.3<t&&v.cy-v.r*1.3>0&&v.r<120})()`), await b.eval(`__kp.view.r`));
T('Tekrar dene dokunulabilir', await b.eval(`(()=>{const e=document.getElementById('againBtn'),r=e.getBoundingClientRect(),h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return h===e||e.contains(h)})()`));
const ag = await b.eval(`(()=>{const r=document.getElementById('againBtn').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()`);
await b.touch(ag[0], ag[1]);
T('Tekrar dene: yeni oyun', await b.wait(`${G}.mode==='play'&&${G}.contN===0&&__kp.OV.st===''`, 800));
/* duraklatma: oyunu kapatmaz */
await b.close();
b = await open({});
await b.eval(`__kp.start();__kp.G.score=48;__kp.G.mode='pause';var e=document.getElementById('pause');e.classList.add('on');e.removeAttribute('aria-hidden')`);
await b.sleep(500); await shot(b, 'o3-duraklat');
T('duraklatma oyunu kapatmaz: pencere halkanın altında', await b.eval(`(()=>{const v=__kp.view,r=document.querySelector('.pwin').getBoundingClientRect();return r.top>v.cy+v.r&&r.bottom<=innerHeight&&getComputedStyle(document.getElementById('pause')).backgroundColor==='rgba(0, 0, 0, 0)'})()`));
T('konsol temiz', !b.logs.length, b.logs.join(' | '));
await b.close();
console.log(fail ? fail + ' HATA' : 'hepsi geçti');
process.exit(fail ? 1 : 0);
