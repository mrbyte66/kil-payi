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

./build.sh
if grep -q '__kp' www/index.html; then echo "HATA: yayın derlemesinde test kancası var"; exit 1; fi
npx cap sync android > /dev/null
(cd android && ./gradlew assembleDebug -q)

mkdir -p dist
OUT="dist/kil-payi-v${VER}.apk"
cp android/app/build/outputs/apk/debug/app-debug.apk "$OUT"
if unzip -p "$OUT" assets/public/index.html | grep -q '__kp'; then echo "HATA: APK içinde test kancası var"; rm -f "$OUT"; exit 1; fi
echo "$OUT hazır ($(du -h "$OUT" | cut -f1 | tr -d ' '), md5 $(md5 -q "$OUT"))"
