# Zorluk Modeli ve betikli parkurlar (V1.0.28)

Bölüm 4-55 baştan, matematiksel bir modelle üretildi (kullanıcı: "ilkel olmayan formüllerle, her parkur aynı standartta, kıl payı hissi, kanca, bir daha hissi").
**Bölüm 1-3 (tek1, tek2, tek3) kullanıcının elle ayarı: dokunulmadı** (ölçülen puanları ≈ 30 / 36 / 67; kullanıcı bunları ve 75-80'i "kolay" buldu).

## Zorluk puanı Z
Z = bölümü **yarı yarıya geçen oyuncunun refleks yüzdeliği** (Z90: oyuncuların en iyi %10'u bölümü %50 geçer). Oyuncu = zamanlama gürültüsü σ (ms) + tuzaktan kaçınma `av`.
Nüfus payları: kusursuz 1, pro 4, usta 10, iyi 20, orta 35, acemi 20, yeni 10 (`kzm-core.mjs` TIERS). Karşılıklar: Z75≈50 ms, Z80≈42, Z85≈36, Z90≈30, Z95≈22,5.
Hedef tablosu `tools/kzm-gen.mjs` başında (`ZL`, `ZT0`): parkur 1-10 için 85, 88, 91, 94, 96; tek parkuru (4. ve 5. bölüm) 84, 88. TEK YERDEN değişir.
Gizli yardım (kayıp sonrası hedef ×1,2 / ×1,4) bölümün kendi puanını değiştirmez; tekrar denemeyi kolaylaştırır.

## Katmanlar
1. **Fizik (`tools/kzm-core.mjs`)**: dokunuş penceresi T = (yarım genişlik + 2,865° pay) / (hız × çarpan); senaryolar: gelgit, nabız, kayan, nefes, daralma, tuzak bölgeleri, ters dönme olayları; 3 can + Kaçan can pimi DP'si → bölümü geçme olasılığı P(σ) → σ50 → Z.
2. **İnsan katmanı (`tools/kzm-hf.js`, bot da aynısını kullanır)**: mekaniğin kendi belirsizliği varyans olarak eklenir (kayan faz tahmini, hayalet hafızası, şipşak ölçekli zamanlama, nabız, değirmen, ışın, ritim, ters dönmede uyarıyı fark etme/dur tepkisi). **Katsayılar telefon testi yapılmamış tahmindir**: bot insan değildir; zorluk dağılımını doğrulayan tek gerçek ölçüt telefonda oynamaktır.
3. **Kalibrasyon (`tools/kzm-hf.json`, `HF.cal`)**: modelin her mekanik için çarpanı, gerçek oyunda insan katmanlı botla ölçülen hasara göre uydurulur (`kzm-fit.mjs`).
4. **Kapalı döngü (`tools/kzm-bias.json`)**: her bölüm gerçek oyunda hedef σ'da oynatılır, ölçülen geçme oranına göre bölümün logit sapması güncellenir (`kzm-fit.mjs bias`).
Ek ölçüler: sıkılma B (tekdüzelik, ölü zaman, JND altı adım), şaşırtma A (olay/sn), gerilim (ölümün bölümde nerede olduğu), çeşitlilik, ritim; hepsinin geometrik ortalaması = kanca puanı (0-100). Kesin adalet kuralları: hız ≥ 155 °/sn, genişlik 18-44°, uyarılar ≥ 0,4 sn, şipşak payı ≥ 0,4 sn, hayalet görünür ≥ 0,5 sn, açısal doluluk ≤ 300°.

## Dalga betiği (`BL_SC`, src/game.html içinde `/*BL_SC-START*/ … /*BL_SC-END*/`)
`kimlik: { z, w: [ { s, n, m, e, tr, v, d, p, x } … ] }`; kimlik = kilit adı + basamak (örn. `kasa4`).
- `s`: yapı `tek | cift | kasa | isin | gelgit`; `n`: hedef sayısı; `m`: değiştirici `kayan | nefes | hayalet | ani` (kasa pimlerine de uygulanır);
- `e`: ortam `nabiz(+nabizk) | degirmen(+hizkanat, deg3) | kyon | serit`; `tr`: `{ n tuzak, w genişlik°, g boşluk°, k özel tür: kayanT | diken | hayaletT | alarm }`;
- `v` °/sn ve `d` ° **tam değerdir** (tür çarpanı yok; hız ≥ 155); `p`: mekanik ayarları (`'m.kayan.amp'` …); `x`: kaldıraçlar `shr {f, t}` (hedefe t sn kala f katına küçülür), `amb {L, tell, n}` (ibre hedefe L sn kala, tell sn uyarıdan sonra ters döner).
- Motor: `blOv` (betik varsa onu, yoksa eski `BL_OV`), `blWavePh`, `blAmbMin` (pusulu dalgada ilk hedef uyarı + L süresi kadar uzakta kurulur), `blShrink`, `blTick` (pusu: uyarı tam süre görülürse ters döner).

## Üreteç (`tools/kzm-gen.mjs`)
Birikimli kadro (parkur g: kendi öğesi + önceki parkurların öğeleri; yapılar kasa g≥3, gelgit g≥4, ışın g≥9; değiştiriciler kayan 1, nefes 2, şipşak 6, hayalet 7; ortamlar kyon 3, değirmen 5, nabız 8, iki halka 10; kaldıraçlar küçülen ≥1, pusu ≥3) →
uyumluluk matrisi (`compat`) ve karmaşıklık sınırı (bölümün ilerleyişi ve basamağa göre en çok 1-4 mekanik) → risk eğrisi (yükselen rampa × 5'lik cümle: ısın, yüksel, yüksel, sıçra, dinlen; patrondan önce nefes) →
her dalga için üslup (sıkı: yavaş+dar, hızlı: hızlı+geniş, dengeli, dinlenme) ve **(v, d) çözümü**: dalganın model riski hedef riske eşit olacak şekilde genişlik ikili aramayla, gerekirse hız ayarıyla bulunur →
tek çarpanla (dial) bölümün geçme olasılığı hedefe oturtulur → 8-12 aday arasında kanca puanı en yüksek olan seçilir. Dalga sayısı basamağa göre 20/23/26/29/32 (≈ 45-75 sn).

## Araçlar
| Araç | İş |
|---|---|
| `node tools/kzm-gen.mjs [--only 19,20] [--cand 8] [--write]` | bölümleri üretir (`tools/kzm-levels.json`), `--write` ile src/game.html BL_SC bloğunu yazar |
| `node tools/kzm-show.mjs kasa4` | bölümün dalga dökümü ve ölçüleri |
| `node tools/kzm-cal.mjs [koşu] [ad]` | mekanik başına bot ↔ model hasar tablosu |
| `node tools/kzm-fit.mjs collect [koşu] [işçi]` / `fit` / `bias [koşu] [işçi]` | veri topla, çarpanları uydur, kapalı döngü |
| `node tools/kzm-val.mjs 19,32 [koşu] [σ çarpanları]` | gerçek canla geçme oranı: model ↔ bot |
| `node tools/kzm-wave.mjs 19 [koşu] [σ çarpanı] [rows]` | dalga dalga hasar: bot ↔ model |
| `node tools/kzm-core.mjs demo` | çekirdek modelin küçük örneği |
Hepsi `DEBUG=1 ./build.sh` derlemesini kullanır (`www/index.html`); bot `tools/kzm-hf.js` + `tools/kzm-hf.json` + `tools/bot.js` olarak yüklenir (`kzm-run.mjs`). Paralel işçilerle yüzlerce koşu saniyeler sürer.

## Değişiklik yapma sırası
Hedef puanı/kadro/kural değişince: `kzm-gen --cand 8 --write` → `DEBUG=1 ./build.sh` → `kzm-fit bias 200 8` (2-3 tur: gen, build, bias) → `bl-overlap.mjs 60 4-55` (kayan hedeflerde binde birkaç çakışma kalır) → telefonda deneme.
Mekanik ya da motor değişirse önce `kzm-fit collect 80 8` + `fit` ile çarpanları yeniden uydur.

## Ölçülen durum ve bilinenler
- Kapalı döngü sonrası bot geçme oranı hedeften ortalama ≈ 5-6 puan sapar (ölçümün kendi gürültüsü ≈ 3); bölüm başına toplam hasar hatası ≈ %16.
- Bot, insan değildir (daha tutarlı, sıkılmaz, tek sigma); insan katsayıları tahmindir → **telefonda deneme şart**, sonuca göre `tools/kzm-hf.json` ya da hedef tablosu ayarlanır.
- Diken (nefes alan kenarlı tuzak) oyunda modelin tahmininden çok ölümcül (çarpan ≈ 5-7): üreteç bunu telafi eder (dikenli dalgalar daha geniş/yavaş); insanın diken açılmasını beklemesi botta yok → insan için biraz kolay kalabilir.
- İki halkada kayan/nefes/hayalet yasak (oyunda neredeyse oynanamıyor, ölçüldü). Kasa + kayan: komşu pimlerin uçlarda binmemesi için aralık ≥ 2×genişlik + 10°.
- Pusu (ters dönme) ve küçülen hedef için ilk görüş tanıtım sahnesi yok (görsel ipucu var: ibre ucunda sarı uyarı, hedef küçülürken görünür).
- Bölüm 1-3 ölçülen puanları (≈ 30, 36, 67) tek5 ve sonrasıyla süreklilik için tek4 = 84 alındı; Bölüm 1-3'ü de yükseltmek istenirse aynı üreteçle yapılabilir.
