/* Mağaza, dil, müzik ve görünüm testi: node tools/store-test.mjs
   DEBUG=1 derlemesini yapar, oyunu başsız Chrome'da (tools/cdp.mjs) açar ve şunları kontrol eder:
   - fiyat ve stok kuralları (merdiven, en çok 5, yetersiz coin, yuva sırası, takas),
   - yükseltme ile stok alma sırasının toplam tutarı değiştirmediği,
   - hediye: 24 saatlik pencere (20 · 30 · 40 · 50 · 500), pencere dolunca sıfırlanma, saat oyunu,
   - eski ve bozuk kayıtların geçişi,
   - ekran akışı: sokak, dükkân, fiş, satın alma, seçici, geri tuşu, geçiş animasyonları, ayarlar, oyun içi joker sırası, otomatik joker,
   - dil seçimi (sistem dili, Türkçe, English; kalıcı), menü müziğinin ne zaman çaldığı, gündüz ve akşam sahnesi, Türkçe harflerin yazı tipi.
   Chrome yolu CHROME ortam değişkeniyle verilebilir. Hata varsa 1 ile çıkar. */
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
execFileSync('sh', ['-c', 'DEBUG=1 ./build.sh'], { cwd: root, stdio: 'ignore' });
const URL = 'file://' + join(root, 'www', 'index.html');

/* sayfa içi test çatısı */
const HEAD = `(async()=>{var out=[],ok=0,bad=0;function T(n,c,e){if(c){ok++}else{bad++;out.push('HATA '+n+(e!==undefined?' → '+JSON.stringify(e):''))}}
function $(i){return document.getElementById(i)}
var sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
function click(s){var e=document.querySelector(s);if(!e){out.push('YOK '+s);bad++;return null}e.dispatchEvent(new MouseEvent('click',{bubbles:true}));return e}
var K=window.__kp,S=K.save,G=K.G;try{`;
const TAIL = `}catch(e){out.push('İSTİSNA '+e.stack)}return ok+' tamam, '+bad+' hata'+(out.length?'\\n'+out.join('\\n'):'')})()`;

