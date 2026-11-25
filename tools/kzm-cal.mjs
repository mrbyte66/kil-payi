#!/usr/bin/env node
/* KZM mekanik kalibrasyonu: her mekanik için özdeş dalgalardan oluşan deneme bölümü, gerçek oyunda botla (insan katmanlı) oynanır;
   dalga başına ölçülen hasar (ıska 1, tuzak 2) ile modelin waveRisk değeri karşılaştırılır.  node tools/kzm-cal.mjs [koşu=24] [ad süzgeci] */
import * as K from './kzm-core.mjs';
import { openGame, runScript } from './kzm-run.mjs';
const R = +(process.argv[2] || 24), FLT = process.argv[3] || '';
const W = (o, v = 210, d = 28) => Object.assign({ s: 'tek', n: 1, m: [], e: [], tr: { n: 0 }, v, d }, o);
const T = (n, w, k) => ({ n, w, g: 8, k: k || [] });
const CASES = [
  ['tek1', W({}), 35], ['tek2', W({ n: 2 }), 35], ['kayan', W({ m: ['kayan'] }), 35], ['nefes', W({ m: ['nefes'] }), 35], ['hayalet', W({ m: ['hayalet'] }), 35], ['ani', W({ m: ['ani'] }), 35],
  ['cift3', W({ s: 'cift', n: 3 }), 35], ['kasa3', W({ s: 'kasa', n: 3 }), 35], ['kasa3+kyon', W({ s: 'kasa', n: 3, e: ['kyon'] }), 35], ['kasa3+kayan', W({ s: 'kasa', n: 3, m: ['kayan'] }), 35],
  ['gelgit', W({ s: 'gelgit', n: 1 }), 35], ['isin', W({ s: 'isin', n: 1 }), 35], ['nabiz', W({ e: ['nabiz'] }), 35], ['degirmen', W({ e: ['degirmen'] }), 35], ['serit', W({ e: ['serit'] }), 35],
  ['tuzak1', W({ tr: T(1, 24) }), 35], ['tuzak2', W({ tr: T(2, 24) }), 35], ['shr', W({ x: { shr: { f: 0.6, t: 0.8 } } }), 35], ['amb', W({ x: { amb: { L: 0.45, tell: 0.5, n: 1 } } }), 35], ['kyon-tek', W({ e: ['kyon'] }), 35],
  ['kasa+alarm', W({ s: 'kasa', n: 3, tr: T(1, 24, ['alarm']) }), 35], ['kayan+kayanT', W({ m: ['kayan'], tr: T(1, 24, ['kayanT']) }), 35], ['nefes+diken', W({ m: ['nefes'], tr: T(1, 24, ['diken']) }), 35], ['hayalet+hayaletT', W({ m: ['hayalet'], tr: T(1, 24, ['hayaletT']) }), 35],
  ['kayan+nefes', W({ m: ['kayan', 'nefes'] }), 35], ['tek+nabiz+kyon', W({ e: ['nabiz', 'kyon'] }), 35],
  ['nabiz+kayan', W({ m: ['kayan'], e: ['nabiz'] }), 35], ['nabiz+nefes', W({ m: ['nefes'], e: ['nabiz'] }), 35], ['diken-tuzaksiz', W({ m: ['nefes'], tr: { n: 0, k: ['diken'] } }), 35], ['cift2', W({ s: 'cift', n: 2 }), 35], ['kasa2', W({ s: 'kasa', n: 2 }), 35],
].filter(c => !FLT || FLT.split(',').includes(c[0]));
const g = await openGame(), out = {};
for (const [name, w, sg] of CASES) {
  const script = { z: 90, w: Array.from({ length: 20 }, () => JSON.parse(JSON.stringify(w))) }, av = K.avOf(sg);
  const runs = await runScript(g, { n: 18, script, sigma: sg, av, runs: R });
  let Wn = 0, dmg = 0; runs.forEach(r => { Wn += r.w; r.e.forEach(e => { dmg += e[1] ? 2 : 1; }); });
  const bot = dmg / Wn, model = K.waveRisk(w, sg, av, 1); out[name] = { bot, model };
  console.log(name.padEnd(18), 'bot', bot.toFixed(3), ' model', model.toFixed(3), ' bot/model', (bot / Math.max(1e-6, model)).toFixed(2));
}
import('node:fs').then(fs => fs.writeFileSync(new URL('../.claude/bl-work/cal-son.json', import.meta.url).pathname, JSON.stringify(out)));
await g.close(); process.exit(0);
