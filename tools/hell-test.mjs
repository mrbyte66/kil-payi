/* Cehennem çemberi ve yanma etkisi testi: node tools/hell-test.mjs
   DEBUG=1 derlemesini yapar, başsız Chrome'da (tools/cdp.mjs, telefonun "animasyonları kaldır" ayarı taklit edilir) şunları kontrol eder:
   - dönüş programı: Seviye 1-2 dönmez (nefes sürer), 3-5 tek yönlü ve hedef hızda, 6-10 iki yönlü karışık (yön değişir, arada durur, hız sınırı aşılmaz), sarmal yok,
   - sıvı çemberin dönüşünü izlemez (sıvı çizilirken tuval dönüşü ~0),
   - oyuncu yanınca (her kademede) kül ve kor: çember alevlenir, kaybolur, kor ve parçalar süre sonunda temizlenir, ikinci şansta çember yeniden belirir, "Animasyonlar" kapalıyken yok. */
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
execFileSync('sh', ['-c', 'DEBUG=1 ./build.sh'], { cwd: root, stdio: 'ignore' });
const SCRIPT = `(async()=>{var out=[],ok=0,bad=0;function T(n,c,e){if(c){ok++}else{bad++;out.push('HATA '+n+(e!==undefined?' → '+JSON.stringify(e):''))}}
var K=window.__kp,S=K.save,G=K.G,HX=K.HX;window.requestAnimationFrame=function(){return 0};
try{
function hellRun(L,secs,dir){K.setLevel('cehennem');K.G.mode='play';K.G.practice=false;K.G.dir=dir||1;K.G.L=L;HX.s=0;HX.a=0;HX.r=0;HX.v=0;HX.tr=0;HX.t=0;HX.sg=1;HX.tg=1;HX.nx=0;
  var vs=[],bs=[],rs=[];for(var i=0;i<Math.round(secs/0.016);i++){K.hellFx(0.016);vs.push(HX.v*180/Math.PI);bs.push(HX.b);rs.push(HX.r)}return{vs:vs,bs:bs,rs:rs}}
// 1) Seviye 1-2: dönmez, nefes sürer
[1,2].forEach(function(L){var r=hellRun(L,6);T('Seviye '+L+': dönmez',Math.abs(HX.r)<1e-6&&Math.abs(HX.tr)<1e-6,[HX.r,HX.tr]);T('Seviye '+L+': nefes sürer',Math.min.apply(null,r.bs)<0.99,Math.min.apply(null,r.bs))});
// 2) Seviye 3-5: tek yönlü, hedef hızda
[3,4,5].forEach(function(L){var r=hellRun(L,25,1),tail=r.vs.slice(r.vs.length-600),mean=tail.reduce(function(a,b){return a+b},0)/tail.length,t=K.HELL_ROT[L-1];
  T('Seviye '+L+': tek yönlü (ibrenin tersi) ve ~'+t+' °/sn',tail.every(function(v){return v<0})&&Math.abs(Math.abs(mean)-t)<t*0.12,[mean,t])});
// 3) Seviye 6-10: iki yönlü karışık, arada durur, hız sınırı aşılmaz
[6,8,10].forEach(function(L){var r=hellRun(L,90,1),t=K.HELL_ROT[L-1],flips=0,prev=0,mx=0,near=0;
  r.vs.forEach(function(v){if(Math.abs(v)>t*0.5){var s=v>0?1:-1;if(prev&&s!==prev)flips++;prev=s}mx=Math.max(mx,Math.abs(v));if(Math.abs(v)<1.5)near++});
  T('Seviye '+L+': yön değişiyor (90 sn\\'de ≥ 4 kez) ve hız sınırı aşılmıyor',flips>=4&&mx<=t*1.02,{flips:flips,max:mx,t:t});
  T('Seviye '+L+': dönüş yumuşak (yön değişirken durmaya yaklaşır)',near>20,near)});
T('sarmal kaldırıldı',HX.sp===undefined&&!('sp' in HX));
// 4) sıvı çemberin dönüşünü izlemez
var angs=[],oc=CanvasRenderingContext2D.prototype.clip;CanvasRenderingContext2D.prototype.clip=function(){var m=this.getTransform();angs.push(Math.atan2(m.b,m.a));return oc.apply(this,arguments)};
K.setLevel('cehennem');K.start();K.G.mode='play';K.G.time=5;K.G.tvis=5;HX.s=1;HX.r=0.9;K.render();
T('sıvı çizilirken tuval dönmüyor (çember 0,9 rad dönmüşken)',angs.length>0&&angs.every(function(a){return Math.abs(a)<0.02}),angs);
CanvasRenderingContext2D.prototype.clip=oc;
// 5) yanma: her kademede
['rahat','normal','usta','cehennem'].forEach(function(l){K.setLevel(l);K.start();K.G.mode='play';K.die();var b=K.G.burn;
  T(l+': yanınca kül ve kor başladı (8 parça, 150 kor, sonuç 1,95 sn sonra)',!!b&&b.ch.length===8&&b.em.length===150&&Math.abs(K.G.deadT-0.85*K.BURN.slow)<1e-6,[!!b,K.G.deadT]);
  for(var i=0;i<30;i++)K.update(0.016);K.render();
  T(l+': 0,48 sn sonra alev sürüyor (yavaşladı: alev '+K.BURN.flame.toFixed(2)+' sn)',K.G.burn&&K.G.burn.t<K.BURN.flame&&K.G.mode==='dead',[K.G.burn&&K.G.burn.t,K.G.mode]);
  for(var i=0;i<50;i++)K.update(0.016);K.render();
  T(l+': alev bitti (çember kayboldu), sonuç ekranı henüz yok',K.G.burn&&K.G.burn.t>=K.BURN.flame&&K.G.mode==='dead',[K.G.burn&&K.G.burn.t,K.G.mode]);
  for(var i=0;i<50;i++)K.update(0.016);
  T(l+': 2,1 sn sonra sonuç ekranı açıldı, kor sürüyor',K.G.mode==='over'&&!!K.G.burn,[K.G.mode,!!K.G.burn]);
  for(var i=0;i<330;i++)K.update(0.016);
  T(l+': 7,4 sn sonra kor temizlendi',K.G.burn===null,K.G.burn&&K.G.burn.t)});
// 6) ikinci şans: çember yeniden belirir
K.setLevel('normal');K.start();K.G.mode='play';K.die();for(var i=0;i<140;i++)K.update(0.016);K.doContinue();
T('ikinci şans: kor temizlendi, çember ortadan dışa belirir (G.reform 0)',K.G.burn===null&&K.G.reform===0&&K.G.mode==='play',[K.G.reform,K.G.mode]);
for(var i=0;i<40;i++)K.update(0.016);K.render();T('ikinci şans: 0,6 sn sonra çember tam',K.G.reform===1,K.G.reform);
// 7) animasyonlar kapalıyken yanma yok (eski sakin davranış)
S.anim=false;K.applyMotion();K.setLevel('normal');K.start();K.G.mode='play';K.die();
T('Animasyonlar kapalı: kor yok, sonuç 0,6 sn sonra',K.G.burn===null&&Math.abs(K.G.deadT-0.6)<1e-6,[K.G.burn,K.G.deadT]);
S.anim=true;K.applyMotion();
// 8) Dene modunda yanma yok
K.setLevel('normal');K.start();K.G.mode='play';K.G.practice={};K.die();T('Dene modunda kor yok',K.G.burn===null);K.G.practice=null;
}catch(e){out.push('İSTİSNA '+e.stack)}return ok+' tamam, '+bad+' hata'+(out.length?'\\n'+out.join('\\n'):'')})()`;
const b = await launch({ width: 390, height: 844, dpr: 1, lang: 'tr-TR', reduceMotion: true });
await b.goto('file://' + join(root, 'www', 'index.html'));
let r;
try { r = await b.eval(SCRIPT, { timeout: 120000 }); if (b.logs.length) r += '\n' + b.logs.join('\n'); } catch (e) { r = 'ÇÖKTÜ ' + e.message; }
await b.close();
console.log(r);
process.exit(/ 0 hata/.test(String(r).split('\n')[0]) ? 0 : 1);