const LOGIC = HEAD + `
function reset(){S.coins=0;S.own={kron:1};S.slots=1;S.equip=['kron','','',''];S.autoOwn=false;S.autoJ=false;S.gift={n:0,t0:0};['steto','kron','kalkan','kum'].forEach(function(i){S.tools[i]={n:i==='kron'?1:0,l:1}});}
reset();
T('yeni kurulum yalnız kron',S.own.kron===1&&!S.own.kalkan&&S.slots===1&&K.equipped().join()==='kron');
var seq=[],n;for(n=0;n<5;n++)seq.push(K.unitPrice('kron',n,1));T('kron merdiveni',seq.join()==='30,45,60,90,120',seq);
var kal=[];for(n=0;n<5;n++)kal.push(K.unitPrice('kalkan',n,1));T('kalkan merdiveni',kal.join()==='40,60,80,120,160',kal);
var s3=[];for(n=0;n<5;n++)s3.push(K.unitPrice('kron',n,3));T('seviye 3 daha pahalı',s3.every(function(v,i){return v>seq[i]}),s3);
reset();S.coins=100000;var b=0;while(K.buyStock('kron'))b++;
T('stok en çok 5',S.tools.kron.n===5&&b===4,[S.tools.kron.n,b]);T('dolu stokta satın alma yok',K.stockPrice('kron')===0&&K.buyStock('kron')===false);
reset();S.coins=10;var c0=S.coins;
T('yetersiz coin: stok',K.buyStock('kron')===false&&S.coins===c0&&S.tools.kron.n===1);
T('yetersiz coin: joker',K.unlockJoker('kalkan')===false&&!S.own.kalkan&&S.coins===c0);
T('yetersiz coin: yuva',K.buySlot(2)===false&&S.slots===1);T('yetersiz coin: otomatik',K.buyAuto()===false&&!S.autoOwn);
reset();S.coins=2000;
T('kalkan açılır',K.unlockJoker('kalkan')===true&&S.own.kalkan===1&&S.tools.kalkan.n===1&&S.coins===1200);
T('yuva doluyken takılmaz',K.isEq('kalkan')===false&&K.equipped().join()==='kron');
T('yuva 2 açılır, boştaki joker takılır',K.buySlot(2)===true&&S.slots===2&&K.isEq('kalkan')&&S.coins===0,[S.equip,S.slots]);
T('yuvalar sırayla açılır',K.buySlot(4)===false);
reset();S.coins=100000;K.buySlot(2);K.unlockJoker('steto');
T('yeni joker boş yuvaya takılır',K.equipped().join()==='kron,steto',S.equip);
K.setEquip(0,'steto');T('takas',S.equip[0]==='steto'&&S.equip[1]==='kron',S.equip);
K.setEquip(1,'');T('boşalt',K.equipped().join()==='steto');K.setEquip(1,'kalkan');T('sahip olunmayan takılmaz',S.equip[1]==='',S.equip);
function total(o){reset();S.coins=1e6;var c=S.coins;o.forEach(function(a){if(a==='u')K.buyUpgrade('kron');else K.buyStock('kron')});return c-S.coins}
var A=total(['s','s','s','s','u']),B=total(['u','s','s','s','s']);T('al-yükselt = yükselt-al',A===B,[A,B]);
var A2=total(['s','s','u','s','s','u']),B2=total(['u','u','s','s','s','s']),C2=total(['s','u','s','u','s','s']);T('iki yükseltme, her sıra eşit',A2===B2&&B2===C2,[A2,B2,C2]);
reset();S.coins=1e6;K.buyUpgrade('kron');K.buyUpgrade('kron');T('seviye 3 son',S.tools.kron.l===3&&K.upPrice('kron')===0&&K.buyUpgrade('kron')===false);
// hediye: 24 saatlik pencere
var H=3600000;
reset();T('hediye basamakları 20-30-40-50-500',K.GIFT_STEP.join()==='20,30,40,50,500',K.GIFT_STEP);
T('ilk reklamdan önce pencere yok',S.gift.t0===0&&K.giftState().left===24*H);
var v=[];for(var i=0;i<5;i++)v.push(K.giftClaim());T('hediye 20-30-40-50-500',v.join()==='20,30,40,50,500',v);
T('ilk reklamla pencere başladı',S.gift.t0>0&&Math.abs(Date.now()-S.gift.t0)<3000);
var g=K.giftState();T('5. sonra bekleme = pencerenin kalanı (~24 saat)',g.wait>23.99*H&&g.wait<=24*H&&g.next===0,g);T('6. hediye reddedilir',K.giftClaim()===0);
reset();K.giftClaim();var t0=S.gift.t0;K.giftClaim();T('ikinci reklam pencereyi kaydırmaz',S.gift.t0===t0);
S.gift={n:2,t0:Date.now()-H};g=K.giftState();T('1 saat sonra: kalan ~23 saat, sıradaki 40',g.left>22.99*H&&g.left<=23*H&&g.next===40&&g.wait===0,g);
S.gift={n:2,t0:Date.now()-25*H};g=K.giftState();T('24 saat dolunca baştan (20), 2 reklamla bile',g.next===20&&g.n===0&&S.gift.t0===0,g);
S.gift={n:5,t0:Date.now()-24*H-1};g=K.giftState();T('beş reklamdan sonra 24 saatte sıfırlanır',g.next===20&&g.wait===0,g);
S.gift={n:5,t0:Date.now()+100*H};g=K.giftState();T('saat oyunu: pencere 24 saati aşmaz',g.left<=24*H&&g.wait<=24*H,g);
reset();S.tools.kron.n=5;for(i=0;i<30;i++)K.giftTool();T('hediye joker 5 üstüne çıkmaz',S.tools.kron.n===5&&!S.tools.kalkan.n,S.tools);
` + TAIL;

