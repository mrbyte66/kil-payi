/* Kadran menü (V0.12.0): GERÇEK dokunuşla (CDP touch) dilimler, etiketler, Süreli geçişi, kaydırma, yarım oyun. DEBUG=1 derlemesiyle çalışır (`DEBUG=1 ./build.sh`).
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
const ids = ['playBtn', 'sureBtn', 'bagBtn', 'bookBtn', 'setBtn'];
T('etiketler ekranda ve dokunulabilir', await b.eval(`${JSON.stringify(ids)}.every(id=>{const e=document.getElementById(id),r=e.getBoundingClientRect(),h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&(h===e||e.contains(h))})`));
T('etiketler birbirine ve halkaya binmez', await b.eval(`(()=>{const L=['playBtn','sureBtn','bagBtn','bookBtn'].map(i=>document.getElementById(i).getBoundingClientRect()),v=__kp.view;for(let i=0;i<4;i++){for(let j=i+1;j<4;j++){const a=L[i],c=L[j];if(a.left<c.right&&c.left<a.right&&a.top<c.bottom&&c.top<a.bottom)return false}}return true})()`));
await b.touch(195, 790);
await b.sleep(250);
T('halkanın dışına dokunuş oyun başlatmaz', await b.eval(`${G}.mode==='menu'`));
/* beklemek yok: ibre dilimin tam karşısındayken */
await b.eval(`${G}.ang=(0+Math.PI)`);
const t0 = Date.now(); await b.tapSlice(0);
T('ibre karşıdayken bile hemen oyun başlar', await b.wait(`${G}.mode==='play'`, 600), Date.now() - t0 + ' ms');
await b.sleep(700); await shot(b, 'm2-oyun');
T('oyunda halka normal (dilimler sönük)', await b.eval(`${M}.mf<0.05`));
await b.close();

b = await open({});
/* Süreli */
await b.tapSlice(117);
T('Süreli dilimi: halka zorluklara döner', await b.wait(`${M}.lvl===1`, 600));
await b.sleep(120); await shot(b, 'm3-gecis');
T('Cehennem katmanı kayıyor', await b.eval(`getComputedStyle(document.getElementById('mHell')).visibility==='visible'`));
await b.wait(`${M}.hv===1`, 1500); await b.sleep(100); await shot(b, 'm4-sureli');
T('zorluk etiketleri dokunulabilir, ana etiketler değil', await b.eval(`(()=>{const a=document.querySelector('#mSet2 [data-m="cehennem"]').getBoundingClientRect(),h=document.elementFromPoint(a.left+a.width/2,a.top+a.height/2);const p=document.getElementById('playBtn').getBoundingClientRect(),h2=document.elementFromPoint(p.left+p.width/2,p.top+p.height/2);return h&&h.closest('[data-m="cehennem"]')&&!(h2&&h2.closest('#playBtn'))})()`));
const c = await b.center();
await b.touch(c[0], c[1]);
T('orta: Geri', await b.wait(`${M}.lvl===0&&${M}.hv===0`, 1500));
T('Cehennem katmanı gizlendi', await b.eval(`getComputedStyle(document.getElementById('mHell')).visibility==='hidden'`));
/* kaydırma */
await b.touch(340, 760, 120);
T('sola kaydırınca Süreli', await b.wait(`${M}.lvl===1&&${M}.hv===1`, 1500));
await b.touch(60, 760, 300);
T('sağa kaydırınca geri', await b.wait(`${M}.lvl===0&&${M}.hv===0`, 1500));
/* zorluk seçimi */
await b.tapSlice(117); await b.wait(`${M}.hv===1`, 1500);
await b.tapSlice(90);
T('Normal dilimi: oyun başlar', await b.wait(`${G}.mode==='play'&&${S}.lvl==='normal'`, 800));
T('arka plan açığa döner', await b.wait(`${M}.hv===0`, 1500));
await b.close();

b = await open({});
await b.tapSlice(117); await b.wait(`${M}.hv===1`, 1500);
await b.tapSlice(270);
T('Cehennem dilimi: Cehennem başlar', await b.wait(`${G}.mode==='play'&&${S}.lvl==='cehennem'`, 800));
await b.sleep(900); await shot(b, 'm5-cehennem');
T('Cehennem teması açık, katman kalktı', await b.eval(`${G}.thT===1&&getComputedStyle(document.getElementById('mHell')).visibility==='hidden'`));
await b.eval(`__kp.save.lvl='normal'`);
await b.close();

b = await open({});
/* Mağaza, Defter: dilim ve etiket */
await b.tapSlice(200);
T('Mağaza dilimi', await b.wait(`__kp.SS.open`, 800));
await b.eval(`__kp.closeShop()`); await b.sleep(800);
T('mağazadan dönünce etiket dokunuşu alır', await b.eval(`(()=>{const e=document.getElementById('bookBtn'),r=e.getBoundingClientRect(),h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return h===e||e.contains(h)})()`));
const bk = await b.eval(`(()=>{const r=document.getElementById('bookBtn').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()`);
await b.touch(bk[0], bk[1]);
T('Defter etiketi', await b.wait(`document.getElementById('book').classList.contains('on')`, 800));
await b.eval(`document.getElementById('bookClose').click()`); await b.sleep(300);
/* yarım oyun */
await b.eval(`__kp.start();__kp.G.score=42;__kp.persistRun()`);
await b.eval(`document.getElementById('pauseMenuBtn').click()`); await b.sleep(500);
T('yarım oyun: Devam et', await b.eval(`document.getElementById('playT').textContent==='Devam et'&&!document.getElementById('newBtn').hidden`), await b.eval(`document.getElementById('mSub').textContent`));
await shot(b, 'm6-devam');
await b.tapSlice(117); await b.wait(`${M}.hv===1`, 1500);
await b.tapSlice(180);
T('başka zorluk: önce sorar', await b.wait(`document.getElementById('swap').classList.contains('on')`, 800));
await b.eval(`document.getElementById('swapYes').click()`);
T('onaylayınca o zorlukta başlar', await b.wait(`${G}.mode==='play'&&${S}.lvl==='usta'`, 800));
T('konsol temiz', !b.logs.length, b.logs.join(' | '));
await b.close();

/* küçük ekran, İngilizce, animasyon kapalı */
b = await open({ width: 320, height: 568, lang: 'en-US' });
await shot(b, 'm7-kucuk');
T('küçük ekran: etiketler ekranda', await b.eval(`['playBtn','sureBtn','bagBtn','bookBtn'].every(id=>{const r=document.getElementById(id).getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight})`));
T('İngilizce başlık sığar', await b.eval(`document.querySelector('#mCenter .title').getBoundingClientRect().width<__kp.view.r*1.55`));
await b.eval(`__kp.save.anim=false;__kp.applyMotion()`);
await b.tapSlice(117);
T('animasyon kapalı: Süreli hemen', await b.wait(`${M}.lvl===1&&${M}.hv===1`, 300));
await b.tapSlice(0);
T('animasyon kapalı: zorluk çalışır', await b.wait(`${G}.mode==='play'`, 300));
T('konsol temiz', !b.logs.length, b.logs.join(' | '));
await b.close();
console.log(fail ? fail + ' HATA' : 'hepsi geçti');
process.exit(fail ? 1 : 0);
