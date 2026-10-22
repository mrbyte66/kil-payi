/* Yayın derlemesi (karıştırılmış, kancasız) duman testi: node tools/smoke-release.mjs [www/index.html]
   Neden: karıştırılmış kodu hook olmadan doğrulamanın tek yolu davranışı dışarıdan görmek. Başsız Chrome'da açar; konsol hatası yok, menü görünür, Oyna ile oyun başlar, HUD çıkar,
   birkaç saniye hata olmadan döner, Ayarlar açılıp kapanır, mağaza açılıp kapanır. Hata varsa 1 ile çıkar. */
import { launch } from './cdp.mjs';
import { resolve } from 'node:path';
const file = resolve(process.argv[2] || 'www/index.html');
const b = await launch({ width: 390, height: 844, dpr: 2, lang: 'tr-TR', seed: 'document.documentElement.setAttribute("data-theme","light");' });
const out = []; let bad = 0;
const T = (n, c, e) => { if (c) out.push('ok   ' + n); else { bad++; out.push('HATA ' + n + (e !== undefined ? ' → ' + JSON.stringify(e) : '')); } };
const click = sel => b.eval(`(function(){var e=document.querySelector(${JSON.stringify(sel)});if(!e)return 'YOK';e.dispatchEvent(new MouseEvent('click',{bubbles:true}));return 'ok'})()`);
await b.goto('file://' + file);
await b.sleep(1500);
T('menü görünür, hook yok', await b.eval('document.getElementById("menu").classList.contains("on")&&!window.__kp&&!document.documentElement.innerHTML.includes("__kp")'));
T('Türkçe metinler yüklü (Oyna düğmesi)', await b.eval('document.getElementById("playBtn").textContent.trim().length>0'), await b.eval('document.getElementById("playBtn").textContent'));
T('Ayarlar açılır', (await click('#setBtn')) === 'ok' && (await (async () => { await b.sleep(500); return b.eval('document.getElementById("settings").classList.contains("on")'); })()));
await click('#setClose'); await b.sleep(400);
await click('#bagBtn'); await b.sleep(1800);
T('mağaza açılır, dört cephe', await b.eval('document.getElementById("shop").classList.contains("on")&&document.querySelectorAll("#stHub .fc").length===4'));
await click('#stHub [data-a=close]'); await b.sleep(1200);
T('mağaza kapanır', await b.eval('!document.getElementById("shop").classList.contains("on")'));
await click('#playBtn'); await b.sleep(2500);
T('Oyna: oyun başladı (HUD açık)', await b.eval('document.getElementById("hud").classList.contains("on")&&document.getElementById("app").classList.contains("playing")'));
await b.sleep(4000);
T('oyun hatasız ilerliyor (puan/süre öğeleri var)', await b.eval('!!document.getElementById("hudScore")&&document.getElementById("cv").width>100'));
T('konsol hatası ve istisna yok', b.logs.length === 0, b.logs);
await b.close();
// ilk açılış yolu: ısınma örtüsü görünür, biter, menü açılır, mağaza sorunsuz (kayıtsız temiz profil; NO_WARM bayrağı yok)
const w = await launch({ width: 390, height: 844, dpr: 2, lang: 'en-US', warm: true, seed: 'document.documentElement.setAttribute("data-theme","light");' });
await w.goto('file://' + file); await w.sleep(250);
T('ilk açılış: örtü hemen görünür', await w.eval('document.getElementById("warmVeil").classList.contains("on")'));
let gone = false; for (let i = 0; i < 160 && !gone; i++) { await w.sleep(150); gone = await w.eval('!document.getElementById("warmVeil").classList.contains("on")'); }
T('ilk açılış: ısınma bitip örtü kalktı', gone);
T('ilk açılış sonrası kayıtta warm=1', await w.eval('JSON.parse(localStorage.getItem("kilpayi.v1")).warm===1'));
T('ilk açılış sonrası menü açık ve dokunulabilir', await w.eval('(function(){var e=document.getElementById("playBtn"),r=e.getBoundingClientRect(),h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return document.getElementById("menu").classList.contains("on")&&h&&h.closest("#playBtn")})()'));
await w.eval('document.getElementById("bagBtn").dispatchEvent(new MouseEvent("click",{bubbles:true}))'); await w.sleep(1800);
T('ilk açılış sonrası mağaza açılır', await w.eval('document.getElementById("shop").classList.contains("on")&&document.querySelectorAll("#stHub .fc").length===4'));
T('ilk açılış yolunda konsol hatası yok', w.logs.length === 0, w.logs);
await w.close();
console.log(out.join('\n'));
console.log(bad ? 'DUMAN TESTİ BAŞARISIZ' : 'duman testi tamam'); process.exit(bad ? 1 : 0);
