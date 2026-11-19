/* Kilit oynanışı adalet ölçümü (2026-11-19, kullanıcı: "kayma, ibre, hedef ve engel hep üst üste denk geliyor; asıl kanca pim çeşitlerinin kendisinde"):
   node tools/bl-fair.mjs [beceri] [koşu] [bölümler]   (DEBUG=1 derlemesi; tools/bot.js)
   Bot (beceri: usta varsayılan) her bölümü koşu kez oynar. Her hedefe varışta engelin o vuruşa kattığı risk (bot.js aimOff) kaydedilir:
   "tur bekle" = hedef engelle kapalı, vurulamaz (insan bir tur bekler), "sıkışık" = engel riski 0,15 canı aşıyor. Can kayıpları nedenine göre
   (ıska, düz tuzak, kayan tuzak, değirmen kanadı, diken, alarm, hayalet tuzak) ve bölümün neresinde (ilk %30 / son %40) olduğuna göre sayılır. */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [skill = 'usta', n = '10', spec = '4-55'] = process.argv.slice(2);
const SK = { yeni: [0.12, 0.5], orta: [0.08, 0.75], iyi: [0.05, 0.9], usta: [0.03, 0.95], pro: [0.02, 1] };
const list = spec.split(',').flatMap(p => { const [a, b] = p.split('-').map(Number); return b ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a]; });
const b = await launch({ width: 390, height: 844, dpr: 1, lang: 'tr-TR', seed: 'window.requestAnimationFrame=function(){return 0};' });
const tot = {};
try {
  await b.goto('file://' + join(root, 'www', 'index.html'));
  await b.eval(readFileSync(join(root, 'tools', 'bot.js'), 'utf8'));
  for (const lv of list) {
    const r = JSON.parse(await b.eval(`(()=>{const k=__kp;window.__blLog=[];window.__fair=[];window.__dec=[];let win=0;
      for(let i=0;i<${+n};i++){runBot(${SK[skill][0]},${SK[skill][1]},1,400,1/60,{setup:()=>{k.save.bl.f={};k.blStart(${lv})}});if(k.G.mode==='blwin')win++;}
      k.goMenu();return JSON.stringify({id:k.blId(${lv}),win,log:window.__blLog,fair:window.__fair,dec:window.__dec})})()`, { timeout: 590000 }));
    const F = r.fair, arr = F.length, skip = F.filter(f => f[0]).length, crowd = F.filter(f => !f[0] && f[1] > 0.15).length;
    const cause = {}; let early = 0, late = 0;
    for (const [t, why, x] of r.log) { const key = t === 'tuzak' ? why : 'ıska'; cause[key] = (cause[key] || 0) + 1; if (x < 0.3) early++; if (x >= 0.6) late++; tot[key] = (tot[key] || 0) + 1; }
    const nl = r.log.length || 1, D = r.dec || [], conf = D.filter(v => v > 0.3).length;
    console.log(`${String(lv).padStart(2)} ${r.id.padEnd(10)} geçti ${String(Math.round(r.win * 100 / +n)).padStart(3)}% · varış ${arr} · tur bekle %${Math.round(skip * 100 / Math.max(1, arr))} · sıkışık %${Math.round(crowd * 100 / Math.max(1, arr))} · karar anında hedefin %30+'ı kapalı %${Math.round(conf * 100 / Math.max(1, D.length))} · can kaybı ${r.log.length} (ilk %30'da %${Math.round(early * 100 / nl)}, son %40'ta %${Math.round(late * 100 / nl)}) · ${Object.entries(cause).sort((a, b) => b[1] - a[1]).map(([k2, v]) => k2 + ' ' + v).join(', ')}`);
  }
  console.log('TOPLAM can kaybı nedeni: ' + Object.entries(tot).sort((a, b) => b[1] - a[1]).map(([k2, v]) => k2 + ' ' + v).join(', '));
} finally { await b.close(); }
process.exit(0);