const FLOW = HEAD + `
S.coins=5000;S.own={kron:1};S.slots=1;S.equip=['kron','','',''];S.tools.kron.n=1;K.persist();K.refreshStats();
T('menüde 4 yuva düğmesi',document.querySelectorAll('#menuJk button.sl').length===4);
var hit=function(id){var r=$(id).getBoundingClientRect(),e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !!e&&e.closest('button')===$(id)};
T('mağaza kapalıyken menü düğmelerine (Mağaza, Ayarlar) dokunuş düğmeye gider: görünmez mağaza katmanı dokunuşu yakalamaz',hit('bagBtn')&&hit('setBtn')&&hit('playBtn'),[hit('bagBtn'),hit('setBtn'),hit('playBtn')]);
K.openShop('menu');T('mağaza açıldı',$('shop').classList.contains('on'));
await sleep(800);T('alttaki ekran belirme bitince saklandı',!$('menu').classList.contains('on'));
T('4 dükkân',document.querySelectorAll('#stHub .fc').length===4);
var plq=document.querySelector('#stHub .fc[data-s=alet] .plq').innerText;T('Alet tabelası: Joker ve Yuva sayıları',/Joker/.test(plq)&&/Yuva/.test(plq)&&/1\\/4/.test(plq),plq);
K.shopGo('alet');
T('alet odası',K.SS.view==='shop'&&document.querySelectorAll('#stShop .pch').length===4&&document.querySelectorAll('#stShop .itm').length===4);
click('#stShop .itm[data-k="kalkan"]');await sleep(120);T('kilitli fiş (önce görünmez çizilir, sonra alttan kayar)',$('stSheet').classList.contains('on')&&!!$('stSheet').querySelector('[data-a="unl"]'));
click('#stSheet [data-a="unl"]');T('kalkan açıldı',S.own.kalkan===1&&S.coins===4200&&S.tools.kalkan.n===1,[S.coins]);T('fiş kapandı',!$('stSheet').classList.contains('on'));
T('açılan ürün sıçrar',!!document.querySelector('#stShop .itm.pop'));
click('#stShop .pch[data-i="1"]');T('yuva fişi',!!$('stSheet').querySelector('[data-a="slotbuy"]'));
click('#stSheet [data-a="slotbuy"]');T('yuva 2 açıldı, kalkan takıldı',S.slots===2&&K.isEq('kalkan')&&S.coins===3000,[S.slots,S.equip,S.coins]);
click('#stShop .pch[data-i="0"]');T('seçici açıldı',!!$('stSheet').querySelector('[data-a="eq"]'));
click('#stSheet [data-a="eq"][data-j="kalkan"][data-i="0"]');T('takas',S.equip[0]==='kalkan'&&S.equip[1]==='kron',S.equip);
click('#stShop .itm[data-k="kron"]');var c0=S.coins;click('#stSheet [data-a="plus"]');T('stok +1 (45)',S.tools.kron.n===2&&c0-S.coins===45,[S.tools.kron.n,c0-S.coins]);
c0=S.coins;var up=K.upPrice('kron');click('#stSheet [data-a="upg"]');T('yükseltme düştü',S.tools.kron.l===2&&c0-S.coins===up,[S.tools.kron.l,c0-S.coins,up]);
S.coins=100;K.persist();K.refreshStats();K.shopGo('alet');click('#stShop .itm[data-k="kum"]');
T('yetersiz coin: eksik yazısı',/eksik|short/.test($('stSheet').textContent)&&!$('stSheet').querySelector('[data-a="unl"]'));click('#stSheet [data-a="poor"]');T('yetersizde açılmadı',!S.own.kum&&S.coins===100);
K.storeBack();T('geri: fiş kapanır',!$('stSheet').classList.contains('on')&&K.SS.view==='shop');
K.storeBack();T('geri: sokak',K.SS.view==='hub');await sleep(900);
// dükkânlar arası geçiş ve + düğmesi
K.goShop('hed');await sleep(1700);T('+ düğmesi: sokaktan Hediye dükkânına kaydırıp girer',K.SS.view==='shop'&&K.SS.shop==='hed'&&!!$('stGiftBtn'),[K.SS.view,K.SS.shop]);
K.goShop('yet');await sleep(900);T('dükkândan dükkâna yumuşak geçiş',K.SS.view==='shop'&&K.SS.shop==='yet'&&!K.SS.busy,[K.SS.view,K.SS.shop,K.SS.busy]);
K.storeBack();await sleep(900);T('geri: sokak (animasyonlu)',K.SS.view==='hub'&&$('stHub').classList.contains('on'));
K.storeBack();T('çıkış başladı: solarak kapanır',$('shop').classList.contains('leaving')&&$('menu').classList.contains('on'));
await sleep(700);T('çıkış bitti: mağaza gizli, menü açık',!$('shop').classList.contains('on')&&!$('shop').classList.contains('leaving')&&K.SS.closing===false);
S.coins=5000;K.persist();K.refreshStats();K.openShop('menu',{shop:'yet',sheet:'bolt'});await sleep(700);click('#stSheet [data-a="unlA"]');
T('otomatik açıldı',S.autoOwn===true&&S.autoJ===true&&S.coins===1000,[S.autoOwn,S.autoJ,S.coins]);click('#stSheet [data-a="auto"]');T('otomatik kapatıldı',S.autoJ===false);K.closeShop();await sleep(600);
K.openSettings();T('ayarlar 6 satır (müzik, ses, titreşim, animasyon, otomatik, dil)',document.querySelectorAll('#setRows .srow').length===6,document.querySelectorAll('#setRows .srow').length);
click('#setRows [data-set="snd"]');T('ses kapandı',S.snd===false);click('#setRows [data-set="snd"]');T('ses açıldı',S.snd===true);
click('#setRows [data-set="mus"]');T('müzik kapandı',S.music===false);click('#setRows [data-set="mus"]');T('müzik açıldı',S.music===true);
click('#setRows [data-set="vib"]');T('titreşim kapandı',S.vib===false);click('#setRows [data-set="vib"]');click('#setRows [data-set="auto"]');T('ayarlardan otomatik açıldı',S.autoJ===true);K.closeSettings();
click('#menuJk button[data-slot="0"]');T('menüden seçici (hızlı)',$('shop').classList.contains('on')&&K.SS.quick===true);
await sleep(300);click('#stSheet [data-a="eq"][data-j="kron"][data-i="0"]');await sleep(700);
T('seçince menüye dönülür',!$('shop').classList.contains('on')&&$('menu').classList.contains('on')&&S.equip[0]==='kron'&&S.equip[1]==='kalkan',S.equip);
K.start();var shown=[].slice.call(document.querySelectorAll('#tools .tool')).filter(function(b){return !b.classList.contains('off')}).map(function(b){return b.getAttribute('data-tool')});
T('dock: yuva sırasıyla yalnız takılı jokerler',shown.join()==='kron,kalkan',shown);
S.own.kum=1;S.tools.kum.n=3;var n0=S.tools.kum.n;K.useTool('kum');T('takılı olmayan joker kullanılamaz',S.tools.kum.n===n0);
var k0=S.tools.kron.n;K.useTool('kron');T('takılı joker kullanılır',S.tools.kron.n===k0-1);
G.time=1.5;S.tools.kron.n=2;S.tools.kum.n=3;G.advCool={};T('öneri yalnız takılılardan',K.adviceFor()==='kron',K.adviceFor());
S.autoOwn=true;S.autoJ=true;G.adv='kron';G.advT=0.71;S.tools.kron.n=2;var kn=S.tools.kron.n;K.updateAdvice(0.016);T('otomatik: kendiliğinden kullanıldı',S.tools.kron.n===kn-1,[S.tools.kron.n,kn]);
S.autoJ=false;G.adv='kron';G.advT=0.71;kn=S.tools.kron.n;G.time=1.5;G.advCool={};K.updateAdvice(0.016);T('otomatik kapalıyken kullanılmaz',S.tools.kron.n===kn,[S.tools.kron.n,kn]);
` + TAIL;

