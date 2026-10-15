#!/bin/sh
# src/game.html (artifact parçası) -> www/index.html (tam belge, Capacitor bunu paketler).
# Web sürümü fontları Google Fonts'tan çeker; www sürümü src/fonts içindeki yerel dosyaları kullanır.
# DEBUG=1 ./build.sh  -> test kancası (window.__kp) eklenir ve duraklatma kapatılır; yayın sürümünde eklenmez.
set -e
cd "$(dirname "$0")"
mkdir -p www

HEAD='<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:var(--safe-area-inset-top,env(safe-area-inset-top,0px));padding-bottom:var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px))}body{margin:0}[hidden]{display:none!important}</style>'
FONTS_LOCAL='<link rel="stylesheet" href="fonts/fonts.css">'

{
  printf '%s\n' "$HEAD"
  if [ "${DEBUG:-0}" = "1" ]; then
    sed -e 's#/\*DEBUG\*/#window.__kp={G:G,CFG:CFG,save:save,view:view,tap:tap,start:start,die:die,hit:hit,miss:miss,showOver:showOver};#' \
        -e 's#/\*NOPAUSE\*/# || true#' \
        -e '/<!--FONTS-START-->/,/<!--FONTS-END-->/c\
'"$FONTS_LOCAL" src/game.html
  else
    sed -e '/<!--FONTS-START-->/,/<!--FONTS-END-->/c\
'"$FONTS_LOCAL" src/game.html
  fi
  printf '%s\n' '</body></html>'
} > www/index.html

rm -rf www/fonts
if [ -d src/fonts ]; then
  mkdir -p www/fonts
  cp src/fonts/*.woff2 src/fonts/fonts.css www/fonts/
fi
echo "www/index.html hazır ($(wc -c < www/index.html | tr -d ' ') bayt)"
