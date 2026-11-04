/* Reklam izni (V0.14.0): sahte AdMob eklentisiyle izin akışı. `DEBUG=1 ./build.sh` derlemesiyle çalışır. Kullanım: node tools/consent-test.mjs */
import { launch } from './cdp.mjs';
const page = 'file://' + new URL('..', import.meta.url).pathname + 'www/index.html';
let fail = 0;
const T = (n, ok, extra) => { if (!ok) fail++; console.log((ok ? 'ok   ' : 'HATA ') + n + (extra !== undefined ? '  [' + extra + ']' : '')); };
const fake = info => `window.__c={info:0,form:0,opt:0,init:0};window.Capacitor={isNativePlatform:()=>true,registerPlugin:n=>n==='AdMob'?{
  requestConsentInfo(){__c.info++;const r=${info};return r instanceof Error?Promise.reject(r):Promise.resolve(r)},
  showConsentForm(){__c.form++;return Promise.resolve({status:'OBTAINED',canRequestAds:true,privacyOptionsRequirementStatus:'REQUIRED'})},
  showPrivacyOptionsForm(){__c.opt++;return Promise.resolve()},
  initialize(){__c.init++;return Promise.resolve()}
}:null};`;
const open = async info => { const b = await launch({ width: 390, height: 844, dpr: 1, lang: 'tr-TR', seed: fake(info) }); await b.goto(page); await b.sleep(1300); return b; };
const row = `(()=>{document.getElementById('setBtn').click();return !!document.querySelector('#setRows [data-set="privacy"]')})()`;

let b = await open(`{status:'REQUIRED',isConsentFormAvailable:true,canRequestAds:false,privacyOptionsRequirementStatus:'UNKNOWN'}`);
T('Avrupa: açılışta pencere bir kez', await b.eval(`__c.info===1&&__c.form===1`), await b.eval(`JSON.stringify(__c)`));
T('Ayarlar: gizlilik satırı var', await b.eval(row));
await b.eval(`document.querySelector('#setRows [data-set="privacy"]').click()`); await b.sleep(50);
T('satır Google penceresini açar', await b.eval(`__c.opt===1`));
T('konsol temiz', !b.logs.length, b.logs.join(' | ')); await b.close();

b = await open(`{status:'NOT_REQUIRED',isConsentFormAvailable:false,canRequestAds:true,privacyOptionsRequirementStatus:'NOT_REQUIRED'}`);
T('Avrupa dışı: pencere yok', await b.eval(`__c.info===1&&__c.form===0`));
T('Ayarlar: gizlilik satırı yok', !(await b.eval(row)));
await b.close();

b = await open(`{status:'NOT_REQUIRED',isConsentFormAvailable:true,canRequestAds:true,privacyOptionsRequirementStatus:'REQUIRED'}`);
T('ABD eyaleti: açılışta pencere yok', await b.eval(`__c.info===1&&__c.form===0`));
T('ABD eyaleti: Ayarlar satırı var', await b.eval(row));
await b.close();

b = await open(`new Error('offline')`);
T('çevrimdışı: oyun açık', await b.eval(`__kp.G.mode==='menu'&&__c.form===0`));
T('konsol temiz', !b.logs.length, b.logs.join(' | ')); await b.close();

/* öğretim izin penceresinin altında başlamaz */
b = await launch({ width: 390, height: 844, dpr: 1, lang: 'tr-TR', ob: true, seed: `window.__c={};window.Capacitor={isNativePlatform:()=>true,registerPlugin:n=>n==='AdMob'?{requestConsentInfo(){return Promise.resolve({status:'REQUIRED',isConsentFormAvailable:true})},showConsentForm(){return new Promise(r=>{window.__done=()=>r({status:'OBTAINED',canRequestAds:true,privacyOptionsRequirementStatus:'REQUIRED'})})},initialize(){return Promise.resolve()}}:null};` });
await b.goto(page); await b.sleep(7500);
T('pencere açıkken öğretim bekler', await b.eval(`!__kp.G.ob&&__kp.save.ob===1`));
await b.eval(`__done()`); await b.sleep(600);
T('pencere kapanınca öğretim başlar', await b.eval(`!!__kp.G.ob`));
await b.close();
console.log(fail ? fail + ' HATA' : 'hepsi geçti');
process.exit(fail ? 1 : 0);
