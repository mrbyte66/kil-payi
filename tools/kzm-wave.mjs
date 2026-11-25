#!/usr/bin/env node
/* KZM dalga dalga karşılaştırma: node tools/kzm-wave.mjs <bölüm no> [koşu=40] [sigma çarpanı=1]
   Sanal can ile oynatır (bot ölmez), dalga başına ölçülen hasar ile modelin waveRisk değerini yan yana yazar. */
import fs from 'node:fs';
import * as K from './kzm-core.mjs';
import { openGame, runScript } from './kzm-run.mjs';
const n = +(process.argv[2] || 9), R = +(process.argv[3] || 40), mult = +(process.argv[4] || 1);
const all = JSON.parse(fs.readFileSync(new URL('./kzm-levels.json', import.meta.url).pathname, 'utf8'));
const id = ['tek', 'kayan', 'nefes', 'kasa', 'gelgit', 'degirmen', 'ani', 'hayalet', 'nabiz', 'isin', 'serit'][Math.floor((n - 1) / 5)] + ((n - 1) % 5 + 1), sc = all[id];
const sg = K.sigmaOfZ(sc.z) * mult, av = K.avOf(sg), g = await openGame();
const runs = await runScript(g, { n, script: null, sigma: sg, av, runs: R });
const N = sc.w.length, bot = new Array(N).fill(0); runs.forEach(r => r.e.forEach(e => { bot[Math.min(N - 1, e[0])] += e[1] ? 2 : 1; }));
let tb = 0, tm = 0; const rows = [];
sc.w.forEach((w, i) => { const b = bot[i] / R, m = K.waveRisk(w, sg, av, 1); tb += b; tm += m; rows.push([i + 1, K.sigOf(w).replace(/\|/g, ' ').slice(0, 34).padEnd(34), 'v' + w.v, 'd' + w.d, 'bot ' + b.toFixed(2), 'model ' + m.toFixed(2)]); });
console.log(`${id} σ${sg.toFixed(0)}ms  toplam hasar/oyun: bot ${tb.toFixed(2)}  model ${tm.toFixed(2)}  | geçme (sanal canla) ${runs.filter(r => r.x).length}/${R}`);
if (process.argv[5]) rows.forEach(r => console.log(r.join(' ')));
await g.close(); process.exit(0);