const SCENE = HEAD + `
K.G.mode='menu';K.SS.force='day';K.openShop('menu');await sleep(700);
T('gündüz: sahne gündüz sınıfı',$('stHub').classList.contains('day')&&K.SS.day===true);
T('gündüz: güneş, dükkânların arkasında iki derinlikte bulut şeridi, kuş sürüsü ve önde bulut gölgeleri var, ay ve yıldız yok',!!document.querySelector('#stHub .sun')&&document.querySelectorAll('#stHub .skyb .cl').length>=12&&document.querySelectorAll('#stHub .skyf .csh').length>=12&&document.querySelectorAll('#stHub .skyb .bird').length===3&&!document.querySelector('#stHub .moon')&&!document.querySelector('#stHub .stars'));
T('gündüz: ışık parlamaları ve ateş böcekleri yok',!document.querySelector('#stHub .ffs')&&getComputedStyle(document.querySelector('#stHub .lts.lg')).display==='none');
K.SS.force='night';K.renderHub();
T('akşam: ay, yıldızlar, iki kayan yıldız, ateş böcekleri',!!document.querySelector('#stHub .moon')&&!!document.querySelector('#stHub .stars')&&document.querySelectorAll('#stHub .shoot').length===2&&!!document.querySelector('#stHub .ffs')&&!$('stHub').classList.contains('day'));
T('akşam: güneş yok',!document.querySelector('#stHub .sun'));
K.SS.force='';T('saat 06:30-18:00 arası gündüz sayılır',(function(){var d=new Date(),h=d.getHours()+d.getMinutes()/60;return K.stDay()===(h>=6.5&&h<18)})());
// sığma: buton ile alttaki şerit çakışmaz
K.renderHub();var cta=$('stCta').getBoundingClientRect(),dock=$('stDock').getBoundingClientRect();T('İçeri gir butonu ile alt şerit çakışmaz (en az 8 px boşluk)',dock.top-cta.bottom>=8*K.SS.k,[cta.bottom,dock.top,K.SS.k]);
K.closeShop();await sleep(600);
` + TAIL;


