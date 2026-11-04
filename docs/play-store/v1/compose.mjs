/* V1.0.0 mağaza görselleri, 2. adım (kullanıcı seçimi: stil B + Kapak 1). node compose.mjs <ham klasör: içinde tr ve en> */
import { launch } from '../../../tools/cdp.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { A, B, covers } from './art.mjs';
const RAW = process.argv[2], HERE = new URL('./', import.meta.url).pathname;
/* sıra, ham kare, arka plan, stil, [başlık, alt] TR, EN */
const SC = [
  ['1-tek-dokunus', 'hero', 'p', B, ['Tek dokunuş.<br>Kıl payı.', 'İbre hedefe girdiği an dokun'], ['One tap.<br>By a hair.', 'Tap the instant the needle hits the target']],
  ['2-yeni-kural', 'isin', 'p', B, ['Her seviyede<br>yeni kural', 'Mavi kapıdan gir, turuncudan çık'], ['A new rule<br>every level', 'In the blue gate, out the orange one']],
  ['3-cehennem', 'cehennem', 'h', B, ['Cehennem\'e<br>dayanabilir misin?', '4 zorluk, ayrı rekorlar'], ['Can you<br>survive Hell?', '4 difficulties, separate records']],
  ['4-bomba', 'bomba', 'p', B, ['Fitil yanıyor,<br>hızlı ol', 'Bombayı süre dolmadan vur'], ['The fuse is lit,<br>be quick', 'Hit the bomb before time runs out']],
  ['5-zorluk', 'zorluk', 'h', B, ['Zorluğunu<br>sen seç', 'Rahat, Normal, Usta, Cehennem'], ['Pick your<br>difficulty', 'Easy, Normal, Master, Hell']],
  ['6-joker', 'joker', 'p', A, ['Zor anda<br>joker kullan', 'Kronometre süreni kurtarır'], ['Use a joker<br>when it counts', 'The Stopwatch buys you time']],
  ['7-magaza', 'shop', 'i', A, ['Altınla<br>güçlen', 'Mağazada joker aç, yuva ekle'], ['Power up<br>in the shop', 'Unlock jokers, add slots']],
  ['8-internetsiz', 'menu', 'p', B, ['İnternetsiz,<br>hesapsız', 'Yolda, uçakta, her yerde oyna'], ['No Wi-Fi.<br>No account.', 'Play anywhere, anytime']]
];
const COVER = { tr: ['Kıl payı', 'Tek dokunuş, tam zamanlama.'], en: ['Close Call', 'One tap. Perfect timing.'] };
const b = await launch({ width: 1080, height: 1920, dpr: 1 }), f = await launch({ width: 1024, height: 500, dpr: 1 });
for (const L of ['tr', 'en']) {
  const R = RAW + '/' + L, V = JSON.parse(readFileSync(R + '/view.json')), O = HERE + L; mkdirSync(O, { recursive: true });
  for (const [name, raw, bg, F, tr, en] of SC) {
    const [h, s] = L === 'tr' ? tr : en;
    writeFileSync(O + '/p.html', F(R, raw, bg, h, s, V[raw] || V.menu));
    await b.goto('file://' + O + '/p.html'); await b.sleep(450); await b.shot(`${O}/${name}.png`);
  }
  writeFileSync(O + '/p.html', covers(...COVER[L]).K1);
  await f.goto('file://' + O + '/p.html'); await f.sleep(500); await f.shot(`${O}/kapak.png`);
}
await b.close(); await f.close(); process.exit(0);
