#!/bin/sh
# src/game.html (HTML parçası) -> www/index.html (tam belge, Capacitor bunu paketler).
# src/game.html Google Fonts bağlantısı içerir; www sürümü src/fonts içindeki yerel dosyaları kullanır.
# DEBUG=1 ./build.sh  -> test kancası (window.__kp) eklenir ve duraklatma kapatılır; yayın sürümünde eklenmez.
# DEBUG=2 ./build.sh  -> test kancası var, duraklatma ve ilk görüş tanıtımları açık (ana ekran, ekran kilidi, geri tuşu denemeleri için).
# DEBUG=1'de tanıtımlar kapalıdır (bot ve mantık testleri kesilmesin); kancadaki introNow(tür) ile elle başlatılır.
set -e
cd "$(dirname "$0")"
mkdir -p www

HEAD='<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:var(--safe-area-inset-top,env(safe-area-inset-top,0px));padding-bottom:var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px))}body{margin:0}[hidden]{display:none!important}</style>'
FONTS_LOCAL='<link rel="stylesheet" href="fonts/fonts.css">'

{
  printf '%s\n' "$HEAD"
  if [ "${DEBUG:-0}" != "0" ]; then
    if [ "$DEBUG" = "2" ]; then NOPAUSE='s#/\*NOPAUSE\*/##'; NOINTRO='s#/\*NOINTRO\*/##'; else NOPAUSE='s#/\*NOPAUSE\*/# || true#'; NOINTRO='s#/\*NOINTRO\*/# false \&\&#'; fi
    sed -e 's#/\*DEBUG\*/#window.__kp={G:G,CFG:CFG,save:save,view:view,tap:tap,start:start,die:die,hit:hit,miss:miss,showOver:showOver,spawn:spawnChallenge,useTool:useTool,pinCenter:pinCenter,KIND:KIND,LEVEL:LEVEL,comboMult:comboMult,LV:LV,bestNow:bestNow,setLevel:setLevel,scold:scold,cheer:cheer,pickLine:pickLine,tierCol:tierCol,trap:trap,pinHw:pinHw,JOURNEY:JOURNEY,JEVENTS:JEVENTS,jPhaseAt:jPhaseAt,jStart:jStart,fireEvent:fireEvent,applyEvents:applyEvents,resume:resume,pause:pause,th:function(){return[thWx]},jump:function(x){G.jt=x},update:update,render:render,phaseMod:phaseMod,hellK:hellK,resumeSaved:resumeSaved,persistRun:persistRun,adviceFor:adviceFor,updateAdvice:updateAdvice,lethal:lethal,grantLife:grantLife,jLen:jLen,TOOL:TOOL,DIFF:DIFF,openBook:openBook,release:release,isReq:isReq,etaTo:etaTo,holdRel:holdRel,sdiff:sdiff,MECH:MECH,JKIND:JKIND,JTWIN:JTWIN,IMPL_GOOD:IMPL_GOOD,IMPL_TWIN:IMPL_TWIN,GOOD_OF:GOOD_OF,STAR_KINDS:STAR_KINDS,ghostAlpha:ghostAlpha,tideF:tideF,ptrFactor:ptrFactor,addTwin:addTwin,unlockRing:unlockRing,blast:blast,lockRattle:lockRattle,primaryPin:primaryPin,BOOK:BOOK,aheadOf:aheadOf,advance:advance,updateChal:updateChal,STR:STR,fitPx:fitPx,wideAt:wideAt,WIDE_TAB:WIDE_TAB,tierPh:tierPh,startPractice:startPractice,endPractice:endPractice,practiceStep:practiceStep,renderBook:renderBook,runState:runState,PRAC:PRAC,PRAC_TWIN:PRAC_TWIN,bookSeen:bookSeen,hellK:hellK,hellTier:hellTier,fonts:function(){return[FD,FB]},INTRO:INTRO,introNow:introNow,startIntro:startIntro,closeIntro:closeIntro,skipIntro:skipIntro,abortIntro:abortIntro,introWanted:introWanted,queueIntro:queueIntro,demoFrame:demoFrame,drawDemoBar:drawDemoBar,IN:{LEAD:IN_LEAD,SPEED:IN_SPEED,HOLD:IN_HOLD,BACK:IN_BACK,SKIP:IN_SKIP,TAIL:IN_TAIL},runCoins:runCoins,celebrateRecord:celebrateRecord,contCost:contCost,spawnConf:spawnConf,setCd:setCd,doContinue:doContinue,contLeft:function(){return contLeft},setContLeft:function(v){contLeft=v},paintBest:paintBest,drawTimeVessel:drawTimeVessel,updateHud:updateHud,openShop:openShop,closeShop:closeShop,storeBack:storeBack,shopGo:shopGo,itemSheet:itemSheet,chooser:chooser,renderHub:renderHub,fitStore:fitStore,SS:SS,openSettings:openSettings,closeSettings:closeSettings,renderSettings:renderSettings,equipped:equipped,unitPrice:unitPrice,stockPrice:stockPrice,upPrice:upPrice,giftState:giftState,giftClaim:giftClaim,buyStock:buyStock,buyUpgrade:buyUpgrade,unlockJoker:unlockJoker,buySlot:buySlot,buyAuto:buyAuto,setEquip:setEquip,isEq:isEq,nextGoal:nextGoal,updateTools:updateTools,refreshStats:refreshStats,persist:persist,STOCK_MAX:STOCK_MAX,JK_PRICE:JK_PRICE,SLOT_PRICE:SLOT_PRICE,AUTO_PRICE:AUTO_PRICE,GIFT_STEP:GIFT_STEP,GIFT_WAIT:GIFT_WAIT,giftTool:giftTool};#' \
        -e "$NOPAUSE" \
        -e "$NOINTRO" \
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
