/* V0.10.4 regression tests. Native events are mocked; no live ads are requested.
   Uses temporary in-memory debug exports, never changes the release payload. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { launch } from './cdp.mjs';
execFileSync('sh', ['-c', 'DEBUG=2 ./build.sh'], {stdio:'ignore'});
const html = readFileSync('www/index.html','utf8').replace('window.__kp={','window.__kp={Platform,goMenu,validRun,frameAt:ts=>frame(ts),');
const server = createServer((req,res)=>{
  if(req.url.startsWith('/fonts/')&&!req.url.includes('..')) { try { res.end(readFileSync('www'+req.url));return; } catch {} }
  res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port;
const mock=`window.requestAnimationFrame=()=>0;
const listeners=new Map();window.F={calls:0,slow:false,prepareSlow:false,results:[],emit(n){for(const fn of [...(listeners.get(n)||[])])fn({amount:1})},size(){return [...listeners.values()].reduce((s,v)=>s+v.size,0)}};
const A={initialize:()=>F.slow?new Promise(r=>F.initDone=r):Promise.resolve(),addListener:async(n,fn)=>{if(!listeners.has(n))listeners.set(n,new Set());listeners.get(n).add(fn);return{remove:async()=>listeners.get(n).delete(fn)}},prepareRewardVideoAd:()=>F.prepareSlow?new Promise(r=>F.prepared=r):Promise.resolve(),showRewardVideoAd:()=>{F.calls++;return new Promise(()=>{})}};
window.Capacitor={isNativePlatform:()=>true,registerPlugin:n=>n==='AdMob'?A:null};`;
let passed=0;
async function test(name,fn,seed='') {
 const b=await launch({seed:mock+seed});
 try {await b.goto(url);await fn(b);assert.deepEqual(b.logs,[]);passed++;console.log('PASS '+name);}finally{await b.close();}
}
const check=async(b,expr)=>assert.equal(await b.eval(expr),true,expr);
try {
 for(const raw of ['{"v":3,"coins":654321}', '{"v":3,"sg":"1","coins":654321}', '{"v":1,"sg":1,"coins":543210,"tools":{"unknown":null}}','{"v":3,"tools":null}','{"v":3,"coins":1e309}']) {
  await test('reject untrusted save '+raw,async b=>check(b,'__kp.save.coins===0&&__kp.save.tools.kron.n===1&&__kp.tampered()'),`localStorage.setItem('kilpayi.v1',${JSON.stringify(raw)});`);
 }
 await test('signed save survives reload; bad signed schema rejected',async b=>{
  await b.eval('__kp.save.coins=777;__kp.persist()');await b.goto(url);
  await check(b,'__kp.save.coins===777&&!__kp.tampered()');
  await b.eval('__kp.save.tools=null;__kp.persist()');await b.goto(url);
  await check(b,'__kp.save.coins===0&&__kp.save.tools.kron.n===1&&__kp.tampered()');
 });
 await test('resume valid run, reject impossible time',async b=>{
  await b.eval('__kp.start();__kp.G.time=4;__kp.G.score=123;__kp.persistRun()');await b.goto(url);
  await check(b,'__kp.resumeSaved()&&__kp.G.score===123&&__kp.G.time===4');
  await b.eval('__kp.save.run.time=1000000');await check(b,'!__kp.resumeSaved()&&__kp.save.run===null');
 });
 await test('journey snapshots remain valid across levels',async b=>{
  await check(b,`(()=>{const K=__kp;for(const lv of ['rahat','normal','usta','cehennem']){K.save.lvl=lv;for(let n=1;n<=12;n++){K.start(n);K.persistRun();if(!K.validRun(K.save.run))return false;}}return true;})()`);
 });
 await test('continue quota, expiry and ad quota',async b=>{
  await check(b,`(()=>{const K=__kp;K.start();K.G.n=10;K.save.coins=10000;
  for(let i=0;i<3;i++){K.die();K.showOver();document.getElementById('coinBtn').click();if(K.G.contN!==i+1)return false;}
  K.die();K.showOver();let c=K.save.coins;document.getElementById('coinBtn').click();document.getElementById('adBtn').click();if(K.G.contN!==3||K.save.coins!==c||F.calls!==0)return false;
  K.start();K.G.n=10;K.die();K.showOver();K.setContLeft(0);document.getElementById('coinBtn').click();document.getElementById('adBtn').click();return K.G.mode==='over'&&K.G.contN===0&&K.save.coins===c;})()`);
 });
 await test('timer charges real elapsed time; pause freezes it',async b=>{
  await check(b,`(()=>{const K=__kp;K.start();K.G.introQ=[];K.G.mode='play';K.G.time=7;K.G.tscale=1;K.frameAt(1000);const t=K.G.time;K.frameAt(2000);const used=t-K.G.time;K.G.mode='pause';const p=K.G.time;K.frameAt(3000);return used>0.9&&used<1.1&&K.G.time===p;})()`);
 });
 await test('wall clock forward cannot reset gift within session',async b=>{
  await check(b,`(()=>{const K=__kp;for(let i=0;i<5;i++)K.giftClaim();const old=Date.now;Date.now=()=>old()+86400001;const g=K.giftState();Date.now=old;return g.n===5&&g.wait>86000000&&g.next===0;})()`);
 });
 await test('only one native reward request; award once',async b=>{
  await b.eval('__kp.Platform.rewardedAd(ok=>F.results.push(ok));__kp.Platform.rewardedAd(ok=>F.results.push(ok))');await b.sleep(100);
  await b.eval("F.emit('onRewardedVideoAdReward');F.emit('onRewardedVideoAdDismissed');F.emit('onRewardedVideoAdDismissed')");
  await check(b,'F.calls===1&&F.results.length===2&&F.results.filter(Boolean).length===1&&F.size()===0');
 });
 await test('close without reward never grants',async b=>{
  await b.eval('__kp.Platform.rewardedAd(ok=>F.results.push(ok))');await b.sleep(100);
  await b.eval("F.emit('onRewardedVideoAdDismissed')");await check(b,'F.results.length===1&&F.results[0]===false&&F.size()===0');
 });
 for(const stage of ['init','prepare']) await test('timeout cancels late '+stage,async b=>{
  await b.eval(`F.${stage==='init'?'slow':'prepareSlow'}=true;const old=setTimeout;window.setTimeout=(f,ms,...args)=>old(f,ms===25000?30:ms,...args);__kp.Platform.rewardedAd(ok=>F.results.push(ok))`);
  await b.sleep(100);await b.eval(stage==='init'?'F.initDone()':'F.prepared()');await b.sleep(100);
  await check(b,'F.calls===0&&F.size()===0&&F.results.length===1&&F.results[0]===false');
 });
 await test('reward from previous run cannot continue new run',async b=>{
  await b.eval("__kp.start();__kp.G.n=10;__kp.die();__kp.showOver();document.getElementById('adBtn').click()");await b.sleep(100);
  await b.eval("__kp.start();__kp.Platform.rewardedAd(ok=>F.results.push(ok));F.emit('onRewardedVideoAdReward');F.emit('onRewardedVideoAdDismissed')");
  await check(b,"__kp.G.contN===0&&__kp.G.mode==='play'&&F.size()===0&&F.calls===1&&F.results.length===1&&F.results[0]===false");
 });
 console.log(`${passed} security regression tests passed`);
} finally {server.close();}
