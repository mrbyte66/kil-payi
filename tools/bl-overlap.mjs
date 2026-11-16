/* Bölümler çakışma denetimi: node tools/bl-overlap.mjs [dalga sayısı/bölüm] [bölümler]
   DEBUG=1 derlemesi gerekir. Her bölümün her kısmında dalgalar kurulur; kurulduğu anda aynı halkadaki iki nesne (hedef, tuzak, girdap,
   kapı, tut-bırak, kilit pimi) birbirinin üstündeyse sayar. Bilerek üst üste olanlar (değirmen kanadı, kayan tuzak ikizi) sayılmaz; kayan engel hedefin üstünden geçebilir, ama iki hedef (kayan dahil) birbirinin yayına giremez ve gelgit bandının üstünde hiçbir şey olmaz. */
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [nw = '30', spec = '1-80'] = process.argv.slice(2);
const list = spec.split(',').flatMap(p => { const [a, b] = p.split('-').map(Number); return b ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a]; });
const b = await launch({ width: 390, height: 844, dpr: 1, lang: 'tr-TR', seed: 'window.requestAnimationFrame=function(){return 0};window.__errs=[];window.addEventListener("error",e=>__errs.push(e.message));' });
let tot = 0, bad = 0; const kinds = {};
try {
  await b.goto('file://' + join(root, 'www', 'index.html'));
  for (const lv of list) {
    const r = JSON.parse(await b.eval(`(()=>{const k=__kp,G=k.G;if(k.blSoon(${lv}))return '{"skip":1}';
      const nm=p=>p.kind==='gate'?(p.note?'nota':p.kasa?'kasa':p.light?'ışık':p.gold?'altın':p.bonus?'yan hedef':'hedef'):p.kind==='trap'?'tuzak':p.kind;
      const ext=p=>p.kind==='hold'?p.hw+(p.len||0)/2:(p.hw||0), cen=p=>p.kind==='hold'?p.c0+(p.len||0)*(p.dirH||1)/2:p.c0;
      const ad=(a,b)=>{let d=Math.abs(((a-b)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI);return d};
      let n=0,bad=0,ks={};k.save.bl.f={};k.blStart(${lv});const B=G.bl;
      for(let i=0;i<${+nw};i++){B.wave=Math.floor(i/${+nw}*B.waves);G.pins=[];G.ang=Math.random()*6.28;k.spawn(false);n++;
        const ps=G.pins.filter(p=>!p.done),two=!B.br&&G.kind==='iki';let hit=false;
        for(let a=0;a<ps.length;a++)for(let c=a+1;c<ps.length;c++){const p=ps[a],q=ps[c];
          if(!two&&(p.ring|0)!==(q.ring|0))continue; if(two&&(p.ring|0)!==(q.ring|0))continue;
          if(p.prio||q.prio||p.mill!=null||q.mill!=null)continue; if(p.amp||q.amp){if(p.kind==='gate'&&q.kind==='gate'&&ad(cen(p),cen(q))<ext(p)+ext(q)+Math.abs(p.amp||0)+Math.abs(q.amp||0)){hit=true;ks['kayan hedef+hedef']=(ks['kayan hedef+hedef']||0)+1;}continue;}
          if(p.kind==='portal'&&q.kind==='portal')continue;
          if(ad(cen(p),cen(q))<ext(p)+ext(q)){hit=true;const key=[nm(p),nm(q)].sort().join('+');ks[key]=(ks[key]||0)+1;}}
        const tw=(k.MECH&&k.MECH.tideW)||0.95;if(G.kind==='gelgit'&&G.tideC!=null)for(const p of ps){if(p.prio||p.mill!=null||p.ring)continue;if(ad(cen(p),G.tideC)<tw+ext(p)+Math.abs(p.amp||0)){hit=true;const key='gelgit+'+nm(p);ks[key]=(ks[key]||0)+1;}}
        if(hit)bad++;}
      k.goMenu();return JSON.stringify({id:k.blId(${lv}),n,bad,ks})})()`, { timeout: 120000 }));
    if (r.skip) continue;
    tot += r.n; bad += r.bad; for (const q in r.ks) kinds[q] = (kinds[q] || 0) + r.ks[q];
    if (r.bad) console.log(String(lv).padStart(2), r.id, r.bad + '/' + r.n, JSON.stringify(r.ks));
  }
  console.log(`toplam: ${bad}/${tot} dalgada çakışma (%${(bad / tot * 100).toFixed(2)})`, JSON.stringify(kinds));
  const errs = await b.eval('JSON.stringify(window.__errs)');
  if (errs !== '[]') console.log('konsol hataları: ' + errs);
} finally { await b.close(); }
process.exit(0);
