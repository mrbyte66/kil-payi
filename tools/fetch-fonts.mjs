// Google Fonts'tan Fredoka ve Nunito'yu (latin + latin-ext) indirip src/fonts içine yazar.
// Android sürümü fontları internetten çekmesin, uygulamanın içinden okusun diye.
// Kullanım: node tools/fetch-fonts.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'src', 'fonts');
const url = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@600;700;800&display=swap';
const ua = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36';

const css = await (await fetch(url, { headers: { 'User-Agent': ua } })).text();
const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g)];
if (!blocks.length) throw new Error('Google Fonts yanıtı beklenen biçimde değil');

await fs.mkdir(out, { recursive: true });
let result = '';
for (const [, subset, body] of blocks) {
  if (subset !== 'latin' && subset !== 'latin-ext') continue;
  const family = /font-family:\s*'([^']+)'/.exec(body)[1];
  const weight = /font-weight:\s*([^;]+);/.exec(body)[1].trim();
  const src = /url\(([^)]+)\)/.exec(body)[1];
  const range = /unicode-range:\s*([^;]+);/.exec(body)[1].trim();
  const file = `${family.toLowerCase()}-${subset}.woff2`;
  const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
  await fs.writeFile(path.join(out, file), buf);
  result += `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;src:url(${file}) format('woff2');unicode-range:${range}}\n`;
  console.log(file.padEnd(26), String(buf.length).padStart(7), 'bayt', weight);
}
await fs.writeFile(path.join(out, 'fonts.css'), result);
console.log('fonts.css yazıldı');
