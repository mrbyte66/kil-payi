/* Yayın derlemesinde oyun kodunu okunmaz ve değiştirilmesi zor hâle getirir (V0.10.0): node tools/protect.mjs www/index.html
   Neden: kapalı test sırasında bir testçi Play'den indirdiği APK'nın içindeki düz JavaScript'i okuyup jokerleri ekledi ve oyunu değiştirdi.
   Ne yapar: www/index.html içindeki (tek) satır içi betiği alır, sırayla
     1) terser: yorumları ve boşlukları siler, yerel adları kısaltır, ölü kodu atar (okunabilirliği bitirir; dosya küçülür, açılışta ayrıştırma hızlanır);
     2) javascript-obfuscator: metinleri (oyun yazıları, anahtar adları, renkler) kodlanmış tabloya taşır, adları karıştırır.
   Ağır seçenekler KAPALI (kontrol akışı düzleştirme, ölü kod ekleme, kendini koruma, hata ayıklayıcı tuzağı): kare hızını ve açılışı bozarlar; kullanıcı "kasma donma etkilenmesin" dedi.
   Hook (window.__kp) olan DEBUG derlemesine de uygulanabilir (PROTECT=1 DEBUG=1 ./build.sh): özellik adları değişmez, böylece tüm testler karıştırılmış kodla çalıştırılıp denklik doğrulanır.
   Not: HTML ve CSS (sınıf adları, kimlikler) okunur kalır; çevrimdışı tarayıcıda çalışan kod hiçbir zaman tamamen gizlenemez, amaç alışılmış kopyalamayı ve kolay hileyi zorlaştırmaktır.
   Seçenekler ortam değişkeniyle ayarlanabilir: OBF_LEVEL=hafif (yalnızca terser) | normal (varsayılan). */
import { readFileSync, writeFileSync } from 'node:fs';
import { minify } from 'terser';
import JavaScriptObfuscator from 'javascript-obfuscator';

const file = process.argv[2];
if (!file) { console.error('kullanım: node tools/protect.mjs www/index.html'); process.exit(1); }
const html = readFileSync(file, 'utf8');
const open = html.lastIndexOf('<script>'), close = html.lastIndexOf('</script>');
if (open < 0 || close < open) { console.error('HATA: satır içi betik bulunamadı'); process.exit(1); }
const src = html.slice(open + 8, close);
const level = process.env.OBF_LEVEL || 'normal';

const t = await minify(src, {
  ecma: 2020,
  compress: { passes: 2, drop_debugger: true },
  mangle: { toplevel: false },
  format: { comments: false, ascii_only: false }
});
if (t.error || !t.code) { console.error('HATA: terser başarısız', t.error); process.exit(1); }
let out = t.code;
if (level !== 'hafif') {
  out = JavaScriptObfuscator.obfuscate(t.code, {
    target: 'browser',
    compact: true,
    simplify: true,
    seed: 20261022,                                 // sabit tohum: aynı girdi → aynı çıktı (derleme tekrarlanabilir)
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,                           // betik zaten bir IIFE içinde; sayfa genelindeki adlara dokunma
    renameProperties: false,                        // özellik adları (G.score, localStorage anahtarları, window.__kp hook'u) değişmez
    stringArray: true,
    stringArrayThreshold: 0.85,
    stringArrayEncoding: ['base64'],
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersType: 'variable',
    stringArrayCallsTransform: false,
    splitStrings: false,
    transformObjectKeys: false,
    numbersToExpressions: false,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    selfDefending: false,
    debugProtection: false,
    disableConsoleOutput: false,
    unicodeEscapeSequence: false
  }).getObfuscatedCode();
}
// </script> dizisi betik içinde geçerse HTML'i bozar: kodlanmış metinlerde bölünür
out = out.replace(/<\/script/gi, '<\\/script');
// sürüm işareti: karıştırma sonrası `const VERSION = ...` düz görünmez; tools/publish.sh ve denetimler bu HTML yorumuna bakar
const ver = /const VERSION = '(V[^']+)'/.exec(src);
const mark = ver ? '<!--kp:' + ver[1] + '-->' : '';
writeFileSync(file, html.slice(0, open) + mark + html.slice(open, open + 8) + out + html.slice(close));
const kb = n => (n / 1024).toFixed(0) + ' KB';
console.log(`protect: betik ${kb(src.length)} → terser ${kb(t.code.length)} → ${level === 'hafif' ? 'yalnız terser' : 'karıştırılmış'} ${kb(out.length)}`);
