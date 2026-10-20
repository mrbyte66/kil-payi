/* Mağaza, dil, müzik ve görünüm testi: node tools/store-test.mjs
   DEBUG=1 derlemesini yapar, oyunu başsız Chrome'da (tools/cdp.mjs) açar ve şunları kontrol eder:
   - fiyat ve stok kuralları (merdiven, en çok 5, yetersiz coin, yuva sırası, takas),
   - yükseltme ile stok alma sırasının toplam tutarı değiştirmediği,
   - hediye: 24 saatlik pencere (20 · 30 · 40 · 50 · 500), pencere dolunca sıfırlanma, saat oyunu,
   - eski ve bozuk kayıtların geçişi,
   - ekran akışı: sokak, dükkân, fiş, satın alma, seçici, geri tuşu, geçiş animasyonları, ayarlar, oyun içi joker sırası, otomatik joker,
   - dil seçimi (sistem dili, Türkçe, English; kalıcı), menü müziğinin ne zaman çaldığı, gündüz ve akşam sahnesi, Türkçe harflerin yazı tipi,
   - V0.9.12: oyun hissi (yakın vuruşta sarsıntı ve yavaş çekim yok, ibre hızı yumuşak: artış, yön değişimi, kum saati, ışınlanma; Cehennem parıltısı DOM katmanı; tema adımları seyrek; kapanan mağaza DOM'u boşalır),
   - V0.9.11: kapalı test bildirimleri (sahte eklentiyle: izin, kanal, planlama, tarih mantığı, tıklayınca kart, Ayarlar'da anahtar yok),
   - V0.9.10: geri tuşu giriş animasyonu sürerken de ilk dokunuşta çalışır, doğrudan girilen dükkândan geri menüye döner, oyun içi "128 / 180" hedef rozeti ve duraklat düğmesi,
   - V0.9.9: mağaza ısınması (görünmez, dokunuşu engellemez, bitince eski durum, girişte/pencerede bırakılır) ve kayan cepheye dokunuş yedeği.
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


/* ısınma (V0.9.9): menü boşta kalınca mağaza görünmez oynatılır; menüye dokunuşu engellemez, bitince her şey eski hâlinde, girişte/pencerede bırakılır */
const WARMT = HEAD + `
var t0=Date.now();while(!K.WARM.on&&Date.now()-t0<9000)await sleep(100);
T('ısınma menü boşta kalınca başladı',K.WARM.on===true,Date.now()-t0);
var sh=$('shop'),SS=K.SS,cs=getComputedStyle(sh);
T('ısınırken mağaza görünmez ve dokunulamaz',sh.classList.contains('warm')&&!sh.classList.contains('on')&&cs.pointerEvents==='none'&&parseFloat(cs.opacity)<0.01&&cs.visibility==='visible',[sh.className,cs.opacity,cs.pointerEvents]);
var under=function(sel){var e=document.querySelector(sel),r=e.getBoundingClientRect(),h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return h&&h.closest('#shop')?'MAĞAZA:'+h.className:'ok'};
T('ısınırken menü düğmeleri dokunuşu alır (görünmez katman yakalamaz)',['#playBtn','#bagBtn','#setBtn'].every(function(s){return under(s)==='ok'}),['#playBtn','#bagBtn','#setBtn'].map(under));
await sleep(1300);
T('ısınırken oda ve sokak gerçekten çiziliyor',document.querySelectorAll('#stHub .fc').length===4||document.querySelectorAll('#stShop .itm,#stShop .gf,#stShop .pch').length>0);
var sawCards=false;t0=Date.now();while(!K.WARM.done&&Date.now()-t0<20000){if($('settings').classList.contains('warm')&&$('pause').classList.contains('warm'))sawCards=true;await sleep(80)}
T('cam kartlar (Ayarlar, Duraklat...) da görünmez ısındı',sawCards);
T('ısınma bitti',K.WARM.done===true&&K.WARM.on===false,Date.now()-t0);
T('ısınma sonrası durum eski hâlinde',!sh.classList.contains('warm')&&!sh.classList.contains('wout')&&!sh.classList.contains('opening')&&SS.idx===0&&SS.shop==='alet'&&SS.view==='hub'&&SS.pos===0&&$('stHub').classList.contains('on')&&!$('stShop').classList.contains('on')&&$('stHub').innerHTML===''&&$('stShop').innerHTML===''&&$('stSheet').innerHTML===''&&!$('stScrim').classList.contains('on')&&!$('stBloom').classList.contains('rdy')&&['settings','book','pause','over'].every(function(i){return !$(i).classList.contains('warm')}),[sh.className,SS.idx,SS.shop,SS.view,SS.pos]);
T('ısınma sonrası menü hâlâ menü, mağaza kapalı',G.mode==='menu'&&$('menu').classList.contains('on')&&getComputedStyle(sh).visibility==='hidden'&&!SS.open);
T('ısınma sonrası menü düğmeleri dokunuşu alır',['#playBtn','#bagBtn','#setBtn'].every(function(s){return under(s)==='ok'}));
$('bagBtn').click();await sleep(400);
T('ısınma sonrası mağaza açılır',sh.classList.contains('on')&&$('stHub').querySelectorAll('.fc').length===4&&SS.view==='hub'&&SS.idx===0);
T('ısınma bir kez çalışır, yeniden başlamaz',K.WARM.on===false&&K.WARM.done===true);
`+TAIL;
const WARM2 = HEAD + `
var t0=Date.now();while(!K.WARM.on&&Date.now()-t0<9000)await sleep(100);
T('ısınma başladı',K.WARM.on===true);
await sleep(500);
$('bagBtn').click();await sleep(60);
var sh=$('shop'),SS=K.SS;
T('girişte ısınma bırakıldı',K.WARM.on===false&&K.WARM.done===true&&!sh.classList.contains('warm'),[K.WARM.on,K.WARM.done,sh.className]);
await sleep(500);
T('ısınma sırasında girilen mağaza düzgün açıldı',sh.classList.contains('on')&&SS.view==='hub'&&$('stHub').querySelectorAll('.fc').length===4&&SS.idx===0&&SS.open===true,[sh.className,SS.view,SS.idx]);
await sleep(2500);
T('bırakılan ısınma sonradan geri gelmez',K.WARM.on===false&&!sh.classList.contains('warm')&&sh.classList.contains('on'));
`+TAIL;
const WARM3 = HEAD + `
var t0=Date.now();while(!K.WARM.on&&Date.now()-t0<9000)await sleep(100);
await sleep(300);
$('setBtn').click();await sleep(1000);
var sh=$('shop');
T('pencere açılınca ısınma bırakıldı ve bitmiş sayılmadı',K.WARM.on===false&&K.WARM.done===false&&!sh.classList.contains('warm'),[K.WARM.on,K.WARM.done,sh.className]);
T('bırakılınca mağaza katmanı temiz',$('stHub').innerHTML===''&&$('stShop').innerHTML==='');
$('setClose').click();await sleep(300);
t0=Date.now();while(!K.WARM.on&&Date.now()-t0<9000)await sleep(100);
T('pencere kapanınca ısınma yeniden denenir',K.WARM.on===true,Date.now()-t0);
`+TAIL;
const WARM4 = HEAD + `
var t0=Date.now();while(!K.WARM.done&&Date.now()-t0<20000)await sleep(150);
var sh=$('shop'),SS=K.SS;
T('animasyonlar kapalıyken de ısınma bitti ve temiz',K.getRM()===true&&K.WARM.done===true&&K.WARM.on===false&&!sh.classList.contains('warm')&&SS.idx===0&&SS.view==='hub'&&SS.shop==='alet'&&$('stHub').innerHTML==='',[K.getRM(),K.WARM.done,sh.className]);
`+TAIL;
/* geri (V0.9.10): giriş animasyonu sürerken (busy) geri ilk dokunuşta çalışmalı; doğrudan girilen dükkândan geri menüye döner */
const BACKT = HEAD + `
var SS=K.SS;
K.openShop('menu');await sleep(700);
click('#stCta');await sleep(700);
T('oda göründü, giriş animasyonu sürüyor (busy)',SS.view==='shop'&&SS.busy===true,[SS.view,SS.busy]);
click('#stShop [data-a=back]');await sleep(60);
T('geri ilk dokunuşta sokağa döner (busy engellemez)',SS.view==='hub'&&SS.busy===false,[SS.view,SS.busy]);
await sleep(1300);
T('hemen geri sonrası sokak temiz (yakınlaşma, seçili cephe, ışık kalmadı)',!$('stHub').classList.contains('zoom')&&!document.querySelector('#stHub .fc.sel')&&!$('stBloom').classList.contains('rdy')&&!$('stShop').classList.contains('swap'));
click('#stHub [data-a=close]');
T('sokakta çıkış tek dokunuşta',SS.closing===true&&SS.open===false);
await sleep(600);
K.openShop('menu');await sleep(500);click('#stCta');await sleep(700);
T('Android geri: oda göründü, busy sürüyor',SS.view==='shop'&&SS.busy===true);
K.storeBack();T('Android geri ilk basışta sokağa döner',SS.view==='hub'&&SS.busy===false,[SS.view,SS.busy]);
K.storeBack();T('Android geri sokakta mağazadan çıkarır',SS.open===false);
await sleep(600);
K.openShop('menu');await sleep(500);click('#stCta');await sleep(1300);
click('#stShop .cc [data-a=open][data-s=hed]');await sleep(80);
T('oda değişimi başladı',$('stShop').classList.contains('swap')&&SS.busy===true);
click('#stShop [data-a=back]');await sleep(700);
T('değişim sürerken geri: sokakta kalır, Hediye odası kendiliğinden açılmaz',SS.view==='hub'&&SS.shop==='alet'&&!$('stShop').classList.contains('swap'),[SS.view,SS.shop]);
K.closeShop();await sleep(600);
K.openShop('menu',{shop:'alet',chooser:0});await sleep(600);
T('doğrudan giriş: dükkândayız, seçici fişi açık',SS.view==='shop'&&SS.direct===true&&$('stSheet').classList.contains('on'));
K.storeBack();T('geri 1: fiş kapanır',!$('stSheet').classList.contains('on')&&SS.open===true&&SS.view==='shop');
K.storeBack();T('geri 2: doğrudan menüye döner (sokaktan geçmez)',SS.open===false&&SS.closing===true);
await sleep(600);
K.openShop('menu',{shop:'yet'});await sleep(600);
click('#stShop [data-a=back]');T('ekrandaki geri düğmesi de doğrudan menüye döner',SS.open===false&&SS.closing===true);
await sleep(600);
K.openShop('menu');await sleep(300);
T('normal giriş: doğrudan değil, geri sokağa döner',SS.direct===false);
`+TAIL;
/* oyun içi HUD (V0.9.10): "128 / 180" hedef rozeti ve sağ üst duraklat düğmesi */
const HUDT = HEAD + `
Object.keys(K.INTRO).forEach(function(k){S.seen[k]=1});S.bests.normal=180;S.lvl='normal';K.persist();
K.start();await sleep(900);
var pb=$('pauseBtn'),r=pb.getBoundingClientRect(),h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
T('duraklat düğmesi oyun ekranında görünür ve dokunuşu alır',pb.offsetParent!==null&&r.width>=36&&(h===pb||pb.contains(h)),[r.width,h&&h.id]);
T('duraklat düğmesi sağ üst köşede (sağ kenara 20 px)',Math.abs(document.documentElement.clientWidth-r.right-20)<3&&r.top<40,[r.right,r.top]);
T('duraklat düğmesi etiketi (TR)',pb.getAttribute('aria-label')==='Duraklat',pb.getAttribute('aria-label'));
G.mode='play';G.score=128;K.updateHud();
var bw=$('hudBest');
T('hedef rozeti: 128 / 180, "Rekor" ya da "En iyi" yazısı yok',!bw.hidden&&$('hudGoal').textContent==='180'&&$('hudScore').textContent==='128'&&!/Rekor|En iyi/.test($('hud').textContent),[$('hud').textContent]);
T('hedef çerçeveli (kenarlık var)',parseFloat(getComputedStyle($('hudGoal')).borderTopWidth)>=1.5);
G.recDone=true;G.score=190;K.updateHud();
T('rekor geçilince rozet altın olur, tik alır, hedef sayısı kalır',bw.classList.contains('gold')&&!!$('hudGoal').querySelector('svg')&&$('hudGoal').textContent==='180');
G.recDone=false;S.bests.normal=0;K.updateHud();
T('rekor yokken hedef rozeti görünmez',bw.hidden===true);
S.bests.normal=180;G.mode='play';K.updateHud();
var sc0=G.score;pb.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:350,clientY:38,pointerId:5}));
T('düğmeye basış oyun dokunuşu sayılmaz (puan değişmedi, mod oyunda)',G.score===sc0&&G.mode==='play',[G.score,sc0,G.mode]);
pb.dispatchEvent(new MouseEvent('click',{bubbles:true}));
T('düğmeye dokununca oyun duraklar, kart açılır',G.mode==='pause'&&$('pause').classList.contains('on'),[G.mode]);
pb.dispatchEvent(new MouseEvent('click',{bubbles:true}));
T('duraklamışken düğme işlem yapmaz',G.mode==='pause');
K.resume();await sleep(100);T('devam edince geri sayım başlar',G.mode==='count',G.mode);
pb.dispatchEvent(new MouseEvent('click',{bubbles:true}));
T('geri sayımda da duraklatılabilir',G.mode==='pause',G.mode);
K.setLang('en');T('duraklat düğmesi etiketi (EN)',pb.getAttribute('aria-label')==='Pause',pb.getAttribute('aria-label'));K.setLang('tr');
$('pauseMenuBtn').click();await sleep(300);
T('menüye dönünce düğme görünmez (HUD kapalı)',G.mode==='menu'&&!$('hud').classList.contains('on'));
K.startPractice(Object.keys(K.IMPL_GOOD)[0]);await sleep(500);
T('Dene modunda duraklat düğmesi yok',G.practice&&$('pauseBtn').offsetParent===null,[!!G.practice]);
`+TAIL;
/* kapalı test bildirimleri (V0.9.11): sahte bildirim eklentisi (alarm kurar, izin sorar, tıklanır) ve tarih mantığı */
const FAKECAP = `(function(){var calls=[],lst={},perm={display:'prompt',reqResult:'granted'};
window.__ln={calls:calls,lst:lst,perm:perm,fire:function(){(lst.localNotificationActionPerformed||[]).forEach(function(f){f({actionId:'tap',notification:{id:1,extra:{}}})})}};
var LN={checkPermissions:function(){calls.push(['check']);return Promise.resolve({display:perm.display})},
requestPermissions:function(){calls.push(['request']);perm.display=perm.reqResult;return Promise.resolve({display:perm.display})},
createChannel:function(o){calls.push(['channel',o]);return Promise.resolve()},
cancel:function(o){calls.push(['cancel',o]);return Promise.resolve()},
schedule:function(o){calls.push(['schedule',o]);return Promise.resolve({notifications:o.notifications.map(function(n){return {id:n.id}})})},
addListener:function(n,f){(lst[n]=lst[n]||[]).push(f);return Promise.resolve({remove:function(){}})}};
var any=new Proxy({},{get:function(_,k){return k==='then'?undefined:function(){return Promise.resolve({})}}});
window.Capacitor={isNativePlatform:function(){return true},registerPlugin:function(n){return n==='LocalNotifications'?LN:any}};})();`;
const NOTIT = HEAD + `
var LN=window.__ln;
await sleep(2300);
var sch=LN.calls.filter(function(c){return c[0]==='schedule'}),ns=sch.length?sch[0][1].notifications:[];
T('açılışta bildirim izni istendi (menüdeyken)',LN.calls.some(function(c){return c[0]==='request'}));
T('kanal: yüksek önem (ekranın üstünde belirir), kimlik test',LN.calls.some(function(c){return c[0]==='channel'&&c[1].importance===4&&c[1].id==='test'}));
T('bildirimler planlandı (bilgilendirme + 17 gün × 2, bugünün geçenleri ve ikincisi hariç)',sch.length===1&&ns.length>=32&&ns.length<=35,ns.length);
T('tam zamanlı alarm yok (sistem ayar ekranı açılmasın)',ns.every(function(n){return n.isExactNotification===false}));
T('hepsi test kanalında, uyku modunda da çalışır',ns.every(function(n){return n.channelId==='test'&&n.schedule.allowWhileIdle===true}));
var info=ns.filter(function(n){return n.id===1})[0];
T('izin verildikten 1 dk sonra bilgilendirme bildirimi',!!info&&Math.abs(new Date(info.schedule.at).getTime()-S.test.infoAt)<50&&S.test.infoAt>Date.now()+50000&&S.test.infoAt<Date.now()+62000&&/17 gün/.test(info.body)&&/Kapalı test/.test(info.title),info&&[info.schedule.at,info.title,info.body]);
T('bildirimler kısa (gövde en çok 64 karakter) ve başlıkta gün sayacı var',ns.every(function(n){return n.body.length<=64})&&ns.filter(function(n){return n.id>1}).every(function(n){return /Gün \\d+\\/17/.test(n.title)}),ns.map(function(n){return n.body.length}).join());
var cn=LN.calls.filter(function(c){return c[0]==='cancel'});
T('bugünün ikinci bildirimi iptal listesinde (bugün girildi)',cn.length===1&&cn[0][1].notifications.some(function(x){return x.id===201}),cn.length&&cn[0][1].notifications.length);
T('kayıtta başlangıç günü ve saati var',/^\\d{4}-\\d{2}-\\d{2}$/.test(S.test.d0)&&S.test.t0>0&&Math.abs(S.test.t0-Date.now())<20000);
// tarih mantığı (saf işlev): kuruluma göre hangi bildirimler planlanır
function mk(y,m,d,h,mi){return new Date(y,m-1,d,h,mi,0)}
function ids(p){return p.items.map(function(x){return x.id})}
function between(a,lo,hi){return a.filter(function(i){return i>=lo&&i<=hi}).length}
var keep=S.test;
S.test={d0:'2026-10-21',t0:mk(2026,10,21,8,0).getTime(),infoAt:mk(2026,10,21,8,1).getTime()};
var a=ids(K.testPlan(mk(2026,10,21,8,0),true));
T('08:00 kurulum: bilgilendirme + 1. gün 09:00; 16:30 yok (bugün girildi); 2-17. günler ikişer',a.indexOf(1)>=0&&a.indexOf(101)>=0&&a.indexOf(201)<0&&between(a,102,117)===16&&between(a,202,217)===16,a);
var a2=ids(K.testPlan(mk(2026,10,21,8,0),false));
T('girilmediyse (açık değilse) 1. günün ikinci bildirimi de planlanır',a2.indexOf(201)>=0);
S.test={d0:'2026-10-21',t0:mk(2026,10,21,20,0).getTime(),infoAt:mk(2026,10,21,20,1).getTime()};
a=ids(K.testPlan(mk(2026,10,21,20,0),true));
T('20:00 kurulum: bugünün ikisi de geçmiş; bilgilendirme + 2-17. günler ikişer',a.indexOf(1)>=0&&a.indexOf(101)<0&&a.indexOf(201)<0&&between(a,102,117)===16&&between(a,202,217)===16&&a.length===33,a.length);
var pl=K.testPlan(mk(2026,10,21,20,0),true).items;
var m1=pl.filter(function(x){return x.id===102})[0],m2=pl.filter(function(x){return x.id===202})[0];
T('sabah 09:00 ve akşam 16:30, ertesi gün',m1.at.getDate()===22&&m1.at.getHours()===9&&m1.at.getMinutes()===0&&m2.at.getDate()===22&&m2.at.getHours()===16&&m2.at.getMinutes()===30,[String(m1.at),String(m2.at)]);
S.test={d0:'2026-10-21',t0:mk(2026,10,21,8,0).getTime()-86400000*9,infoAt:0};
a=ids(K.testPlan(mk(2026,10,30,10,0),true));
T('10. gün 10:00 (girildi): bugünün ikisi de yok; 11-17. günler ikişer',K.testDay(mk(2026,10,30,10,0))===10&&a.indexOf(110)<0&&a.indexOf(210)<0&&between(a,111,117)===7&&between(a,211,217)===7&&a.indexOf(1)<0,[K.testDay(mk(2026,10,30,10,0)),a.length]);
S.test={d0:'2026-10-21',t0:1};
var d17=K.testPlan(mk(2026,11,6,17,0),true);
T('17. gün 17:00: plan boş, test bitmedi',K.testDay(mk(2026,11,6,17,0))===17&&d17.items.length===0&&d17.over===false,[K.testDay(mk(2026,11,6,17,0)),d17.items.length]);
var d18=K.testPlan(mk(2026,11,7,9,0),true);
T('18. gün: test bitti, plan boş',d18.over===true&&d18.items.length===0&&K.testDay(mk(2026,11,7,9,0))===18);
T('gün sayacı yaz saati geçişinde de doğru (Mart 2027)',(function(){S.test={d0:'2027-03-25',t0:1};return K.testDay(mk(2027,3,28,12,0))===4&&K.testDay(mk(2027,3,29,0,5))===5})());
S.test=keep;
// bildirime dokunma
LN.fire();
var ti=$('testInfo');
T('bildirime dokununca menüde Gün 1/17 kartı açılır',ti.classList.contains('on')&&$('tiDay').textContent==='Gün 1/17'&&$('tiDots').children.length===17&&$('tiDots').children[0].className==='now'&&/teşekkür/i.test($('tiMsg').textContent),[ti.className,$('tiDay').textContent]);
T('kart açıkken oyun dokunuşu başlatmaz, mod menü',G.mode==='menu');
$('tiClose').click();T('Kapat kartı kapatır',!ti.classList.contains('on'));
LN.fire();$('tiPlay').click();await sleep(200);T('Oyna kartı kapatıp oyunu başlatır',!ti.classList.contains('on')&&G.mode!=='menu',G.mode);
LN.fire();T('oyundayken bildirime dokunma: kart değil kısa satır (oyun bölünmez)',!ti.classList.contains('on')&&/Gün 1\\/17/.test($('toast').textContent),[$('toast').textContent]);
K.setLang('en');var it={id:101,kind:'day',day:1,slot:0,at:new Date()};
T('İngilizce bildirim metni',/Day 1\\/17/.test(K.testNotif(it).title)&&/morning|record|Thank|round/i.test(K.testNotif(it).body),K.testNotif(it));
K.setLang('tr');
// izin reddedilirse hiçbir şey planlanmaz, sonra yeniden denenir
LN.calls.length=0;LN.perm.display='prompt';LN.perm.reqResult='denied';
K.G.mode='menu';await K.testSync();
T('izin yoksa planlama yapılmaz (sessizce)',!LN.calls.some(function(c){return c[0]==='schedule'}));
LN.perm.reqResult='granted';await K.testSync();
T('izin verilince bir sonraki açılışta planlanır',LN.calls.some(function(c){return c[0]==='schedule'}));
T('Ayarlar\\'da bildirim anahtarı yok (kapatılamaz)',!document.querySelector('#setRows [data-set*=noti],#setRows [data-set*=bildirim]')&&!/bildirim|notification/i.test($('setRows').textContent)||(K.openSettings(),!/bildirim|notification/i.test($('setRows').textContent)));
`+TAIL;
/* oyun hissi (V0.9.12): yakın vuruşta sarsıntı/yavaş çekim yok, ibre hızı yumuşak, Cehennem parıltısı DOM katmanı, tema adımları seyrek, kapanan mağazanın DOM'u boşalır.
   Kare döngüsü durdurulur (requestAnimationFrame yok), K.update(dt) elle sürülür: sonuçlar kesin ve tekrarlanabilir. */
