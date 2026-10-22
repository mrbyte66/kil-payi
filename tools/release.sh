#!/bin/sh
# Sürüm APK'sını üretir: ./tools/release.sh
# Sürüm adı android/app/build.gradle içindeki versionName'dir; çıktı dist/kil-payi-v<sürüm>.apk olur.
# Test kancası (window.__kp) yayın derlemesine girmemeli; hem www/ hem APK içi kontrol edilir.
# Bu APK debug anahtarıyla imzalıdır (telefona kurmak içindir). Play Store için imzalı AAB ayrıca yapılacak.
set -e
cd "$(dirname "$0")/.."
export JAVA_HOME="${JAVA_HOME:-$(/usr/libexec/java_home)}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"

VER=$(sed -n 's/.*versionName "\(.*\)".*/\1/p' android/app/build.gradle | head -1)
[ -n "$VER" ] || { echo "versionName bulunamadı"; exit 1; }

GAME_VER=$(sed -n "s/.*const VERSION = 'V\\(.*\\)';.*/\\1/p" src/game.html | head -1)
[ "$GAME_VER" = "$VER" ] || { echo "HATA: src/game.html içindeki VERSION (V$GAME_VER) ile build.gradle versionName ($VER) aynı olmalı"; exit 1; }

node tools/check-strings.mjs
./build.sh
# Test yardımcıları (bot.js, kp-*.js, index-en.html vb.) www/ içinde unutulmuş olabilir; yayına yalnızca index.html ve fonts/ girer.
find www -mindepth 1 -maxdepth 1 ! -name index.html ! -name fonts -exec rm -rf {} +
if grep -q '__kp' www/index.html; then echo "HATA: yayın derlemesinde test kancası var"; exit 1; fi
# V0.10.0: oyun kodu karıştırılır (okunmaz hâle gelir) ve duman testinden geçirilir; kancayı yukarıda, karıştırmadan ÖNCE denetledik (sonra metinler kodlanmış olur).
node tools/protect.mjs www/index.html
node tools/smoke-release.mjs
if grep -q 'Not your job' www/index.html; then echo "HATA: karıştırma çalışmadı (oyun metinleri düz görünüyor)"; exit 1; fi
# V0.10.1: oyun dosyaları APK/AAB içinde AES-256-GCM ile şifrelenir (eski şifreli/düz dosyalar kalmasın diye klasör önce silinir)
rm -rf android/app/src/main/assets/public
npx cap sync android > /dev/null
node tools/encrypt-assets.mjs --selftest > /dev/null
node tools/encrypt-assets.mjs
(cd android && ./gradlew assembleDebug -q)

mkdir -p dist
OUT="dist/kil-payi-v${VER}.apk"
cp android/app/build/outputs/apk/debug/app-debug.apk "$OUT"
if unzip -p "$OUT" assets/public/index.html | grep -q '__kp'; then echo "HATA: APK içinde test kancası var"; rm -f "$OUT"; exit 1; fi
if unzip -l "$OUT" | grep -qE 'assets/public/(fonts/[a-z0-9-]+\.(woff2|css))$'; then echo "HATA: APK içinde düz (şifresiz) oyun dosyası var"; rm -f "$OUT"; exit 1; fi
if unzip -p "$OUT" assets/public/index.html.kpe | grep -aq 'kilpayi.v1'; then echo "HATA: APK içindeki oyun dosyası şifreli görünmüyor"; rm -f "$OUT"; exit 1; fi
echo "$OUT hazır ($(du -h "$OUT" | cut -f1 | tr -d ' '), md5 $(md5 -q "$OUT"))"

# V0.10.1: BAŞKASINA verilecek "güçlü" APK: R8'li (Java kodu karıştırılmış), hata ayıklamaya kapalı, yükleme anahtarıyla imzalı. Deneme APK'sı (yukarıdaki) hata ayıklamaya açıktır ve R8'sizdir; yalnızca kendi telefonunda dene.
if [ -f "../KilPayi-keys/keystore.properties" ]; then
  (cd android && ./gradlew assembleRelease -q)
  ROUT="dist/kil-payi-v${VER}-release.apk"
  cp android/app/build/outputs/apk/release/app-release.apk "$ROUT"
  if unzip -l "$ROUT" | grep -qE 'assets/public/(fonts/[a-z0-9-]+\.(woff2|css))$'; then echo "HATA: güçlü APK içinde düz oyun dosyası var"; rm -f "$ROUT"; exit 1; fi
  if "$ANDROID_HOME/build-tools/35.0.1/aapt2" dump badging "$ROUT" 2>/dev/null | grep -q application-debuggable; then echo "HATA: güçlü APK hata ayıklamaya açık"; rm -f "$ROUT"; exit 1; fi
  echo "$ROUT hazır ($(du -h "$ROUT" | cut -f1 | tr -d ' '), md5 $(md5 -q "$ROUT"))"
fi