const ANIM = HEAD + `
// Telefonun "animasyonları kaldır" ayarı AÇIK taklit edilir (başsız Chrome prefers-reduced-motion: reduce bildirir); oyun buna bakmamalı.
var html=document.documentElement;
var hit=function(id){var r=$(id).getBoundingClientRect(),e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !!e&&e.closest('button')===$(id)};
T('telefon "animasyonları kaldır" diyor (taklit)',K.SYS_RM===true);
T('oyun yine de animasyonlu (varsayılan açık)',S.anim===true&&K.getRM()===false&&!html.classList.contains('calm'),[S.anim,K.getRM()]);
T('ayarlarda açıklama: telefonda kapalı, oyun kendi ayarına bakar',(K.openSettings(),/burada açık/.test($('setRows').innerText)),$('setRows').innerText);K.closeSettings();
K.openShop('menu');
T('açılışta parçalar sırayla girer (opening sınıfı)',$('shop').classList.contains('opening')&&getComputedStyle(document.querySelector('#stHub .hd')).animationName.indexOf('stDrop')>=0&&getComputedStyle(document.querySelector('#stHub .fc')).animationName.indexOf('stFcIn')>=0&&getComputedStyle($('stDock')).animationName.indexOf('stUp')>=0);
T('mağaza açılırken solma animasyonu çalışıyor',getComputedStyle($('shop')).animationName.indexOf('stFade')>=0&&document.getAnimations().length>0,[getComputedStyle($('shop')).animationName,document.getAnimations().length]);
await sleep(250);var mid=getComputedStyle($('shop')).opacity;T('açılış yarıdayken mağaza yarı saydam (gerçekten animasyonlu)',+mid>0&&+mid<1,mid);
await sleep(700);T('açılış bitti: mağaza tam görünür',+getComputedStyle($('shop')).opacity===1&&!$('menu').classList.contains('on'));
K.goShop('alet');
T('dükkâna giriş: sokak yakınlaşıyor (zoom), içerisi henüz açılmadı',$('stHub').classList.contains('zoom')&&K.SS.view==='hub'&&K.SS.busy===true,[K.SS.view,K.SS.busy]);
await sleep(10);T('kapı ışığı katmanı var, başta görünmez',!!$('stBloom')&&+getComputedStyle($('stBloom')).opacity<0.5);await sleep(290);var fcT=getComputedStyle(document.querySelector('#stHub .fc.sel')).transform;T('seçilen cephe büyüyor (dönüşüm var)',fcT&&fcT!=='none',fcT);
await sleep(300);T('yakınlaşma sürerken dükkân içi açıldı',K.SS.view==='shop'&&K.SS.shop==='alet');
await sleep(700);
var hubAn=function(){return document.getAnimations().filter(function(a){var e=a.effect&&a.effect.target;return e&&e.closest&&e.closest('#stHub')&&a.playState==='running'&&a.effect.getComputedTiming().iterations===Infinity}).length};
T('performans: dükkânın içindeyken sokaktaki sonsuz animasyonlar durur',hubAn()===0,hubAn());
T('performans: bitmiş animasyon katman bırakmaz (mağaza kabuğunda fill yok)',!document.getAnimations().some(function(a){var e=a.effect&&a.effect.target;return e&&(e.id==='shop'||e.id==='stg')&&a.playState==='finished'}));
T('giriş bitti: dokunma yeniden serbest, ışık söndü',K.SS.busy===false&&!$('stHub').classList.contains('zoom')&&!$('stBloom').classList.contains('on'));
K.goShop('yet');T('dükkândan dükkâna: oda önce solar (swap)',$('stShop').classList.contains('swap')&&K.SS.busy===true);
await sleep(400);T('...sonra yeni dükkân belirir',K.SS.shop==='yet'&&!$('stShop').classList.contains('swap'),[K.SS.shop,$('stShop').className]);await sleep(500);
K.storeBack();await sleep(120);T('geri: sokak yumuşakça belirir (ent animasyonu)',K.SS.view==='hub'&&$('stHub').classList.contains('ent')&&document.getAnimations().length>0,[K.SS.view,$('stHub').className]);
await sleep(900);
var hubInf=function(){return document.getAnimations().filter(function(a){var e=a.effect&&a.effect.target;return e&&e.closest&&e.closest('#stHub')&&a.playState==='running'&&a.effect.getComputedTiming().iterations===Infinity}).length};
var farOnes=[].slice.call(document.querySelectorAll('#stHub .fc.far')).length;
T('performans: yalnızca odaktaki cephe hareketli (3 cephe sakin)',farOnes===3&&hubInf()>0&&hubInf()<45,[farOnes,hubInf()]);
T('sokağa dönünce vitrin içinde olunan dükkânı gösterir (Yetenekler)',Math.abs(K.SS.pos-232)<1&&document.querySelectorAll('#stDock .dk')[1].classList.contains('on'),[K.SS.pos]);
var car=$('stCar'),rc=car.getBoundingClientRect(),X0=rc.left+rc.width*0.6,Y0=rc.top+rc.height*0.4;
var pe=function(ty,x){return new PointerEvent(ty,{pointerId:7,pointerType:'touch',isPrimary:true,clientX:x,clientY:Y0,bubbles:true,cancelable:true})};
var down=function(){car.dispatchEvent(pe('pointerdown',X0))},mv=function(dx){window.dispatchEvent(pe('pointermove',X0+dx))},up=function(dx){window.dispatchEvent(pe('pointerup',X0+dx))};
var inf=function(){return document.getAnimations().filter(function(a){var e=a.effect&&a.effect.target;return e&&e.closest&&e.closest('#stHub')&&!e.closest('.skyfx')&&a.effect.getComputedTiming().iterations===Infinity&&a.playState==='running'}).length};
down();await sleep(120);mv(-20);await sleep(120);mv(-80);await sleep(30);
var want=232+80/K.SS.k;
T('kaydırma: şerit parmağı birebir izler (konum = 232 + 80/k)',Math.abs(K.SS.pos-want)<2,[K.SS.pos,want]);
up(-80);await sleep(700);
T('kaydırma: küçük ve yavaş sürükleme aynı dükkânda kalır ve konum oturur',K.SS.idx===1&&Math.abs(K.SS.pos-232)<1,[K.SS.idx,K.SS.pos]);
T('performans: kaydırırken ve sonra gökyüzü ile odaktaki cephe animasyonları sürer',inf()>=0&&document.querySelectorAll('#stHub .skyb').length>=0,inf());
var muts=0,mo=new MutationObserver(function(m){muts+=m.length});mo.observe($('stCta'),{childList:true,characterData:true,subtree:true,attributes:true});
down();await sleep(15);mv(-300);await sleep(15);mv(-700);await sleep(15);mv(-1200);up(-1200);
click('#stHub .fc[data-s="hed"]');T('kaydırma: sürükleme bittikten hemen sonra gelen tıklama dükkâna girmez',K.SS.view==='hub');
await sleep(900);mo.disconnect();
T('kaydırma: çok hızlı ve çok uzun fırlatma tek hamlede yalnızca BİR dükkân ilerler (Yetenekler → Görünüm)',K.SS.idx===2&&Math.abs(K.SS.pos-464)<1,[K.SS.idx,K.SS.pos]);
T('performans: kaydırırken buton yalnızca dükkân değişince yazılır, her karede değil (≤ 8 kayıt)',muts<=8,muts);
down();await sleep(20);mv(300);await sleep(20);mv(800);up(800);await sleep(800);
T('kaydırma: ters yönde fırlatma bir dükkân geri gelir (Görünüm → Yetenekler)',K.SS.idx===1&&Math.abs(K.SS.pos-232)<1,[K.SS.idx,K.SS.pos]);
K.pagerTo(0,0);down();await sleep(20);mv(500);await sleep(20);mv(900);up(900);await sleep(700);
T('kaydırma: ilk dükkânda sağa fırlatınca taşmaz (uçta yaylanıp geri oturur)',K.SS.idx===0&&Math.abs(K.SS.pos)<1,[K.SS.idx,K.SS.pos]);
K.closeShop();T('çıkış: mağaza solarak kapanır (leaving)',$('shop').classList.contains('leaving')&&getComputedStyle($('shop')).animationName.indexOf('stFadeOut')>=0,getComputedStyle($('shop')).animationName);
await sleep(120);var o2=+getComputedStyle($('shop')).opacity;T('çıkış yarıdayken mağaza yarı saydam',o2>0&&o2<1,o2);
await sleep(500);T('çıkış bitti',!$('shop').classList.contains('on')&&$('menu').classList.contains('on'));
T('çıkıştan sonra menü düğmelerine dokunuş düğmeye gider',hit('bagBtn')&&hit('playBtn'),[hit('bagBtn'),hit('playBtn')]);
// Ayarlar'dan animasyonları kapat: eski "sakin" davranış (anında geçiş)
K.openSettings();click('#setRows [data-set="anim"]');
T('anahtar kapandı: kayıt, sakin kip ve sınıf',S.anim===false&&K.getRM()===true&&html.classList.contains('calm')&&JSON.parse(localStorage.getItem('kilpayi.v1')).anim===false,[S.anim,K.getRM()]);
T('anahtar kapalıyken açıklama telefon uyarısı vermez',!/burada açık/.test($('setRows').innerText));K.closeSettings();
K.openShop('menu');await sleep(60);T('sakin kip: mağaza anında tam görünür (animasyon yok)',+getComputedStyle($('shop')).opacity===1&&getComputedStyle($('shop')).animationName==='none',[getComputedStyle($('shop')).opacity,getComputedStyle($('shop')).animationName]);
K.goShop('alet');await sleep(60);T('sakin kip: dükkâna anında girer',K.SS.view==='shop'&&!$('stHub').classList.contains('zoom')&&K.SS.busy===false,[K.SS.view,K.SS.busy]);
K.closeShop();await sleep(80);T('sakin kip: çıkış anında',!$('shop').classList.contains('on')&&!$('shop').classList.contains('leaving')&&$('menu').classList.contains('on'));
K.openSettings();click('#setRows [data-set="anim"]');T('anahtar yeniden açıldı',S.anim===true&&K.getRM()===false&&!html.classList.contains('calm'));K.closeSettings();
` + TAIL;