const FEELSEED = 'window.requestAnimationFrame=function(){return 0};';
const FEELT = HEAD + `
Object.keys(K.INTRO).forEach(function(k){S.seen[k]=1});S.lvl='usta';S.bests.usta=300;K.persist();
K.setLevel('usta');K.start();G.mode='play';G.count=0;
function step(n,dt){for(var i=0;i<n;i++)K.update(dt||0.016)}
step(2);
// 1) yakın vuruş (son saniye): sarsıntı ve yavaş çekim yok, görsel geri bildirim var
G.time=K.CFG.nearAt-0.1;var pin=G.pins.filter(function(p){return p.kind==='gate'})[0];
var sh0=G.shake,rp0=G.rips.length;K.hit(0,pin);
T('yakın vuruşta ekran sarsıntısı yok',G.shake===sh0&&G.shake===0,G.shake);
T('yakın vuruşta zaman yavaşlamaz (vuruş durması yok)',G.tscale===1&&G.tsT===0,[G.tscale,G.tsT]);
T('yakın vuruşun halka ve parçacık geri bildirimi duruyor',G.rips.length>rp0&&G.parts.length>0);
// 2) hız artışı yumuşak: omega 2 → 4
G.pins=[];G.chal={kind:'tek',t:0};G.time=8;G.slow=0;G.vort=0;G.lockLeft=0;G.kind='tek';G.dir=1;G.omega=2;G.vel=NaN;
step(1);var v=[G.vel];G.omega=4;
for(var i=0;i<40;i++){step(1);v.push(G.vel);G.pins=[];G.time=8}
var inc=v.slice(1).map(function(x,i){return x-v[i]});
T('başlangıç hızı hedefe atlar (yumuşatma yok), ilk kare hedef hız',Math.abs(v[0]-2)<1e-9,v[0]);
T('hız artışı yumuşak: kare başına artış küçük (≤ fark×%14)',Math.max.apply(null,inc)<=2*0.14+1e-9&&Math.min.apply(null,inc)>=0,[Math.max.apply(null,inc),Math.min.apply(null,inc)]);
T('hız 0,64 sn sonra hedefe ~yaklaştı (≥ 3,9) ama ilk karede değil',v[1]<2.5&&v[40]>3.9,[v[1],v[40]]);
// 3) yön değişimi: hız sıfırdan geçerek döner, ani sıçrama yok
G.omega=3;G.vel=3;G.dir=1;G.pins=[];step(1);G.dir=-1;var w=[G.vel];
for(var j=0;j<45;j++){step(1);w.push(G.vel);G.pins=[];G.time=8;G.dir=-1}
var sg=w.map(function(x){return x<0?-1:1}),flips=sg.filter(function(x,i){return i&&x!==sg[i-1]}).length;
var wi=w.slice(1).map(function(x,i){return Math.abs(x-w[i])});
T('yön değişimi: hız bir kez sıfırdan geçer, sonunda ≈ −omega',flips===1&&w[45]<-2.8,[flips,w[45]]);
T('yön değişimi: kare başına hız farkı küçük (≤ 2×omega×%14)',Math.max.apply(null,wi)<=6*0.14+1e-9,Math.max.apply(null,wi));
// 4) kum saati (yavaşlatma) ve bitişi yumuşak
G.dir=1;G.omega=3;G.vel=3;G.slow=5;G.slowMul=0.65;step(40);var k1=G.vel;G.slow=0;var k2=[];for(var q=0;q<30;q++){step(1);k2.push(G.vel);G.pins=[];G.time=8}
T('kum saati yavaşlatması: hız ~0,65×omega seviyesine iner, bitince bir anda değil kademeli artar',k1<2.05&&k2[0]-k1<0.3&&k2[29]>2.9&&k2.every(function(x,i){return !i||x>=k2[i-1]}),[k1,k2[0],k2[29]]);
// 5) ışınlanmada ibre durur, çıkınca eski hızla sürer
G.omega=3;G.vel=3;G.slow=0;G.tun={t:0,d:5,to:1};var a0=G.ang,v0=G.vel;step(10);
T('ışınlanırken ibre durur ve hız hafızası korunur',G.ang===a0&&G.vel===v0,[a0,G.ang,v0,G.vel]);
G.tun=null;G.pins=[];step(1);T('ışınlanmadan çıkınca eski hızla sürer (yavaş başlamaz)',Math.abs(G.vel-3)<1e-9&&G.ang!==a0,[G.vel]);
// 6) Cehennem parıltısı DOM katmanı; canvas'ta degrade yok
var app=$('app'),hf=$('hfx');
T('Cehennem parıltısı #hfx DOM katmanı olarak var',!!hf&&!app.classList.contains('hellfx')&&getComputedStyle(hf).visibility==='hidden');
var rg=0,orig=CanvasRenderingContext2D.prototype.createRadialGradient;CanvasRenderingContext2D.prototype.createRadialGradient=function(){rg++;return orig.apply(this,arguments)};
K.render();var rgN=rg;rg=0;
G.thT=1;step(100,0.05);K.render();
CanvasRenderingContext2D.prototype.createRadialGradient=orig;
T('Cehennem hedefinde #hfx sınıfı açılır',app.classList.contains('hellfx'));
T('Cehennem çizimi canvas\\'ta ekstra radyal degrade üretmez (normal: '+rgN+', Cehennem: '+rg+')',rg<=rgN,[rgN,rg]);
G.thT=0;step(2);
T('Cehennem bitince #hfx sınıfı kalkar',!app.classList.contains('hellfx'));
// 7) tema geçişinde tam sayfa stil güncellemesi seyrek (her adım tüm sayfanın stilini yeniden hesaplatır)
var writes=0,sp=CSSStyleDeclaration.prototype.setProperty;CSSStyleDeclaration.prototype.setProperty=function(n){if(n==='--bg')writes++;return sp.apply(this,arguments)};
G.thT=0;step(200,0.016);writes=0;G.thT=1;step(200,0.016);G.thT=0;step(200,0.016);
CSSStyleDeclaration.prototype.setProperty=sp;
T('tema geçişi (içeri + dışarı): --bg yazımı ≤ 70 (eskiden ~130)',writes<=70&&writes>=8,writes);
// 8) kapanan mağazanın DOM'u boşalır
K.G.mode='menu';K.openShop('menu');await sleep(700);K.shopGo('alet');await sleep(300);
T('mağaza açıkken sokak ve dükkân DOM dolu',$('stHub').children.length>0&&$('stShop').children.length>0);
K.closeShop();await sleep(700);
T('mağaza kapanınca DOM boşalır (oyunda stil hesabı hafif kalsın)',$('stHub').innerHTML===''&&$('stShop').innerHTML===''&&$('stSheet').innerHTML==='');
K.openShop('menu');await sleep(500);
T('boşaltılan mağaza yeniden açılınca düzgün kurulur',$('stHub').querySelectorAll('.fc').length===4&&K.SS.view==='hub');
`+TAIL;
/* dokunuş yedeği (V0.9.9): basış bir öğede, bırakış başka öğede olursa tarayıcı click'i ortak üst öğeye verir; eylem basılan öğeye gitmeli */
const TAPFB = HEAD + `
K.openShop('menu');await sleep(900);
var SS=K.SS,yet=document.querySelector('#stHub .fc[data-s=yet]'),gor=document.querySelector('#stHub .fc[data-s=gor]'),strip=$('stStrip');
T('başlangıçta odak Alet',SS.idx===0);
yet.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:120,clientY:300,pointerId:7,pointerType:'touch'}));
strip.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:123,clientY:302}));
T('kayan cephe: tıklama ortak üst öğeye düştü, eylem basılan cepheye gitti (odak Yetenek)',SS.idx===1,SS.idx);
await sleep(700);
gor.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:120,clientY:300,pointerId:8,pointerType:'touch'}));
strip.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:240,clientY:300}));
T('parmak çok oynadıysa yedek eylem yok',SS.idx===1,SS.idx);
strip.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:123,clientY:302}));
T('basış kaydı tüketilir: sonraki boş tıklama bir şey yapmaz',SS.idx===1,SS.idx);
yet.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:120,clientY:300,pointerId:9,pointerType:'touch'}));
await sleep(1000);
strip.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:121,clientY:300}));
T('eski basış (1 sn önce) yedek sayılmaz',SS.idx===1&&SS.view==='hub',[SS.idx,SS.view]);
yet.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:120,clientY:300,pointerId:10,pointerType:'touch'}));
yet.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:120,clientY:300}));
await sleep(80);
T('normal dokunuş (aynı öğe) bozulmadı: odaktaki cepheye dokununca dükkâna girilir',SS.busy===true||SS.view==='shop'||$('stHub').classList.contains('zoom'),[SS.busy,SS.view]);
`+TAIL;

