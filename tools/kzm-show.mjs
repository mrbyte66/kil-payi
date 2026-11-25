#!/usr/bin/env node
/* KZM bölüm dökümü: node tools/kzm-show.mjs kasa4 [kayan2 ...]  (tools/kzm-levels.json içinden) */
import fs from 'node:fs';
import * as K from './kzm-core.mjs';
const all = JSON.parse(fs.readFileSync(new URL('./kzm-levels.json', import.meta.url).pathname, 'utf8'));
for (const id of process.argv.slice(2)) { if (!all[id]) { console.log(id, 'yok'); continue; } console.log('--', id, 'hedef Z', all[id].z); console.log(K.describe(all[id])); }
