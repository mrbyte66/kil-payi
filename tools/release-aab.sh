#!/bin/sh
# Play Store için İMZALI yayın paketi (AAB): ./tools/release-aab.sh  ->  dist/kil-payi-v<sürüm>.aab
# Play, APK değil AAB ister. Yükleme anahtarı depo DIŞINDADIR: ../KilPayi-keys/ (upload-keystore.jks + keystore.properties); kullanıcı yedekler, depoya GİRMEZ.
# Sürüm adı android/app/build.gradle içindeki versionName'dir; her Play yüklemesinde versionCode artmalıdır.
# Play Uygulama İmzalama açıktır: Google asıl imza anahtarını tutar, biz yükleme anahtarıyla imzalarız.
set -e
cd "$(dirname "$0")/.."
export JAVA_HOME="${JAVA_HOME:-$(/usr/libexec/java_home)}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"

KS="../KilPayi-keys/keystore.properties"
[ -f "$KS" ] || { echo "HATA: yükleme anahtarı yok ($KS)"; exit 1; }
VER=$(sed -n 's/.*versionName "\(.*\)".*/\1/p' android/app/build.gradle | head -1)
CODE=$(sed -n 's/.*versionCode \([0-9]*\).*/\1/p' android/app/build.gradle | head -1)
[ -n "$VER" ] || { echo "versionName bulunamadı"; exit 1; }
GAME_VER=$(sed -n "s/.*const VERSION = 'V\\(.*\\)';.*/\\1/p" src/game.html | head -1)
[ "$GAME_VER" = "$VER" ] || { echo "HATA: src/game.html içindeki VERSION (V$GAME_VER) ile build.gradle versionName ($VER) aynı olmalı"; exit 1; }

node tools/check-strings.mjs
./build.sh
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
(cd android && ./gradlew bundleRelease -q)

mkdir -p dist
OUT="dist/kil-payi-v${VER}.aab"
cp android/app/build/outputs/bundle/release/app-release.aab "$OUT"
if unzip -p "$OUT" base/assets/public/index.html | grep -q '__kp'; then echo "HATA: AAB içinde test kancası var"; rm -f "$OUT"; exit 1; fi
if unzip -l "$OUT" | grep -qE 'base/assets/public/(fonts/[a-z0-9-]+\.(woff2|css))$'; then echo "HATA: AAB içinde düz (şifresiz) oyun dosyası var"; rm -f "$OUT"; exit 1; fi
if unzip -p "$OUT" base/assets/public/index.html.kpe | grep -aq 'kilpayi.v1'; then echo "HATA: AAB içindeki oyun dosyası şifreli görünmüyor"; rm -f "$OUT"; exit 1; fi
SIG=$("$JAVA_HOME/bin/jarsigner" -verify "$OUT" 2>&1 | grep -m1 "verified")   # kendi imzalı (yükleme anahtarı) olduğu için "sertifika zinciri geçersiz" uyarısı beklenir, sorun değil
case "$SIG" in *verified*) ;; *) echo "HATA: AAB imzası doğrulanamadı: $SIG"; rm -f "$OUT"; exit 1;; esac
FP=$("$JAVA_HOME/bin/keytool" -printcert -jarfile "$OUT" 2>/dev/null | sed -n 's/.*SHA256: *//p' | head -1)
echo "$OUT hazır ($(du -h "$OUT" | cut -f1 | tr -d ' '), sürüm $VER, versionCode $CODE, imza $SIG, SHA-256 $FP)"