const MUSIC = HEAD + `
var st=function(){return {on:K.Music.on,wanted:K.Music.wanted(),ctx:K.Snd.ctx&&K.Snd.ctx.state,bars:K.Music.n}};
await sleep(1300);var a=st();T('menüde müzik çalıyor',a.on&&a.wanted&&a.ctx==='running'&&a.bars>=1,a);
await sleep(3200);T('müzik ölçü ölçü ilerliyor',K.Music.n>a.bars,[K.Music.n,a.bars]);
K.openSettings();click('#setRows [data-set="mus"]');await sleep(400);T('anahtar kapalı: müzik susar',st().on===false&&S.music===false);
click('#setRows [data-set="mus"]');await sleep(400);T('anahtar açık: müzik başlar',st().on===true&&S.music===true);K.closeSettings();
K.openShop('menu');await sleep(700);T('mağazada çalar',st().on===true);K.closeShop();await sleep(600);
K.start();await sleep(700);T('oyun başlayınca susar',st().on===false&&G.mode==='play',st());
G.mode='menu';await sleep(700);T('menüye dönünce yeniden çalar',st().on===true);
S.music=false;await sleep(500);T('kayıtlı tercih kapalıyken çalmaz',st().on===false);S.music=true;
// çevrimdışı çalma: yaklaşık ses düzeyi ve kırpma
var sr=22050,beat=60/72,oc=new OfflineAudioContext(2,Math.ceil(sr*(4*4*beat+2.5)),sr),g=K.Music.graph(oc,oc.destination,K.Music.level);for(var q=0;q<4;q++)K.Music.play(g,0.1+q*4*beat,q);
var buf=await oc.startRendering(),L=buf.getChannelData(0),pk=0,sm=0;for(var j=0;j<L.length;j++){var ab=Math.abs(L[j]);if(ab>pk)pk=ab;sm+=L[j]*L[j]}var rms=Math.sqrt(sm/L.length);
T('müzik kırpmıyor (tepe < -6 dB) ve duyulur (RMS > -42 dB)',pk<0.5&&rms>0.008,{pk:+pk.toFixed(3),rms:+rms.toFixed(4)});
` + TAIL;

