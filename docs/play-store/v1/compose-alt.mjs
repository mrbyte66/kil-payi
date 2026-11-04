import { launch } from '../../../tools/cdp.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { A, B, C, covers } from './art.mjs';
const R = process.argv[2], OUT = process.argv[3]; mkdirSync(OUT, { recursive: true });
const V = JSON.parse(readFileSync(R + '/view.json'));
const SC = [['hero', 'p', 'Tek dokunuş.<br>Kıl payı.', 'İbre hedefe girdiği an dokun'], ['cehennem', 'h', 'Cehennem\'e<br>dayanabilir misin?', '4 zorluk, ayrı rekorlar']];
const b = await launch({ width: 1080, height: 1920, dpr: 1 });
for (const [name, F] of [['A', A], ['B', B], ['C', C]]) for (const sc of SC) { writeFileSync(OUT + '/p.html', F(R, sc[0], sc[1], sc[2], sc[3], V[sc[0]])); await b.goto('file://' + OUT + '/p.html'); await b.sleep(450); await b.shot(`${OUT}/${name}-${sc[0]}.png`); }
await b.close();
const f = await launch({ width: 1024, height: 500, dpr: 1 });
for (const [n, h] of Object.entries(covers('Kıl payı', 'Tek dokunuş, tam zamanlama.'))) { writeFileSync(OUT + '/f.html', h); await f.goto('file://' + OUT + '/f.html'); await f.sleep(500); await f.shot(`${OUT}/${n}.png`); }
console.log(f.logs.join('\n')); await f.close(); process.exit(0);
