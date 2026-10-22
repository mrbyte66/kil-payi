#!/bin/sh
# Sürümü iki dala yayınlar: android (tam Android projesi, çalışma dalı) ve html (yalnızca HTML oyunu).
# Kullanım: ./tools/release.sh ile APK üretildikten, commit'lenip etiketlendikten sonra:  ./tools/publish.sh
#  - android: bu dal etiketleriyle birlikte push'lanır.
#  - html: android'in son halinden Android dosyaları çıkarılır (README yerine tools/branches/README.html.md konur) ve aynı commit mesajıyla bir commit eklenip push'lanır.
#    html dalı elle düzenlenmez, her zaman android'den üretilir.
# Kullanıcı kararı: android ve html dalları main'e birleştirilmez, hep ayrı gider; main olduğu gibi kalır.
set -e
cd "$(dirname "$0")/.."

BR=$(git rev-parse --abbrev-ref HEAD)
[ "$BR" = "android" ] || { echo "HATA: android dalında olmalısın (şu an: $BR)"; exit 1; }
[ -z "$(git status --porcelain)" ] || { echo "HATA: commit edilmemiş değişiklik var, önce commit'le:"; git status --short; exit 1; }

# Depodaki paketlenmiş oyun, sürümle uyumlu ve test kancasız olmalı
ASSET=android/app/src/main/assets/public/index.html
VER=$(sed -n 's/.*versionName "\(.*\)".*/\1/p' android/app/build.gradle | head -1)
git cat-file -e "HEAD:$ASSET" 2>/dev/null || { echo "HATA: $ASSET depoda yok; ./tools/release.sh çalıştırıp commit'le"; exit 1; }
if git show "HEAD:$ASSET" | grep -q '__kp'; then echo "HATA: depodaki paketlenmiş oyunda test kancası var"; exit 1; fi
git show "HEAD:$ASSET" | grep -qE "const VERSION = 'V$VER'|<!--kp:V$VER-->" || { echo "HATA: $ASSET sürümü ($VER) ile uyuşmuyor; ./tools/release.sh çalıştırıp commit'le"; exit 1; }

# html ağacı: android'in HEAD ağacından Android dosyalarını çıkar, README'yi HTML sürümüyle değiştir
EXCL="android capacitor.config.ts package.json package-lock.json tools/release.sh tools/publish.sh tools/branches CLAUDE.md"
IDX="$(mktemp -d)/index"
GIT_INDEX_FILE="$IDX" git read-tree HEAD
for p in $EXCL; do GIT_INDEX_FILE="$IDX" git rm -r -q -f --cached --ignore-unmatch "$p"; done
RB=$(git rev-parse "HEAD:tools/branches/README.html.md")
GIT_INDEX_FILE="$IDX" git update-index --add --cacheinfo "100644,$RB,README.md"
TREE=$(GIT_INDEX_FILE="$IDX" git write-tree)
rm -rf "$(dirname "$IDX")"

git fetch -q origin html 2>/dev/null || true
if git show-ref -q --verify refs/heads/html; then PARENT=$(git rev-parse refs/heads/html)
elif git show-ref -q --verify refs/remotes/origin/html; then PARENT=$(git rev-parse refs/remotes/origin/html)
else PARENT=$(git rev-parse main); fi
if [ "$(git rev-parse "$PARENT^{tree}")" = "$TREE" ]; then
  echo "html: değişiklik yok"
else
  MSG="$(mktemp)"; git log -1 --format=%B HEAD > "$MSG"
  C=$(git commit-tree "$TREE" -p "$PARENT" -F "$MSG"); rm -f "$MSG"
  git update-ref refs/heads/html "$C"
  echo "html: yeni commit $(git rev-parse --short "$C")"
fi

git push -u origin android --tags
git push -u origin html
echo "Hazır: android ve html dalları GitHub'a gönderildi (main'e dokunulmadı)."