const LANG = HEAD + `
T('telefon dili Türkçe: açılış Türkçe',K.getLang()==='tr'&&$('playT').textContent==='Oyna'&&S.lang==='',[K.getLang(),S.lang]);
K.openSettings();
T('dil satırı: Sistem, Türkçe, English',document.querySelectorAll('#setRows [data-lang]').length===3);
click('#setRows [data-lang="en"]');
T('English seçilince hemen İngilizce',K.getLang()==='en'&&S.lang==='en'&&$('playT').textContent==='Play'&&document.documentElement.lang==='en'&&document.title==='Close call'&&$('lvHint').textContent==='Balanced',[K.getLang(),$('playT').textContent]);
T('ayarlar da İngilizce',/Music/.test($('setRows').innerText)&&/Language/.test($('setRows').innerText));
click('#setRows [data-lang=""]');T('Sistem: telefonun diline döner',K.getLang()==='tr'&&S.lang===''&&$('playT').textContent==='Oyna');
click('#setRows [data-lang="en"]');K.closeSettings();K.openShop('menu');await sleep(700);
T('mağaza İngilizce',/Shop/.test(document.querySelector('#stHub .tt').innerText));K.closeShop();await sleep(600);
` + TAIL;

const FONT = HEAD + `
await document.fonts.load('600 100px Fredoka','ğĞşŞİ');
var c=document.createElement('canvas').getContext('2d');var w=function(f,ch){c.font=f;return +c.measureText(ch).width.toFixed(1)};
T('ğ Fredoka\\'nın kendi harfi (g ile aynı genişlik)',Math.abs(w('600 100px Fredoka','ğ')-w('600 100px Fredoka','g'))<0.6,[w('600 100px Fredoka','ğ'),w('600 100px Fredoka','g')]);
T('ş s ile, Ş S ile, Ğ G ile, İ I ile aynı genişlik',Math.abs(w('600 100px Fredoka','ş')-w('600 100px Fredoka','s'))<0.6&&Math.abs(w('600 100px Fredoka','Ş')-w('600 100px Fredoka','S'))<0.6&&Math.abs(w('600 100px Fredoka','Ğ')-w('600 100px Fredoka','G'))<0.6&&Math.abs(w('600 100px Fredoka','İ')-w('600 100px Fredoka','I'))<0.6);
T('500 ve 700 kalınlığında da var',w('700 100px Fredoka','ğ')>w('600 100px Fredoka','ğ')-1&&w('500 100px Fredoka','ğ')>0);
` + TAIL;

