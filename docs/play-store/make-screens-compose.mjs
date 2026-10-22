import { launch } from '/Users/beytullahgonulal/Desktop/AndroidDevelopment/KilPayi/tools/cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const ROOT = '/Users/beytullahgonulal/Desktop/AndroidDevelopment/KilPayi', SP = process.argv[2], L = process.argv[3], OUT = process.argv[4];
mkdirSync(OUT, { recursive: true });
const P = { // sıra, dosya, arka plan, [EN başlık, EN alt], [TR başlık, TR alt]
  1: ['gelgit',   'p', ['Ride the tide', 'The pointer speeds up in the dark band'], ['Gelgite kapıl', 'Koyu bantta ibre hızlanır']],
  2: ['isin',     'p', ['Teleport pins', 'Enter the blue gate, exit the orange one'], ['Işınlanma pimi', 'Mavi kapıdan gir, turuncudan çık']],
  3: ['cehennem', 'h', ['Dare the Hell level', 'Four levels, one inferno'], ['Cehennem\'e meydan oku', 'Dört kademe, tek cehennem']],
  4: ['trafik',   'p', ['Green go, red no', 'Hit the green, dodge the red'], ['Yeşile vur', 'Kırmızıdan kaç']],
  5: ['bomba',    'p', ['Beat the bomb', 'Hit it before time runs out'], ['Bombayı yakala', 'Süre dolmadan vur']],
  6: ['tutbirak', 'p', ['Jokers lend a hand', 'Wider targets, shields, slower time'], ['Jokerler yardımda', 'Geniş hedef, kalkan, yavaş zaman']],
  7: ['shop',     'i', ['Spend coins in the Shop', 'Jokers, slots and upgrades'], ['Mağazadan alışveriş yap', 'Joker, yuva ve geliştirmeler']],
  8: ['menu',     'p', ['One tap. Hit it by a hair.', 'Four levels and a 10-level journey'], ['Tek dokunuş, kıl payı', 'Dört kademe ve 10 seviyelik yolculuk']]
};
const BG = { p: 'radial-gradient(120% 70% at 50% 0%,#9D8BFF 0%,#5B45D6 45%,#2A1B80 100%)', h: 'radial-gradient(120% 70% at 50% 0%,#FF7A3D 0%,#8A1F2B 45%,#1A0A14 100%)', i: 'radial-gradient(120% 70% at 50% 0%,#7A68F0 0%,#3A2A9E 50%,#150E45 100%)' };
const b = await launch({ width: 1080, height: 1920, dpr: 1 });
for (const [n, [f, bg, en, tr]] of Object.entries(P)) {
  const [h1, h2] = L === 'tr' ? tr : en;
  const html = `<!doctype html><meta charset=utf-8><link rel=stylesheet href="file://${ROOT}/src/fonts/fonts.css"><body style="margin:0;width:1080px;height:1920px;overflow:hidden;background:${BG[bg]};font-family:Fredoka,sans-serif;position:relative">
<div style="position:absolute;left:0;right:0;top:56px;text-align:center;color:#fff;padding:0 50px"><div style="font-weight:700;font-size:84px;line-height:1.05">${h1}</div><div style="font-weight:500;font-size:42px;margin-top:18px;color:${bg === 'h' ? '#FFD9B0' : '#FFD2A6'}">${h2}</div></div>
<img src="file://${SP}/raw/${L}/${f}.png" style="position:absolute;left:90px;top:320px;width:900px;height:1600px;border-radius:64px 64px 0 0;box-shadow:0 30px 80px rgba(0,0,0,.45);border:6px solid rgba(255,255,255,.55);border-bottom:none;box-sizing:border-box">`;
  writeFileSync(`${SP}/c.html`, html);
  await b.goto('file://' + SP + '/c.html'); await b.sleep(900);
  await b.shot(`${OUT}/${n}-${f}.png`);
}
await b.close(); process.exit(0);
