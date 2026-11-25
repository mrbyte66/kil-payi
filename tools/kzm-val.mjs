#!/usr/bin/env node
/* KZM doğrulama: üretilen bölümü gerçek oyunda insan katmanlı botla oyna, modelin öngördüğü geçme oranıyla karşılaştır.
   node tools/kzm-val.mjs <bölüm no,no,...> [koşu=30] [sigma çarpanları, virgülle: 1,1.25]   (DEBUG=1 derlemesi gerekir, BL_SC yazılmış olmalı) */
import fs from 'node:fs';
import * as K from './kzm-core.mjs';
import { openGame } from './kzm-run.mjs';
const ns = (process.argv[2] || '19').split(',').map(Number), R = +(process.argv[3] || 30), mults = (process.argv[4] || '1,1.25').split(',').map(Number);
const all = JSON.parse(fs.readFileSync(new URL('./kzm-levels.json', import.meta.url).pathname, 'utf8'));
const idOf = n => ['tek', 'kayan', 'nefes', 'kasa', 'gelgit', 'degirmen', 'ani', 'hayalet', 'nabiz', 'isin', 'serit'][Math.floor((n - 1) / 5)] + ((n - 1) % 5 + 1);
const g = await openGame();
for (const n of ns) {
  const id = idOf(n), sc = all[id]; if (!sc) { console.log(n, id, 'yok'); continue; }
  const s50 = K.sigmaOfZ(sc.z), row = [];
  for (const m of mults) {
    const sg = s50 * m, av = K.avOf(sg), model = K.passProb(sc, sg);
    const r = JSON.parse(await g.eval(`(() => { const k = __kp, G = k.G; let ok = 0, dur = 0; for (let r = 0; r < ${R}; r++) { runBot(${sg / 1000}, ${av}, 1, 400, 1/60, { hf: true, jitter: 0, setup: () => { k.save.bl.f = {}; k.blStart(${n}); } }); if (G.mode === 'blwin') ok++; k.goMenu(); } return JSON.stringify(ok / ${R}); })()`, { timeout: 560000 }));
    row.push(`σ${sg.toFixed(0)}ms model ${(model * 100).toFixed(0)}% bot ${(r * 100).toFixed(0)}%`);
  }
  console.log(`Bölüm ${n} ${id} (Z${sc.z}):`, row.join('  |  '));
}
await g.close(); process.exit(0);
