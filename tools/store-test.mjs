/* Mağaza testi (V0.9.2): node tools/store-test.mjs
   DEBUG=1 derlemesini yapar, oyunu başsız Chrome'da açar ve şunları kontrol eder:
   - fiyat ve stok kuralları (merdiven, en çok 5, yetersiz coin, yuva sırası, takas),
   - yükseltme ile stok alma sırasının toplam tutarı değiştirmediği (açık kapatıldı),
   - hediye merdiveni (20 · 30 · 40 · 50 · 100, sonra 12 saat),
   - eski ve bozuk kayıtların geçişi,
   - ekran akışı (sokak, dükkân, fiş, satın alma, seçici, geri tuşu, ayarlar, oyun içi joker sırası, otomatik joker).
   Chrome yolu CHROME ortam değişkeniyle verilebilir. Hata varsa 1 ile çıkar. */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
execFileSync('sh', ['-c', 'DEBUG=1 ./build.sh'], { cwd: root, stdio: 'ignore' });
const base = readFileSync(join(root, 'www', 'index.html'), 'utf8');
const made = [];

const run = (name, pre, post) => {
  const fn = 't-store-' + name + '.html';
  const path = join(root, 'www', fn);
  writeFileSync(path, base.replace('<div id="app">', '<script>try{localStorage.clear();' + pre + '}catch(e){}</script><div id="app">').replace('</body>', '<script>' + post + '</script></body>'));
  made.push(path);
  const prof = mkdtempSync(join(tmpdir(), 'kp-store-'));
  let out = '';
  try { out = execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--user-data-dir=' + prof, '--dump-dom', 'file://' + path], { encoding: 'utf8', timeout: 90000, stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { out = e.stdout || ''; }
  rmSync(prof, { recursive: true, force: true });
  const m = out.match(/<pre id="res">([\s\S]*?)<\/pre>/);
  return m ? m[1].replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/&quot;/g, '"') : 'SONUÇ YOK (sayfa açılmadı)';
};
/* sayfa içi test çatısı: T(ad, koşul, ek) */
const HEAD = `var out=[],ok=0,bad=0;function T(n,c,e){if(c){ok++}else{bad++;out.push('HATA '+n+(e!==undefined?' → '+JSON.stringify(e):''))}}
function $(i){return document.getElementById(i)}
function click(s){var e=document.querySelector(s);if(!e){out.push('YOK '+s);bad++;return null}e.dispatchEvent(new MouseEvent('click',{bubbles:true}));return e}
function done(){var r=document.createElement('pre');r.id='res';r.textContent=ok+' tamam, '+bad+' hata\\n'+out.join('\\n');document.body.appendChild(r)}
var K=window.__kp,S=K.save,G=K.G;try{`;
const TAIL = `}catch(e){out.push('İSTİSNA '+e.stack)}done();`;

const LOGIC = HEAD + `
function reset(){S.coins=0;S.own={kron:1};S.slots=1;S.equip=['kron','','',''];S.autoOwn=false;S.autoJ=false;S.gift={n:0,t:0};['steto','kron','kalkan','kum'].forEach(function(i){S.tools[i]={n:i==='kron'?1:0,l:1}});}
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
reset();var v=[];for(var i=0;i<5;i++)v.push(K.giftClaim());T('hediye 20-30-40-50-100',v.join()==='20,30,40,50,100',v);
var g=K.giftState();T('5. sonra 12 saat bekleme',g.wait>11.99*3600000&&g.wait<=12*3600000&&g.next===0,g);T('6. hediye reddedilir',K.giftClaim()===0);
S.gift.t=Date.now()-1;g=K.giftState();T('bekleme bitince başa döner',g.next===20&&g.wait===0&&S.gift.n===0,g);
S.gift={n:5,t:Date.now()+100*3600000};g=K.giftState();T('saat oyunu: bekleme 12 saati aşmaz',g.wait<=12*3600000,g.wait);
reset();S.tools.kron.n=5;for(i=0;i<30;i++)K.giftTool();T('hediye joker 5 üstüne çıkmaz',S.tools.kron.n===5&&!S.tools.kalkan.n,S.tools);
` + TAIL;