let bad = 0;
const show = (name, r) => { const first = String(r).split('\n')[0]; if (!/ 0 hata/.test(first) || /İSTİSNA|ÇÖKTÜ/.test(String(r))) bad++; console.log((name + ':').padEnd(20) + String(r).replace(/\n/g, '\n' + ' '.repeat(20))); };
const run = async (name, script, o = {}) => {
  if (process.env.ONLY && name.indexOf(process.env.ONLY) < 0) return;   // ONLY=ısınma gibi: yalnızca adında bu geçen gruplar
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
await run('dokunuş yedeği', TAPFB);
await run('geri tuşu', BACKT);
await run('oyun hissi', FEELT, { seed: FEELSEED });
await run('bildirimler', NOTIT, { seed: FAKECAP });
await run('ısınma', WARMT, { warm: true });
await run('ısınma: girişte bırakma', WARM2, { warm: true });
await run('ısınma: pencerede bırakma', WARM3, { warm: true });
await run('ısınma: animasyonsuz', WARM4, { warm: true, seed: 'localStorage.setItem("kilpayi.v1",' + JSON.stringify(JSON.stringify({ v: 3, anim: false, animV: 1 })) + ');' });
for (const [name, save, cond] of MIG) {
  const seed = save === null ? '' : 'localStorage.setItem("kilpayi.v1",' + JSON.stringify(JSON.stringify(save)) + ');';
  const post = `(async()=>{var K=window.__kp,S=K.save,ok=false,err='';try{ok=!!(${cond})}catch(e){err=String(e)}return ok?'1 tamam, 0 hata':'0 tamam, 1 hata HATA '+err+' '+JSON.stringify({slots:S.slots,own:S.own,equip:S.equip,auto:[S.autoOwn,S.autoJ],gift:S.gift,lang:S.lang,music:S.music})})()`;
  await run('kayıt: ' + name, post, { seed });
}
if (!process.env.ONLY || 'HUD'.indexOf(process.env.ONLY) >= 0) {   // DEBUG=1'de pause() kapalıdır (bot durmasın); duraklat düğmesi için DEBUG=2 derlemesi, sonra DEBUG=1'e dönülür
  execFileSync('sh', ['-c', 'DEBUG=2 ./build.sh'], { cwd: root, stdio: 'ignore' });
  await run('HUD', HUDT);
  execFileSync('sh', ['-c', 'DEBUG=1 ./build.sh'], { cwd: root, stdio: 'ignore' });
}
console.log(bad ? '\nHATA: ' + bad + ' grup başarısız' : '\nmağaza testleri tamam');
process.exit(bad ? 1 : 0);
