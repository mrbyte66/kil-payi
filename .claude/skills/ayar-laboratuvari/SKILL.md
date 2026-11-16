---
name: ayar-laboratuvari
description: Kıl payı oyununun Ayar Laboratuvarı (lab/lab.html) ile çalışma. Kullanıcı "laboratuvar", "ayar laboratuvarı", "labı aç", "laboratuvardaki ayarları al/oyuna aktar", "laboratuvara ekle", "fikir panosuna koy", zorluk/hız/genişlik/kilit ayarı, reklam-kanca analizi ya da yeni bir ayarı arayüzden yönetmek istediğinde kullan. Seçenek önerdiğin her konuyu da fikir panosuna yaz.
---

# Ayar Laboratuvarı

Kullanıcının (2026-11-12) kararı: oyunu her zaman buradan yöneteceğiz; laboratuvar, kullanıcıyla Claude'un "anlaşabilme arayüzü". Kullanıcı teknik değil, Türkçe konuşur; sonucu sade anlat.

## Ne

- Kaynak: `lab/lab.html` (sayfa), `lab/fikirler.json` (fikir panosu). Ayrı bir alt proje gibi düşün.
- `DEBUG=1 ./build.sh` bunları `www/lab.html`, `www/lab-fikirler.json`, `www/lab-bot.js` (= `tools/bot.js`) yapar; DEBUG'suz derleme siler (yayına girmez).
- Site düzeni (üstte sayfa sekmeleri, `S.ui.pg`): **Oyun fiziği** (hız, genişlik, c, kilit ayarları, sınırlar, hız dalgası, 5 bölüm tablosu), **Oyun tasarımı** (süre, pim sayısı, can ve hasar `dmg`, yenilenme, ikinci şans `cont`/`contAds`/`contL`, gizli yardım `helpAt`/`help`, yıldız `star`, altın `gold`/`goldG`, geri sayım `cd`), **Görünüm** (efektler), **Oyuncular** (oyuncu tipleri `S.PS`, davranış modeli ve nüfus `S.B`), **Analiz**, **Fikirler**, **Ayarlar**. Bağlam çubuğu: kilit adımı + 5 bölüm çipi. Telefon önizlemesi ilk dört sayfada; "Kim oynasın" 8 tipten biri, özel ms ya da "Ben oynayayım", "can bitmesin" anahtarı.
- **Bölüm kurgusu** sayfası (motor kancası `BL_OV[kimlik]`, `src/game.html`; yayında boş, "oyuna al" denince doldurulur): her bölümün Baş/Orta/Son kısmına parça ekle-çıkar (`ph[i].t`), parçanın gücü (`ph[i].lv[tür]` = hangi basamağın `BL_M` ayarı; `blMv` ve `blMechPh` kullanır), kısım hız/genişlik katı (`om`, `wd`), kısım sınırları `cut` (kısım içinde hızlanma `ramp` ve ani hız `imp` 2026-11-16'da KALKTI: hız artık `blOmAt` ile her vuruşta doğrusal; kısma özel `set.om` o kısmın taban hızı). `blPlan`, `blOmAt`, `blPhaseAt`, `blSpawn` bunu okur; kendi kilidi çıkarılırsa kısmın ilk kilidi ana kilit olur. Motoru olan parçalar lab'da `TAG_OK`, diğerleri "motoru henüz yok".
- Canlı: kaydırıcı ve kutu yazdıkça uygular (Enter yok; yazılan kartı yeniden çizmez). Her ayar önizlemede kendi etkisini gösterir (`runDemo`: gizli yardım o kayıp sayısıyla, ikinci şans ekranı, bölüm sonu yıldızları, kısımdan başlatma) ve telefonun üstüne açıklama yazar (`note`).
- Oyuncu tipleri: İdealist (0 ms, HİÇ hata yapmaz, `jitter/lapse/isinExtra` 0, `lead` 1/480, dt 1/240; nüfusta yok, üst sınır), Kusursuz 12, Pro 20, Usta 30, İyi 50, Orta 80, Acemi 100, Yeni başlayan 120 ms; her birinin nüfus payı, reklam eğilimi, sabrı ve zorluk ihtiyacı var. `tg` hedef kitle ağırlığı (varsayılan orta/iyi/usta 1, acemi 0,45, yeni 0,15, pro 0,7, kusursuz 0,4): `simLevel` `pop` = pay × tg (kanca, teşhis, ekranlar; `B.tgt` 0 kapatır), `all` = gerçek nüfus (gelir projeksiyonu, `groupPop`). Bağlı ayarlar `capd(def, () => [alt, üst], neden)`: kaydırıcı taralı bölgeye geçemez (toast ile eşitleme YOK). Kurgu sayfasında kısma özel değerler (`OVS`, `ovsDefs`, `ovEnsure`: dokununca bölüm kendiliğinden özel kurguya geçer). Oyun çerçevesi `index.html?lab&t=` ile önbelleksiz yüklenir.
- Anket sırası: 1 merdiven (Tek) → her kilit → son (efektler, yüzde). "Onayla, ileri" adımı işaretler.

## Açmak

1. `DEBUG=1 ./build.sh`
2. Tarayıcı paneli: `preview_start` adı `oyun` (python http.server 8791, `www`), sonra `http://localhost:8791/lab.html?v=N` (önbellek için N'i artır).
3. Kullanıcıya paneli göster; laboratuvar hep burada açık kalsın.

## Kullanıcının ayarlarını okumak ve oyuna aktarmak

- Ayarlar tarayıcıda: `localStorage['kp-lab']` → `{ P, KF, M, ok, step, ui }`. Panelden oku: `javascript_tool` ile `JSON.parse(localStorage.getItem('kp-lab'))`.
  - `P` = `BL_P` (om rad/sn ×5, wd derece ×5, size [[en az, en çok]]×5, t sn ×5, wMin, wMax, gap, lives, regen, cont, contAds, contL, help[2], helpAt[2], dmg[2], star[2], gold ×5, goldG, cd, phm[4] (başta, orta başında, son başında, bitişte; arası her vuruşta doğrusal), fx{sweep,pulse,shatter,drop}, pct, pctTheme)
  - `B` = davranış modeli ve nüfus, `PS` = oyuncu tipleri: yalnız laboratuvarda (oyuna aktarılmaz).
  - `KF` = kimlik → c (kilit katsayısı); oyunda `BL_KF[kimlik] = [dalga başına sn, c]`, yalnız c'yi değiştir.
  - `M` = `BL_M` (tür → anahtar → 5 değer), tanımlar `BL_MCAT` içinde.
  - `ui.hidden` / `ui.deleted` = kullanıcının gizlediği/sildiği ayar satırları; `ui.ih` / `ui.id` = gizlenen/silinen fikirler. Silinen satır kullanıcı "ilgilenmiyorum" demektir: bir daha önerme.
- "Ayarları oyuna al" denince: bu değerleri `src/game.html`'deki `BL_P`, `BL_KF` (c), `BL_MCAT[...].p[...].d` varsayılanlarına yaz. Bu varsayılanlar laboratuvarın "önerilen değerleri" olur (sayfa açılışta oyundan okur). Sonra: `DEBUG=1 ./build.sh`, `node tools/bl-run.mjs orta 20 <bölümler>` ile doğrula, değişiklikleri anlat.
- Merdiven (om/wd) büyük değişirse kilit katsayılarını yeniden ölç: `node tools/bl-model.mjs level 6 1-80` (`tools/bl-kf.json`; içindeki dalga/c'yi `BL_KF`'ye aktar). Düz pim eğrisi `bl-model.mjs curve`, Süreli karşılaştırması `bl-model.mjs sureli`.

## Yeni ayar eklemek

- Oyun tarafı: değer `BL_P` (genel) ya da `BL_MCAT` (kilide özel: `ad`, `u`, `min`, `max`, `st`, `d` 5 basamak; `mech: 1` ise `MECH` anahtarıdır, bölüm başında `blMechApply` yazar, Bölümler'den çıkınca `blMechRestore` geri alır: Süreli etkilenmez). Kodda `blMv(tür, anahtar)` ile oku.
- Laboratuvar tarafı: `lab/lab.html` içinde `lvDefs` / `limDefs` / `fxDefs` listesine bir tanım (`k`, `ad`, `u`, `min`, `max`, `st`, `get`, `set`); `BL_MCAT`'e eklenen kilit ayarı kendiliğinden görünür. Tutarlılık kuralı gerekiyorsa `normalize`'a ekle (ör. en dar ≤ en geniş, en az ≤ en çok).
- `build.sh` DEBUG kancasına yeni nesneyi ekle (`BL_P`, `BL_M`, `BL_MCAT`, `BL_KF`, `blWaves`, `blMechApply` zaten var).

## Fikir panosu (kaybolmasın)

- Kullanıcıya seçenek/alternatif önerdiğinde (ör. "4 farklı yüzde teması") ya da açık kalan bir konu doğduğunda `lab/fikirler.json`'a bir kayıt ekle: `{ "id", "t" başlık, "oz" tek satır özet, "d" ayrıntı, "g" çizim anahtarı (pct, sweep, duvar, formul, gelgit, kilit, cark, altin, misafir, kanca, takvim, egri, veri, acik; yeni çizim `PIC` içine), "pg" ilgili sayfa (fizik, tasarim, gorunum, oyuncu, ana), "durum": fikir | denemede | karar bekliyor | yapılacak | sonra | açık, "yer", "kim": kullanıcı | Claude | plan }`. Mümkünse seçeneği laboratuvarda denenebilir yap (`yer`).
- Kullanıcının gizlediği/sildiği fikirleri dosyadan silme; kullanıcı açıkça "dosyadan da sil" derse sil.
- Kendi vizyonunu da ekleyebilirsin ("kim": "Claude"), ama az ve öz.

## Analiz (reklam ve kanca)

- **Ölçüm (gerçek oyun kodu):** gizli `#meas` çerçevesinde her tip, tohumlu (`mulberry(hashS(n|tip|havuz|i))` → çerçevenin `Math.random`) ve SANAL CANLA oynar: ölmez, her hata `[dalga, büyük mü, sn]` olayıdır (`dmg` ölçümde [1, 2]'ye zorlanır). Üç yardım havuzu (f = 0, `helpAt[0]`, `helpAt[1]`; yardım genişletmiyorsa ya da temiz geçme > %90 ise öncekine eşlenir). Hassasiyet 12 / 30 / 80 koşu. Sonuç `localStorage['kp-lab-meas']`; fizik özeti (`physHash`) değişince "eski ölçüm" rozeti.
- **Yeniden oynatma (`replay`):** can, hasar, yenilenme, ikinci şans canı ve yıldız oyunun kurallarıyla (`blHurt`, `blWaveDone`, `blContinue`, `blWin`) hesaplanır: bu ayarlar yeniden ölçüm istemez.
- **Oturum modeli (`simLevel`, tohumlu Monte Carlo, tip başına 1500 sanal oyuncu):** yanınca reklam izleme p = σ(logit(adBase) + kProg·(ilerleme−0,5)·2 + kInv·ln((sn+5)/adLen) + kStreak·min(kayıp,4) − kFat·izlenen + tip.ad + adShift), dolum `fill`, izlemezse altınla `coinP`; kayıptan sonra bırakma q = σ(logit(quit) + kEarly·(0,5−ilerleme)·2 + kQS·kayıp − tip.pat), `maxAtt`; sıkılma ilk denemede ikinci şanssız geçende `need × (1 − hata oranı/boreMiss)`. Kanca puanı = 100 × küp kök(üç hedef puanı çarpımı) (reklam izleyen `tW0-tW1`, bırakan < `tQ`, sıkılan < `tB`). Projeksiyon: oyuncu × oturum × dk × Bölümler payı → reklam, gelir (eCPM), kaybedilen; 1k / kullanıcının değeri (5k) / 25k / 100k, `adShift ± sens` bandı.
- **Çan eğrisi** (`S.B.gauss`): zamanlama hatası log-normal (ortanca `skMu` ms, yayılım `skSd`), tip payı komşu sınırlar arası olasılık (`popW`); her sanal oyuncunun reklam eğilimi ve sabrı `sdAd`/`sdPat` ile normal dağılır. **Gerçeklik çapası**: teklif kabulü %35-70, bölüm kaçağı ≤ %20, ARPDAU $0,05-0,30 (sektör blogları; "kaybedince reklam" için yayımlanmış ölçüm yok). "Kalibre et" `adBase`'i kabul %52'ye oturtur.
- **Teşhis kartları** (`dxList`): kanıt + tek dokunuşla uygulanan öneri (fizik değişirse bölüm yeniden ölçülür). **Ayar geçmişi** `S.H[n]`: her ölçümde ve tasarım değişikliğinde puan + değişen ayar (`S.ui.chg`); işe yarayanlar yeşil. Üst çubukta `#hk` canlı kanca puanı.
- **Tutarlılık denetimleri (`runChecks`, Analiz'de görünür):** aynı tohum aynı sonuç, toplam %100, reklam kapalıyken 0 reklam, İdealist hatasız (hata yaparsa kırmızı BULGU: bölüm adil değil ya da bot kilidi bilmiyor), can +1 geçmeyi düşürmez / hasar +1 artırmaz, isabetli tip daha az geçmez (örneklem payı), oyuncu ×2 → toplamlar ×2. Kırmızı çıkarsa gizleme, nedenini bul.
- Dürüstlük: nerede yandığı ölçümdür; reklam ve bırakma kararları ayarlanabilir varsayımdır (gerçek veri ileride, Firebase). Kullanıcıya bunu hep ayrı söyle.

## Zorluk ayarı (2026-11-15)

- Kanca `hookScore(r, n)`: zorluk (ilk denemede canı biten, `goal(n).F0-F1`), reklam (`W0-W1`), bırakan (`Q`), sıkılan (`tB` 0,20), kıl payı (`tK` 0,45); basamağa göre doğrusal (`S.B.tF1/tF5/tDrift/tWa1/tWa5/tQ1/tQ5`). Sıkılma: ilk denemede hatasız geçen `need` olasılıkla, tek hatayla %35'i.
- Analiz'de "Bütün bölümleri ölç" ve 80 bölümlük merdiven grafiği (`allHtml`, noktaya dokununca bölüme gider).
- Önerilen değerler `node tools/bl-opt.mjs <varyantlar.json> [bölümler] [koşu] [iş] [--yaz]` ile bulunur: laboratuvarın kendi ölçüm hattı (aynı tohumlar, aynı model, aynı kanca), varyantta P/B/M/PH/KF verilebilir. Kanca 5 hedef (zorluk, reklam, bırakan, sıkılan, kıl payı `lateOf`), `band` yumuşak düşer, `hookCI` bootstrap ± verir; `runChecks` kancanın formülünü, tohumdan bağımsızlığını ve basamak sırasını denetler. Lab c aralığı 0,3-3,5 (bl-opt ile aynı). Uygulamanın tarayıcısı `confirm()` göstermiyor: onay için `sure(k, mesaj)` (iki basış).
- Başsız lab ölçümü: `www/lab.html`'i `tools/cdp.mjs` ile aç, `await measureLevels([...])`, sonra `simLevel(n, S.P, S.B).pop` ve `hookScore`.

## Dikkat

- Laboratuvardaki her değişiklik yalnız tarayıcıdadır; oyuna "al" denmeden kod değişmez. APK'yı yalnız kullanıcı isteyince üret.
- Kullanıcının ayarlarını denerken bozma: önce `localStorage['kp-lab']` yedeğini al, bitince geri koy.
- Bot insan değildir: kararı telefonda oynayarak kullanıcı verir.
