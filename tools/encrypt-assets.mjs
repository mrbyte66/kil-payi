/* Oyun dosyalarını APK içinde şifreler (V0.10.1): node tools/encrypt-assets.mjs [assets klasörü]   |   node tools/encrypt-assets.mjs --selftest
   Neden: kapalı testte bir arkadaş "index öylece duruyor, şifrele" dedi: APK'yı zip olarak açınca assets/public/index.html okunabiliyordu (JS karıştırılmış olsa da HTML, CSS ve dosyanın kendisi ortadaydı).
   Ne yapar (npx cap sync'ten SONRA, gradle'dan ÖNCE çalışır; tools/release.sh ve release-aab.sh böyle çağırır):
     - android/app/src/main/assets/public altındaki her dosyayı AES-256-GCM ile şifreler: <dosya>.kpe = 12 bayt IV + şifreli veri + 16 bayt etiket; dosya yolu (örn. "fonts/fonts.css") ek doğrulama verisidir.
       Düz dosyaları siler (cordova.js ve cordova_plugins.js boş yer tutuculardır, kalır); index.html yerine küçük bir yedek sayfa bırakır (sürüm işareti <!--kp:Vx.y.z--> içinde).
     - Anahtar K rastgele üretilir. APK'ya K konmaz: A = K XOR SHA256(capacitor.config.json + capacitor.plugins.json + "kp-key-v1") hesaplanıp android/app/kp-key.properties dosyasına (depoya girmez) yazılır;
       build.gradle bunu BuildConfig.KP_A yapar, uygulama (SecureAssets.java) çalışırken aynı özeti alıp K'yı bulur. Ayar dosyaları değiştirilirse anahtar tutmaz.
   Şifreyi uygulama çalışırken bellekte açar (WebView'e düz hâli yalnızca bellekten gider). Geliştirme derlemelerinde bu araç çalıştırılmaz: KP_A boş kalır, düz dosyalar sunulur.
   Not: hiçbir şifreleme, uygulamanın içine anahtar koyan bir oyunu tamamen koruyamaz; amaç "zip'i aç, dosyayı oku/değiştir" yolunu kapatıp saldırganı Java koduna (R8 ile karıştırılmış) yöneltmektir. */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['cordova.js', 'cordova_plugins.js']);
const SALT = 'kp-key-v1';

const walk = (dir, base = dir, out = []) => {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, base, out); else out.push(relative(base, p).split(sep).join('/'));
  }
  return out;
};
const mask = assets => createHash('sha256')
  .update(readFileSync(join(assets, 'capacitor.config.json')))
  .update(readFileSync(join(assets, 'capacitor.plugins.json')))
  .update(SALT).digest();
const xor = (a, b) => Buffer.from(a.map((v, i) => v ^ b[i]));

export const encryptDir = (assets, propsFile) => {
  const pub = join(assets, 'public');
  if (!existsSync(pub)) throw new Error('assets/public yok: önce npx cap sync android');
  const files = walk(pub).filter(f => !SKIP.has(f));
  if (files.some(f => f.endsWith('.kpe'))) throw new Error('assets/public zaten şifreli: önce klasörü silip cap sync yap');
  if (!files.includes('index.html')) throw new Error('assets/public/index.html yok');
  const K = randomBytes(32);
  let total = 0;
  for (const rel of files) {
    const plain = readFileSync(join(pub, rel));
    const iv = randomBytes(12);
    const c = createCipheriv('aes-256-gcm', K, iv, { authTagLength: 16 });
    c.setAAD(Buffer.from(rel, 'utf8'));
    const ct = Buffer.concat([c.update(plain), c.final()]);
    writeFileSync(join(pub, rel + '.kpe'), Buffer.concat([iv, ct, c.getAuthTag()]));
    if (rel === 'index.html') {
      const mark = (/<!--kp:V[^>]*-->/.exec(plain.toString('utf8')) || [''])[0];
      /* yedek sayfa: normalde HİÇ gösterilmez (şifre çözen istemci gerçek sayfayı verir); açılamazsa 25 yeniden denemeden sonra boş mor ekran yerine kısa bir açıklama gösterir */
      const msg = "var tr=((navigator.language||'').slice(0,2)==='tr');document.body.innerHTML='<p style=\"font:16px sans-serif;color:#fff;text-align:center;margin:40vh 24px 0\">'+(tr?'Oyun açılamadı. Lütfen uygulamayı Google Play\\'den yeniden yükle.':'The game could not start. Please reinstall the app from Google Play.')+'</p>'";
      writeFileSync(join(pub, rel), '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;background:#6D58E0">' + mark +
        '<script>var n=+(sessionStorage.getItem("kpr")||0);if(n<25){sessionStorage.setItem("kpr",n+1);setTimeout(function(){location.reload()},150)}else{' + msg + '}</script></body>');
    } else rmSync(join(pub, rel));
    total += plain.length;
  }
  const A = xor(K, mask(assets));
  writeFileSync(propsFile, '# otomatik üretilir (tools/encrypt-assets.mjs); depoya girmez\na=' + A.toString('hex') + '\n');
  return { files: files.length, bytes: total };
};