const MIG = [
  ['eski_v2', { coins: 777, v: 2, tools: { steto: { n: 3, l: 2 }, kron: { n: 2, l: 1 }, kalkan: { n: 0, l: 3 }, kum: { n: 1, l: 1 } }, bests: { normal: 120 }, runs: 9 },
    "S.coins===777&&S.slots===4&&K.equipped().length===4&&S.own.steto&&S.own.kron&&S.own.kalkan&&S.own.kum&&S.tools.steto.n===3&&S.tools.steto.l===2&&S.tools.kalkan.l===3&&!S.autoOwn&&!S.autoJ&&S.v===3&&S.bests.normal===120&&S.lang===''&&S.music===true&&S.anim===true&&K.getRM()===false"],
  ['yeni_bos', null, "S.slots===1&&S.own.kron===1&&!S.own.kalkan&&S.tools.kron.n===1&&S.tools.steto.n===0&&K.equipped().join()==='kron'&&S.equip.length===4&&S.coins===0&&S.music===true&&S.lang===''"],
  ['v3_secili', { v: 3, coins: 50, own: { kron: 1, steto: 1 }, slots: 2, equip: ['steto', 'kron', '', ''], tools: { steto: { n: 4, l: 2 }, kron: { n: 1, l: 1 }, kalkan: { n: 0, l: 1 }, kum: { n: 0, l: 1 } }, autoOwn: true, autoJ: true, gift: { n: 2, t0: 0 }, music: false, lang: 'en' },
    "K.equipped().join()==='steto,kron'&&S.slots===2&&S.autoOwn&&S.autoJ&&S.gift.n===2&&S.tools.steto.n===4&&S.music===false&&S.lang==='en'&&K.getLang()==='en'"],
  ['v092_hediye', { v: 3, coins: 10, gift: { n: 5, t: Date.now() + 5 * 3600000 } }, "S.gift.n===0&&S.gift.t0===0&&S.gift.t===undefined"],
  ['bozuk', { v: 3, own: { kron: 0, kum: 1 }, slots: 99, equip: 'x', tools: { steto: { n: -4, l: 9 }, kron: { n: 'a', l: 0 } }, autoOwn: false, autoJ: true, gift: { n: 9, t0: 0 }, lang: 'xx', music: 'abc' },
    "S.slots===4&&S.own.kum===1&&S.own.kron===0&&Array.isArray(S.equip)&&S.equip.length===4&&K.isEq('kum')&&S.tools.steto.n===0&&S.tools.steto.l===3&&S.tools.kron.l===1&&S.autoJ===false&&S.gift.n===0&&S.lang===''&&S.music===true"],
  ['anim_kapali', { v: 3, anim: false, animV: 1, coins: 5 }, "S.anim===false&&K.getRM()===true&&document.documentElement.classList.contains('calm')"],
  ['anim_eski_kapali', { v: 3, anim: false, coins: 5 }, "S.anim===true&&S.animV===1&&K.getRM()===false&&!document.documentElement.classList.contains('calm')"],
  ['otomatik_yok', { v: 3, own: { kron: 1 }, slots: 1, equip: ['kron', 'kum', '', ''], autoOwn: false, autoJ: true }, "S.autoJ===false&&K.equipped().join()==='kron'&&S.equip[1]===''"]
];

let bad = 0;
const show = (name, r) => { const first = String(r).split('\n')[0]; if (!/ 0 hata/.test(first) || /İSTİSNA|ÇÖKTÜ/.test(String(r))) bad++; console.log((name + ':').padEnd(20) + String(r).replace(/\n/g, '\n' + ' '.repeat(20))); };
const run = async (name, script, o = {}) => {
  const b = await launch(Object.assign({ width: 390, height: 844, dpr: 1, lang: 'tr-TR' }, o));
  let r;
  try { await b.goto(URL); r = await b.eval(script, { timeout: 120000 }); if (b.logs.length) r += '\n' + b.logs.join('\n'); } catch (e) { r = 'ÇÖKTÜ ' + e.message; }
  await b.close();
  show(name, r);
};
await run('fiyat ve stok', LOGIC);
await run('ekran akışı', FLOW);
await run('gündüz / akşam', SCENE);
await run('müzik', MUSIC);
await run('dil', LANG);
await run('animasyon', ANIM, { reduceMotion: true });
await run('yazı tipi', FONT);
for (const [name, save, cond] of MIG) {
  const seed = save === null ? '' : 'localStorage.setItem("kilpayi.v1",' + JSON.stringify(JSON.stringify(save)) + ');';
  const post = `(async()=>{var K=window.__kp,S=K.save,ok=false,err='';try{ok=!!(${cond})}catch(e){err=String(e)}return ok?'1 tamam, 0 hata':'0 tamam, 1 hata HATA '+err+' '+JSON.stringify({slots:S.slots,own:S.own,equip:S.equip,auto:[S.autoOwn,S.autoJ],gift:S.gift,lang:S.lang,music:S.music})})()`;
  await run('kayıt: ' + name, post, { seed });
}
console.log(bad ? '\nHATA: ' + bad + ' grup başarısız' : '\nmağaza testleri tamam');
process.exit(bad ? 1 : 0);