const FLOW = HEAD + `
S.coins=5000;S.own={kron:1};S.slots=1;S.equip=['kron','','',''];S.tools.kron.n=1;K.persist();K.refreshStats();
T('menüde 4 yuva düğmesi',document.querySelectorAll('#menuJk button.sl').length===4);
K.openShop('menu');T('mağaza açıldı',$('shop').classList.contains('on')&&!$('menu').classList.contains('on'));
T('4 dükkân',document.querySelectorAll('#stHub .fc').length===4);K.shopGo('alet');
T('alet odası',K.SS.view==='shop'&&document.querySelectorAll('#stShop .pch').length===4&&document.querySelectorAll('#stShop .itm').length===4);
click('#stShop .itm[data-k="kalkan"]');T('kilitli fiş',$('stSheet').classList.contains('on')&&!!$('stSheet').querySelector('[data-a="unl"]'));
click('#stSheet [data-a="unl"]');T('kalkan açıldı',S.own.kalkan===1&&S.coins===4200&&S.tools.kalkan.n===1,[S.coins]);T('fiş kapandı',!$('stSheet').classList.contains('on'));
click('#stShop .pch[data-i="1"]');T('yuva fişi',!!$('stSheet').querySelector('[data-a="slotbuy"]'));
click('#stSheet [data-a="slotbuy"]');T('yuva 2 açıldı, kalkan takıldı',S.slots===2&&K.isEq('kalkan')&&S.coins===3000,[S.slots,S.equip,S.coins]);
click('#stShop .pch[data-i="0"]');T('seçici açıldı',!!$('stSheet').querySelector('[data-a="eq"]'));
click('#stSheet [data-a="eq"][data-j="kalkan"][data-i="0"]');T('takas',S.equip[0]==='kalkan'&&S.equip[1]==='kron',S.equip);
click('#stShop .itm[data-k="kron"]');var c0=S.coins;click('#stSheet [data-a="plus"]');T('stok +1 (45)',S.tools.kron.n===2&&c0-S.coins===45,[S.tools.kron.n,c0-S.coins]);
c0=S.coins;var up=K.upPrice('kron');click('#stSheet [data-a="upg"]');T('yükseltme düştü',S.tools.kron.l===2&&c0-S.coins===up,[S.tools.kron.l,c0-S.coins,up]);
S.coins=100;K.persist();K.refreshStats();K.shopGo('alet');click('#stShop .itm[data-k="kum"]');
T('yetersiz coin: eksik yazısı',/eksik|short/.test($('stSheet').textContent)&&!$('stSheet').querySelector('[data-a="unl"]'));click('#stSheet [data-a="poor"]');T('yetersizde açılmadı',!S.own.kum&&S.coins===100);
K.storeBack();T('geri: fiş kapanır',!$('stSheet').classList.contains('on')&&K.SS.view==='shop');K.storeBack();T('geri: sokak',K.SS.view==='hub');K.storeBack();T('geri: menü',!$('shop').classList.contains('on')&&$('menu').classList.contains('on'));
S.coins=5000;K.persist();K.refreshStats();K.openShop('menu',{shop:'yet',sheet:'bolt'});click('#stSheet [data-a="unlA"]');
T('otomatik açıldı',S.autoOwn===true&&S.autoJ===true&&S.coins===1000,[S.autoOwn,S.autoJ,S.coins]);click('#stSheet [data-a="auto"]');T('otomatik kapatıldı',S.autoJ===false);K.closeShop();
K.openSettings();T('ayarlar 4 satır',document.querySelectorAll('#setRows .srow').length===4);
click('#setRows [data-set="snd"]');T('ses kapandı',S.snd===false);click('#setRows [data-set="snd"]');T('ses açıldı',S.snd===true);
click('#setRows [data-set="vib"]');T('titreşim kapandı',S.vib===false);click('#setRows [data-set="vib"]');click('#setRows [data-set="auto"]');T('ayarlardan otomatik açıldı',S.autoJ===true);K.closeSettings();
click('#menuJk button[data-slot="0"]');T('menüden seçici (hızlı)',$('shop').classList.contains('on')&&K.SS.quick===true);
click('#stSheet [data-a="eq"][data-j="kron"][data-i="0"]');T('seçince menüye dönülür',!$('shop').classList.contains('on')&&$('menu').classList.contains('on')&&S.equip[0]==='kron'&&S.equip[1]==='kalkan',S.equip);
K.start();var shown=[].slice.call(document.querySelectorAll('#tools .tool')).filter(function(b){return !b.classList.contains('off')}).map(function(b){return b.getAttribute('data-tool')});
T('dock: yuva sırasıyla yalnız takılı jokerler',shown.join()==='kron,kalkan',shown);
S.own.kum=1;S.tools.kum.n=3;var n0=S.tools.kum.n;K.useTool('kum');T('takılı olmayan joker kullanılamaz',S.tools.kum.n===n0);
var k0=S.tools.kron.n;K.useTool('kron');T('takılı joker kullanılır',S.tools.kron.n===k0-1);
G.time=1.5;S.tools.kron.n=2;S.tools.kum.n=3;G.advCool={};T('öneri yalnız takılılardan',K.adviceFor()==='kron',K.adviceFor());
S.autoOwn=true;S.autoJ=true;G.adv='kron';G.advT=0.71;S.tools.kron.n=2;var kn=S.tools.kron.n;K.updateAdvice(0.016);T('otomatik: kendiliğinden kullanıldı',S.tools.kron.n===kn-1,[S.tools.kron.n,kn]);
S.autoJ=false;G.adv='kron';G.advT=0.71;kn=S.tools.kron.n;G.time=1.5;G.advCool={};K.updateAdvice(0.016);T('otomatik kapalıyken kullanılmaz',S.tools.kron.n===kn,[S.tools.kron.n,kn]);
` + TAIL;

