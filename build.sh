#!/bin/sh
# src/game.html (yayın parçası) -> www/index.html (tam belge).
# DEBUG=1 ./build.sh  -> test kancası (window.__kp) eklenir; yayın sürümünde eklenmez.
set -e
cd "$(dirname "$0")"
mkdir -p www
{
  printf '%s\n' '<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}</style>'
  if [ "${DEBUG:-0}" = "1" ]; then
    sed -e 's#/\*DEBUG\*/#window.__kp={G:G,CFG:CFG,save:save,view:view,tap:tap,start:start,die:die,hit:hit,miss:miss,showOver:showOver};#' \
        -e 's#/\*NOPAUSE\*/# || true#' src/game.html
  else
    cat src/game.html
  fi
  printf '%s\n' '</body></html>'
} > www/index.html
echo "www/index.html hazır ($(wc -c < www/index.html | tr -d ' ') bayt)"
