#!/bin/sh
# Sürüm APK'sını üretir: ./tools/release.sh
# Sürüm adı android/app/build.gradle içindeki versionName'dir; çıktı dist/kil-payi-v<sürüm>.apk olur.
# Test kancası (window.__kp) yayın derlemesine girmemeli; hem www/ hem APK içi kontrol edilir.
# Yalnız imzalı, R8 etkin release APK üretir. Debug anahtarına geri dönüş yoktur.
set -e
cd "$(dirname "$0")/.."
if [ -z "${JAVA_HOME:-}" ]; then
  if [ -x /usr/libexec/java_home ]; then JAVA_HOME=$(/usr/libexec/java_home)
  else JAVA_HOME=$(dirname "$(dirname "$(readlink -f "$(command -v java)")")"); fi
fi
export JAVA_HOME
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"

KS="${KP_KEYSTORE_PROPERTIES:-../KilPayi-keys/keystore.properties}"
[ -f "$KS" ] || { echo "HATA: release imza dosyası eksik; KP_KEYSTORE_PROPERTIES ayarla"; exit 1; }
BT="${ANDROID_BUILD_TOOLS:-$ANDROID_HOME/build-tools/35.0.1}"
[ -x "$BT/apksigner" ] && [ -x "$BT/aapt2" ] || { echo "HATA: Android build-tools 35.0.1 gerekli"; exit 1; }

VER=$(sed -n 's/.*versionName "\(.*\)".*/\1/p' android/app/build.gradle | head -1)
[ -n "$VER" ] || { echo "versionName bulunamadı"; exit 1; }

GAME_VER=$(sed -n "s/.*const VERSION = 'V\\(.*\\)';.*/\\1/p" src/game.html | head -1)
[ "$GAME_VER" = "$VER" ] || { echo "HATA: src/game.html içindeki VERSION (V$GAME_VER) ile build.gradle versionName ($VER) aynı olmalı"; exit 1; }

node tools/check-strings.mjs
./build.sh
# Test yardımcıları (bot.js, kp-*.js, index-en.html vb.) www/ içinde unutulmuş olabilir; yayına yalnızca index.html ve fonts/ girer.
find www -mindepth 1 -maxdepth 1 ! -name index.html ! -name fonts -exec rm -rf {} +
if grep -q '__kp' www/index.html; then echo "HATA: yayın derlemesinde test kancası var"; exit 1; fi
grep -q 'const DEMO_ADS = false' www/index.html || { echo "HATA: yayın derlemesinde sahte reklam yolu açık (DEMO_ADS)"; exit 1; }
# V0.10.0: oyun kodu karıştırılır (okunmaz hâle gelir) ve duman testinden geçirilir; kancayı yukarıda, karıştırmadan ÖNCE denetledik (sonra metinler kodlanmış olur).
node tools/protect.mjs www/index.html
node tools/smoke-release.mjs
if grep -q 'Not your job' www/index.html; then echo "HATA: karıştırma çalışmadı (oyun metinleri düz görünüyor)"; exit 1; fi
# V0.10.1: oyun dosyaları APK/AAB içinde AES-256-GCM ile şifrelenir (eski şifreli/düz dosyalar kalmasın diye klasör önce silinir)
rm -rf android/app/src/main/assets/public
npx cap sync android > /dev/null
node tools/encrypt-assets.mjs --selftest > /dev/null
node tools/encrypt-assets.mjs
(cd android && ./gradlew assembleRelease -q)
mkdir -p dist
OUT="dist/kil-payi-v${VER}-release.apk"
CANDIDATE="android/app/build/outputs/apk/release/app-release.apk"
[ -f "$CANDIDATE" ] || { echo "HATA: imzalı release APK üretilmedi"; exit 1; }
"$BT/apksigner" verify --verbose "$CANDIDATE"
BADGING=$("$BT/aapt2" dump badging "$CANDIDATE")
if printf '%s' "$BADGING" | grep -q application-debuggable; then echo "HATA: release hata ayıklamaya açık"; exit 1; fi
printf '%s' "$BADGING" | grep -F "versionName='$VER'" >/dev/null || { echo "HATA: APK sürümü uyuşmuyor"; exit 1; }
if unzip -p "$CANDIDATE" assets/public/index.html | grep -q '__kp'; then echo "HATA: APK içinde test kancası var"; exit 1; fi
if unzip -l "$CANDIDATE" | grep -qE 'assets/public/(fonts/[a-z0-9-]+\.(woff2|css))$'; then echo "HATA: APK içinde düz oyun dosyası var"; exit 1; fi
unzip -p "$CANDIDATE" assets/public/index.html.kpe >/dev/null || { echo "HATA: şifreli oyun eksik"; exit 1; }
cp "$CANDIDATE" "$OUT"
if command -v sha256sum >/dev/null 2>&1; then sha256sum "$OUT" > "$OUT.sha256"
else shasum -a 256 "$OUT" > "$OUT.sha256"; fi
echo "$OUT hazır"