const MIG = [
  ['eski_v2', { coins: 777, v: 2, tools: { steto: { n: 3, l: 2 }, kron: { n: 2, l: 1 }, kalkan: { n: 0, l: 3 }, kum: { n: 1, l: 1 } }, bests: { normal: 120 }, runs: 9 },
    "S.coins===777&&S.slots===4&&K.equipped().length===4&&S.own.steto&&S.own.kron&&S.own.kalkan&&S.own.kum&&S.tools.steto.n===3&&S.tools.steto.l===2&&S.tools.kalkan.l===3&&!S.autoOwn&&!S.autoJ&&S.v===3&&S.bests.normal===120"],
  ['yeni_bos', null, "S.slots===1&&S.own.kron===1&&!S.own.kalkan&&S.tools.kron.n===1&&S.tools.steto.n===0&&K.equipped().join()==='kron'&&S.equip.length===4&&S.coins===0"],
  ['v3_secili', { v: 3, coins: 50, own: { kron: 1, steto: 1 }, slots: 2, equip: ['steto', 'kron', '', ''], tools: { steto: { n: 4, l: 2 }, kron: { n: 1, l: 1 }, kalkan: { n: 0, l: 1 }, kum: { n: 0, l: 1 } }, autoOwn: true, autoJ: true, gift: { n: 2, t: 0 } },
    "K.equipped().join()==='steto,kron'&&S.slots===2&&S.autoOwn&&S.autoJ&&S.gift.n===2&&S.tools.steto.n===4"],
  ['bozuk', { v: 3, own: { kron: 0, kum: 1 }, slots: 99, equip: 'x', tools: { steto: { n: -4, l: 9 }, kron: { n: 'a', l: 0 } }, autoOwn: false, autoJ: true, gift: { n: 9, t: 0 } },
    "S.slots===4&&S.own.kum===1&&S.own.kron===0&&Array.isArray(S.equip)&&S.equip.length===4&&K.isEq('kum')&&S.tools.steto.n===0&&S.tools.steto.l===3&&S.tools.kron.l===1&&S.autoJ===false&&S.gift.n===0"],
  ['otomatik_yok', { v: 3, own: { kron: 1 }, slots: 1, equip: ['kron', 'kum', '', ''], autoOwn: false, autoJ: true }, "S.autoJ===false&&K.equipped().join()==='kron'&&S.equip[1]===''"]
];

let bad = 0;
const show = (name, r) => { const first = r.split('\n')[0]; if (!/ 0 hata/.test(first)) bad++; console.log((name + ':').padEnd(16) + r.replace(/\n/g, '\n' + ' '.repeat(16))); };
show('fiyat ve stok', run('logic', '', LOGIC));
show('ekran akışı', run('flow', '', FLOW));
for (const [name, save, cond] of MIG) {
  const pre = save === null ? '' : 'localStorage.setItem("kilpayi.v1",' + JSON.stringify(JSON.stringify(save)) + ');';
  const post = `var K=window.__kp,S=K.save,ok=false,err='';try{ok=!!(${cond})}catch(e){err=String(e)}var r=document.createElement('pre');r.id='res';r.textContent=(ok?'1 tamam, 0 hata':'0 tamam, 1 hata HATA '+err+' '+JSON.stringify({slots:S.slots,own:S.own,equip:S.equip,auto:[S.autoOwn,S.autoJ],gift:S.gift}));document.body.appendChild(r);`;
  show('kayıt: ' + name, run('m-' + name, pre, post));
}
for (const f of made) rmSync(f, { force: true });
console.log(bad ? '\nHATA: ' + bad + ' grup başarısız' : '\nmağaza testleri tamam');
process.exit(bad ? 1 : 0);
