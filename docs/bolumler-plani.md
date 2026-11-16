# Bölümler modu planı (son hâl)

Durum: tasarım KESİN (kullanıcı onayı 2026-11-11). Kod yok. Sayılar ilk tahmindir; kodlanınca her bölüm botla ölçülüp ayarlanır.
Canlı görünüm: [`docs/bolumler-80.html`](bolumler-80.html) (80 bölüm, her biri baş/orta/son üç sahne). Tasarım ve animasyonlar: [`docs/bolumler-akis-onizleme-v2.html`](bolumler-akis-onizleme-v2.html).
Karar geçmişi (reddedilen denemeler, eski 95'lik plan): [`docs/bolumler-plani-gecmis.md`](bolumler-plani-gecmis.md). Bu belgeyle çelişirse BU belge geçerlidir.

## 1. Temel kurallar

- **16 kilit × 5 bölüm = 80 bölüm.** Her 5 bölüm bir kilidi öğretir. Yeni kilit hep sona eklenir; bölümler kalıcı kimlikle saklanır (numarayla değil).
- **Öğrenilmemiş kilit hiçbir bölümde gelmez.** Değiştirici de ancak ilk göründüğü bölümden sonra kullanılır.
- **Süre yok, puan yok.** Bölüm, dalgalar temizlenince biter; ortadaki sıvı ilerlemeyi gösterir. Puan ve rekor Süreli'nin işi.
- **Dalga:** halkada birkaç hedef birlikte durur; hepsi vurulunca yeni dalga HEMEN ibrenin önünde belirir. Mola, "Dalga geliyor" yazısı, duraklama YOK. Yeni dalgayı halkada dönen ışık ve ortadaki sayının zıplaması haber verir. İbre hızı hep yumuşak değişir.
- **3 can.** Boşa basmak 1 can, tuzak 2 can (Kasa alarmı 2 can).
- **Yıldız:** hatasız 3, bir hata 2, iki hata 1.
- **Canlar bitince:** Süreli'deki ikinci şans kadranı açılır (`OV.st` 'ch'). Reklam ya da altınla 3 can dolar, kalınan dalgadan devam edilir; bölüm başına en çok 2 kez. Devamla geçilen bölüm 1 yıldız alır. Vazgeçilirse aynı bölüm baştan.
- **Gizli yardım:** aynı bölümde üst üste 3 kayıptan sonra hedef yarı genişliği ×1,10, 5 kayıptan sonra ×1,18. Ekranda işaret yok, yıldız ve ödül tam. Bölüm geçilince sayaç sıfırlanır. Bot ölçümü yardımsız yapılır.
- **Enerji/bekleme sistemi YOK.** Hedef: ortalama oyuncu (günde 10-15 dk) tamamını 8-13 günde bitirsin.

## 2. Akış

Menü → **bölüm listesi** → bölüm (kesintisiz dalga, 3 can) → yanınca ikinci şans ya da baştan → bitince ~1 sn kutlama (yıldızlar halkanın içinde), sonraki bölüm aynı halkada başlar → grubun 5. bölümünden sonra grup kartı + **Şans çarkı** → yeni kilit tanıtımı.

- **Liste (V2, temasız):** her kilit bir kadran (5 dilim = 5 bölüm, ortada kilidin canlı önizlemesi). Yalnız sıradaki kilit soluk ve kilitli görünür, sonrakiler "???". Dünya, tema, arka plan resmi YOK (reddedildi; ayrıntı geçmiş belgede). Geçilmiş bölüme dönülebilir.
- **Yeni kilit tanıtımı:** asma kilit kırılır, kadran renklenir, kural üç kartta, Hayalet gösteride adımlar sırayla yanar, "Sıra sende!". Her kilidin 1. bölümü öğrenme bölümüdür; ayrı öğretim bölümü yok. Değiştiriciler de ilk göründükleri bölümde aynı kısa gösteriyle tanıtılır.

## 3. Görünüş ve animasyon

- Ekran, HUD ve animasyonlar **V2 akış önizlemesindeki gibi** (`bolumler-akis-onizleme-v2.html`).
- Vuruş: hedef parçalanıp savrulur, kıvılcım, şok halkası, halka parıltısı, ibre ucu büyür, sıvı çalkalanır. Tam ortaya "Mükemmel!" (altın, daha büyük efekt). 3+ seride "×N seri" çipi.
- Iska: sarsıntı, kırmızı kenar, X, "Erken!/Geç!", can patlar. Alarm daha sert. Can bitince çember kül ve kora döner.
- Kazanınca konfeti, yıldızlar tek tek döner, altın sayarak artar ve altın kutusuna uçar. Şans çarkında ışıklı çerçeve, tıklayan ok, ödül parlaması.
- **Pimler oyunun kendi çizim kodu** (`drawPin`, `drawHold`, `drawLockpin`, `drawPortal`, gelgit bandı `drawTrackFx`). Yeni eklemeler bölüm 6'da. Kendi pim çizimi uydurulmaz.

## 4. Kilit sırası

| # | Kilit | Bölümler | İkizi (tuzak) | Not |
|---|---|---|---|---|
| 1 | Tek ve çift pim | 1-5 | tuzak | 2. bölümde çift gelir; 5. bölümün ortasından itibaren 3'lü hedef |
| 2 | Kayan pim | 6-10 | kayan tuzak | 10'da tuzaklar da kayar |
| 3 | Nefes pim | 11-15 | diken | 14'te **Dönen çember** |
| 4 | Kasa turu | 16-20 | alarm | |
| 5 | Tut-bırak | 21-25 | sıcak yay | |
| 6 | Trafik ışığı | 26-30 | (hızlı ışık) | 30'da ilk **çift yönlü dönen çember** |
| 7 | Sabır pimi | 31-35 | çürük kilit | 33'te **Yayılan tuzak** |
| 8 | Gelgit | 36-40 | girdap | |
| 9 | Değirmen | 41-45 | (hızlı kanat) | 41-42 iki kanat, 43'ten itibaren üç kanat |
| 10 | Ritim pim | 46-50 | sahte nota | |
| 11 | Yön değiştir | 51-55 | tuzak | |
| 12 | Ani pim | 56-60 | yalancı şimşek | 58'de **Nefes alan çember** |
| 13 | Hayalet pim | 61-65 | hayalet tuzak | |
| 14 | Nabız | 66-70 | tuzak | 68'de **Ayna dünya** |
| 15 | Işınlanma | 71-75 | tuzak | |
| 16 | İki halka | 76-80 | kilitli halka | TEK ibre iki halka arasında geçer |

**Kaldırılanlar:** Bomba pim, Zırhlı pim, Vites. **Değiştiriciler** (tek başına bölüm değil, diğerlerini zorlaştırır): Dönen çember (tek yön ve çift yön), Yayılan tuzak, Nefes alan çember, Ayna dünya.
**Özel parçalar** (bölüm sayılmaz): Şans çarkı her kilidin 5. bölümünden sonra; Altın yağmuru 3 yıldızlı bölüm sonu; Sürpriz kutu bölüm içinde ara sıra. Piyano ve Düello ayrı mod (sonra).
**Yedek fikirler:** Sarkaç ibre, Hızlanan ibre, Şok dalgası, Dürbün, Boya.

## 5. Bölüm yapısı

### 5.1 Beş bölüm (basamak)

| Bölüm | Ne | Dalga | Tuzak |
|---|---|---|---|
| 1 | Öğren + alış | 2-3 hedef | yok |
| 2 | Hafif tuzak | 3 | bölümün ikinci yarısında, dalgada en çok 1 |
| 3 | Tam tuzak | 3-4 | her dalgada 1, sona doğru 2 |
| 4 | Kombo | 3-4 | hafif |
| 5 | En zor | 4-5 | tam; hedef küçük, 2 tuzak, ibre en hızlı |

3. bölüm 4.'den kolaydır. Kilidin kimliği her bölümde vardır (Kasa hep 3 numaralı hedef, Tut-bırak her dalgada 1 tut). Tuzak kilidin kendi ikizidir; ikizi olmayanda düz kırmızı tuzak.

### 5.2 Baş, orta, son (her bölümün içi)

- **Baş:** o kilit tek başına, yalın hâliyle (geç davranışı yok; 5. bölüm hariç).
- **Orta ve son:** kendi kilidi + daha önce öğrenilmiş bölümlerden ilham. Parçalar arası geçiş yumuşak. Hız baştan sona yumuşak artar; ileriki kilitler biraz daha hızlı başlar.
- **İlham eşlemesi** (g = kilit sırası): 1. bölüm: orta g-1'in 2.'si, son g-1'in 3.'sü. 2. bölüm: orta g-1'in 3.'sü, son başka bir kilidin 3.'sü. 3. bölüm: orta g-1'in 4.'sü, son başka bir kilidin 4.'sü. 4. bölüm: orta ve son iki FARKLI kilidin 4. ve 5.'si. 5. bölüm: orta g-1'in 5.'si, son başka bir kilidin 5.'si.
- **Kısıtlar:** ortanın ilham aldığı bölüm numarası sonunkinden büyük olamaz (orta ≤ son). İlk grup (1-5) sonraki grupların 4-5. bölümlerine ilham olmaz. Orta ve son mümkünse farklı kilitlerden gelir (çeşitlilik). Dönen çember 3. bölümlerde yok; 4-5'te var, çift yönlüsü yalnız 5. bölümlerde. İki halka ile Işınlanma aynı bölümde gelmez (yerine nefes).
- **Elle konanlar:** Işınlanma 73'ün ortası 20; 75'in ortası 2 kanatlı değirmen (44), sonu 3 kanatlı (45). Nefes 13 ve 15'in sonunda en az 2 nefes pimi.
- Bölüm bölüm tam liste `bolumler-80.html` içindeki `phases()` kuralından üretilir; o dosya bu kuralların canlı karşılığıdır.

### 5.3 Tuzak sınırı

Bir turda en çok 3 tuzak pim. Değirmen kanat uçları tuzak sayılır: 2 kanatlıda en çok 1 ek tuzak, 3 kanatlıda hiç. Diken tuzak pim sayılmaz. Kaldırılan tuzağın yerine öğrenilmiş bir kilidin tuzaksız zorluğu gelir (nefes, kayan, hayalet, gelgit).

### 5.4 Genel ilke

İlk bölümler düzenli ve birlikte; 3. bölümden sonra hedefler ayrışır; 5. bölümde kilit, ibre hedefe varmadan hemen önce hata yaptırmaya meyillidir. Bu HER ZAMAN kısa ve görünür bir işaretle olur (adillik).

## 6. Kilitlerin davranışı

| Kilit | Başta (1-2) | Sonlara doğru | Önceden işaret |
|---|---|---|---|
| Tek ve çift | 1-2 hedef | tuzaklar, 3'lü hedef | – |
| Kayan | hepsi aynı yöne | karşılıklı (biri ibreye gelir, öteki kaçar); 10'da tuzak da kayar | – |
| Nefes | birlikte daralır | her hedefin kendi ritmi (hiç kapanmaz, en çok ~%38 boya) | – |
| Kasa | sıra 1-2-3 | sıra karışık, yanlış numara ıska | numaralar |
| Tut-bırak | dalgada 1 tut + normal | aynı, sıcak yay | – |
| Trafik | ışıklar düzenli değişir | ibre yaklaşınca önce SARI, sonra kırmızı | sarı ışık |
| Sabır | dalgada 1 sabır pimi (3 nokta) | birden çok, nokta sayıları farklı (3, 1, 2) | noktalar |
| Gelgit | koyu bant sabit | bant yavaşça sıradaki hedefin önüne kayar | bant hep görünür |
| Değirmen | 2 kanat, sabit hız | 3 kanat; ara sıra hızlanır ya da ters döner | göbek sarı parlar |
| Ritim | eşit aralık, ibrenin hemen önünden başlar | gruplu, değişen aralık | – |
| Yön değiştir | vuruşta ters döner; hedefler ibrenin iki yanında yakın | kendiliğinden de ters döner | ibre ucu sarı parlar |
| Ani | ibrenin epey önünde çakar | daha yakında çakar | sarı kıvılcım |
| Hayalet | birlikte kaybolur | tek tek, ibre yaklaşınca | titreme |
| Nabız | düzenli atış | fazladan atış | EKG sarıya döner |
| Işınlanma | tek çıkış | iki çıkış, açık olan anlık değişir | açık kapıda atan halka |
| İki halka | köprüden geçince halka değiştirir | köprüsüz geçiş de gelir | ibre titrer |

**Bu tasarımla gelen yeni çizimler:**
- **Sabır pimi:** oyundaki görünüş (asma kilitli mor hedef, altında noktalar). Her vuruşta bir nokta yanar ve kilitli hedef bir boy küçülür; vurulmadan geçilirse bir nokta söner, hedef titreyip büyür. Noktalar dolunca açılır, son vuruş bitirir. (Açılış rengi ekonomiye bağlı: bkz. 8.)
- **Trafik:** sarı uyarı ışığı.
- **Yön değiştir:** ortada ok YOK.
- **Nabız:** ortada kalp yerine sade, ince, soluk, tek atışlık EKG çizgisi; çemberle dönmez.
- **Işınlanma:** iki çıkışta kapalı kapı soluk ve kilitli, açık kapının çevresinde atan halka. İbre, çıktığı an açık olan kapıdan çıkar; ibre kapının içindeyken açık kapı değişmez.
- **İki halka:** tek ibre. Geçiş yeri halkalar arası ÇAPRAZ köprü (ibrenin gittiği yönde eğik); üstünde akan oklar ibrenin gideceği halkayı gösterir. İbre köprü boyunca ilerledikçe halka değiştirir; geçiş bitmeden vuruş sayılmaz.
- **Değirmen:** ortadan çıkan kollar, her kolun ucunda tuzak; 2 ya da 3 kanat.

## 7. Sayılar (ilk tahmin)

g = kilit sırası (0-15), k = bölüm (0-4), I = g / 15.

| Değer | Formül |
|---|---|
| İbre hızı (rad/sn) | 2,2 + 1,2·I + 0,12·k; bölüm içinde orta ×1,12, son ×1,25 |
| Hedef yarı genişliği (rad) | 0,50 − 0,22·I − 0,035·k, en az 0,15 |
| Bölüm süresi hedefi (ilk deneme) | [45, 55, 65, 75, 90] sn; vuruş sayısı botla ayarlanır |
| Orta botun geçme oranı (σ 0,08) | [%97, %90, %80, %68, %55] |

Testere dişi: her kilidin 1. bölümü bir önceki kilidin 5. bölümünden belirgin kolaydır. Kombo ve değiştiriciler eklenince hedef genişliği bot ölçümüyle açılır.

## 8. Ekonomi (sonra netleşecek, Apple tarzı merdiven)

- Altın her vuruşta ya da her açılışta çıkmaz: normal bölümlerde 2-3 bölümde bir, zor bölümlerde 2 bölümde bir; her seferinde farklı miktar.
- Sabır pimi yalnız altın taşıdığı turda altın renginde açılır, diğer zamanlarda şeftali.
- Bölüm ödülü yalnız ilk geçişte; 3 yıldıza bonus. Eski taslak formül ([15, 20, 30, 40, 60][k] + 2·g) ekonomi kurulunca yeniden hesaplanır.

## 9. Henüz konuşulmayanlar (sırayla, tek tek sorulacak)

1. Ana menü: Süreli ve Bölümler'in kadrandaki yeri.
2. Öğretim: mevcut kısa öğretimin Bölümler'le birleşmesi.
3. Eski oyuncu geçişi.
4. Jokerler (Steteskop, Kalkan, Kum saati aynen; Kronometre kararsız).
5. Ekonomi (bölüm 8).
6. Firebase Analytics: sonraki değil, ondan sonraki sürümde.

## 10. Ölçüm planı (kodlanınca)

1. Her bölüm için `tools/bot.js` ile üç beceri (yeni 0,12, orta 0,08, iyi 0,05), bölüm başına en az 100 koşu.
2. Orta botun geçme oranı hedefin ±%5'i içinde olmalı; dışındaysa önce hedef genişliği, sonra hız.
3. Her kilidin 1. bölümünü yeni bot da %85+ geçmeli.
4. Sonuç tablosu bu belgenin sonuna eklenir.
