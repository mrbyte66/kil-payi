/* Bot ile zorluk ölçümü (V0.9.12): node tools/bot-run.mjs <seviye> <beceri> [n] [www klasörü]
   Beceri: yeni | orta | iyi | usta | pro. Örnek: node tools/bot-run.mjs usta usta 60
   www klasörü verilmezse ./www kullanılır (DEBUG=1 derlemesi gerekir: DEBUG=1 ./build.sh). Eski bir sürümle karşılaştırmak için o sürümün DEBUG=1 derlemesini ayrı klasöre koy
   (git worktree add /tmp/kp-old v0.9.11; cd /tmp/kp-old; DEBUG=1 ./build.sh; sonra klasör olarak /tmp/kp-old/www ver) ve iki çalıştırmayı yan yana yap.
   Kare döngüsü durdurulur, bot oyunu elle sürer (hızlı: yüzlerce oyun birkaç saniye). Çıktı bulk() satırıdır: medyan süre, seviye, coin, S2..S12 ulaşma %, ölüm yerleri, Cehennem geçme %. */
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [lvl = 'usta', skill = 'usta', n = '40', dir] = process.argv.slice(2);
const SK = { yeni: [0.12, 0.5], orta: [0.08, 0.75], iyi: [0.05, 0.9], usta: [0.03, 0.95], pro: [0.02, 1] };
if (!SK[skill]) { console.log('beceri: ' + Object.keys(SK).join(' | ')); process.exit(1); }
const www = resolve(dir || join(root, 'www'));
const b = await launch({ width: 390, height: 844, dpr: 1, lang: 'tr-TR', seed: 'window.requestAnimationFrame=function(){return 0};' });
try {
  await b.goto('file://' + join(www, 'index.html'));
  await b.eval(readFileSync(join(root, 'tools', 'bot.js'), 'utf8'));
  const r = await b.eval('JSON.stringify(bulk([' + JSON.stringify(lvl) + '],' + (+n) + ',[[' + JSON.stringify(skill) + ',' + SK[skill][0] + ',' + SK[skill][1] + ']]))', { timeout: 590000 });
  const o = JSON.parse(r);
  Object.keys(o).forEach(k => console.log(k + ' (' + www.replace(root, '.') + ', n=' + n + '): ' + o[k]));
} finally { await b.close(); }
process.exit(0);