/* düğüm tarafında çözme (yalnızca test için): uygulamadaki SecureAssets ile aynı işlem */
export const decryptFile = (assets, propsFile, rel) => {
  const A = Buffer.from(/^a=([0-9a-f]{64})$/m.exec(readFileSync(propsFile, 'utf8'))[1], 'hex');
  const K = xor(A, mask(assets));
  const blob = readFileSync(join(assets, 'public', rel + '.kpe'));
  const d = createDecipheriv('aes-256-gcm', K, blob.subarray(0, 12), { authTagLength: 16 });
  d.setAAD(Buffer.from(rel, 'utf8'));
  d.setAuthTag(blob.subarray(blob.length - 16));
  return Buffer.concat([d.update(blob.subarray(12, blob.length - 16)), d.final()]);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === '--selftest') {
    const t = mkdtempSync(join(tmpdir(), 'kp-enc-')); let bad = 0;
    const T = (n, c) => { if (!c) { bad++; console.log('HATA ' + n); } else console.log('ok   ' + n); };
    mkdirSync(join(t, 'public', 'fonts'), { recursive: true });
    const idx = Buffer.from('<!--kp:V9.9.9--><script>var x="ğüşİ ünicode ★";</script>' + 'x'.repeat(5000));
    const bin = randomBytes(3000);
    writeFileSync(join(t, 'capacitor.config.json'), '{"appId":"a"}'); writeFileSync(join(t, 'capacitor.plugins.json'), '[]');
    writeFileSync(join(t, 'public', 'index.html'), idx); writeFileSync(join(t, 'public', 'fonts', 'a.woff2'), bin);
    writeFileSync(join(t, 'public', 'cordova.js'), '');
    const props = join(t, 'kp-key.properties');
    const r = encryptDir(t, props);
    T('iki dosya şifrelendi', r.files === 2);
    T('düz yazı tipi silindi, şifreli var', !existsSync(join(t, 'public', 'fonts', 'a.woff2')) && existsSync(join(t, 'public', 'fonts', 'a.woff2.kpe')));
    T('index yedek sayfası sürüm işaretini taşır ve içerik gizli', /<!--kp:V9.9.9-->/.test(readFileSync(join(t, 'public', 'index.html'), 'utf8')) && !readFileSync(join(t, 'public', 'index.html'), 'utf8').includes('ünicode'));
    T('şifreli dosya düz metin içermez', !readFileSync(join(t, 'public', 'index.html.kpe')).includes('ünicode') && !readFileSync(join(t, 'public', 'index.html.kpe')).includes('xxxxxxxxxx'));
    T('index çözülünce aynı', decryptFile(t, props, 'index.html').equals(idx));
    T('yazı tipi çözülünce aynı', decryptFile(t, props, 'fonts/a.woff2').equals(bin));
    T('anahtar özelliği 64 hex ve düz anahtar değil', /^a=[0-9a-f]{64}$/m.test(readFileSync(props, 'utf8')));
    // kurcalama: bir bayt değişirse etiket tutmaz
    const kp = join(t, 'public', 'index.html.kpe'); const b = readFileSync(kp); b[100] ^= 1; writeFileSync(kp, b);
    let thr = false; try { decryptFile(t, props, 'index.html'); } catch (e) { thr = true; }
    T('şifreli dosyada tek bayt değişince çözme başarısız', thr);
    b[100] ^= 1; writeFileSync(kp, b);
    T('geri alınca yine çözülür', decryptFile(t, props, 'index.html').equals(idx));
    // ayar dosyası değişirse anahtar tutmaz
    writeFileSync(join(t, 'capacitor.config.json'), '{"appId":"b"}');
    thr = false; try { decryptFile(t, props, 'index.html'); } catch (e) { thr = true; }
    T('capacitor.config.json değişince çözme başarısız', thr);
    writeFileSync(join(t, 'capacitor.config.json'), '{"appId":"a"}');
    // dosya yolu ek veri: başka dosyanın yerine konamaz
    writeFileSync(join(t, 'public', 'fonts', 'b.woff2.kpe'), readFileSync(join(t, 'public', 'fonts', 'a.woff2.kpe')));
    thr = false; try { decryptFile(t, props, 'fonts/b.woff2'); } catch (e) { thr = true; }
    T('şifreli dosya başka adla kullanılamaz', thr);
    let again = false; try { encryptDir(t, props); } catch (e) { again = true; }
    T('zaten şifreli klasör yeniden şifrelenmez', again);
    rmSync(t, { recursive: true, force: true });
    console.log(bad ? 'ŞİFRELEME TESTİ BAŞARISIZ' : 'şifreleme testi tamam'); process.exit(bad ? 1 : 0);
  }
  const assets = process.argv[2] || join(root, 'android/app/src/main/assets');
  const r = encryptDir(assets, join(assets, '..', '..', '..', 'kp-key.properties'));
  console.log('şifrelendi: ' + r.files + ' dosya, ' + (r.bytes / 1024).toFixed(0) + ' KB (assets/public/**.kpe, AES-256-GCM)');
}
