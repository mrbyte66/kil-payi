# Bölümler modu planı: karar geçmişi

> ARŞİV. Bu belge tasarım sürecinin kaydıdır (eski 95 bölümlük plan, reddedilen denemeler, revizyonlar). Geçerli karar: `docs/bolumler-plani.md`.

Durum: tasarım (2026-11-09). Kod yok. Kararların hepsi kullanıcıyla konuşuldu. Sayılar ilk tahmindir; kodlanınca her bölüm botla ölçülüp ayarlanacak.

## Kurallar

- 19 kilit, her kilit 5 basamak: 1 öğren, 2 alış, 3 ikiz, 4 kombo, 5 ustalık. Toplam 95 bölüm.
- Süre yok. Bölüm, gereken vuruş sayısına ulaşınca biter.
- 3 can. Boşa basmak 1 can, tuzağa basmak 2 can. Can bitince aynı bölüm hemen baştan.
- Yıldız: hatasız 3, bir hata 2, iki hata 1.
- Altın ödülü bölümün zorluğuna göre, oynamadan görünür. Yalnızca ilk geçişte verilir. 3 yıldızla geçene %50 bonus; sonradan 3 yıldıza çıkan yalnızca bonusu alır.
- Yeni kilit HEP sona eklenir, ortaya eklenmez. Bölümler kalıcı kimlikle saklanır (numara değil).
- Öğretim: her kilidin 1. bölümü öğrenme bölümüdür, ilk görüşte Hayalet gösteri bir kez oynar. Değiştiriciler de ilk göründükleri bölümde aynı kısa gösteriyle tanıtılır. Ayrı öğretim bölümü yok.
- Geçiş **C · Beşli grup** (kullanıcı kararı, 2026-11-09): bir kilidin bölümleri kesintisiz akar (bölüm bitince ~1 sn kutlama, sonraki bölüm aynı halkada başlar), grubun son bölümünden sonra grup kartı (yıldızlar) + Şans çarkı, sonra yeni kilit tanıtımı. Grup boyu 5 varsayılan ama veriyle değişebilir (bazı kilitler 3-4 bölüm olabilir; kullanıcı "beşli yaparız, en kötü kaldırırız").
- Puan yok; bölüm dalgalar temizlenince biter, ortadaki sıvı ilerlemeyi gösterir, başarı yıldızla ölçülür. Puan ve rekor Süreli'nin işi.
- Toplam süre hedefi: ortalama oyuncu (günde 10-15 dk) 95 bölümü 8-13 günde bitirsin (kullanıcı: "100 bölüm 10-15 günde bitsin"). Tahmin: ilk deneme süreleri ve geçme oranlarıyla bölüm başına ortalama ~79 sn (yeniden denemeler dahil), toplam ~126 dk; 10 dk/gün 12,6 gün, 15 dk/gün 8,4 gün. Bot ölçümü bölüm sürelerini de ölçer. Enerji/bekleme sistemi YOK.
- Bölüm yapısı **Dalga** (kullanıcı kararı, 2026-11-09): halkada 3-5 hedef birlikte durur, hepsi vurulunca yeni dalga HEMEN gelir (ibrenin önünde belirir).
- **KESİNTİSİZ (kullanıcı onayı, 2026-11-09, Bölüm 25 önizlemesi):** dalgalar arasında mola, "Dalga N geliyor" yazısı ya da duraklama YOK ("oyunu duraklatmak ne alaka"). Yeni dalgayı halkada dönen ışık + ortadaki sayının zıplaması haber verir. İbre hızı yumuşak geçer (ani değişim yok).
- **Animasyon seviyesi (onaylı, "animasyonlar çok zayıf" sonrası):** vuruşta hedef parçalanıp savrulur + kıvılcım + şok halkası + halka parıltısı + ibre ucu büyür + sıvı çalkalanır; tam ortaya "Mükemmel!" (altın, daha büyük efekt); 3+ seride "×N seri" çipi; ıskada sarsıntı + kırmızı kenar + X + "Erken!/Geç!" + can patlar; alarmda daha sert; can bitince çember kül ve kora döner; kazanınca konfeti, yıldızlar tek tek döner, altın sayarak artar ve altın kutusuna uçar; Şans çarkında ışıklı çerçeve, tıklayan ok, ödül parlaması. Yeni bölümler bu seviyenin altına düşmemeli.
- Önizleme: `docs/bolumler-b25-onizleme.html` (Bölüm 25, Kasa turu ustalık; 24 dalga × 3 hedef, hatasız bot 35 sn). Kesintisiz akışta vuruş başına süre ~0,5 sn (bot); süre hedefi için vuruş sayısı aşağıdaki tahminden fazla olacak, botla ölçülecek.

**Basamak tablosu (kullanıcı önerisi, onaylı 2026-11-10; eski "1 öğren, 2 alış, 3 ikiz" yerine):**

| Basamak | Ne | Dalga | Tuzak |
|---|---|---|---|
| 1 | Öğren + alış | 2-3 | yok |
| 2 | Hafif tuzak | 3 | yalnız bölümün ikinci yarısı, dalgada en çok 1 |
| 3 | Tam tuzak | 3-4 | her dalgada 1, sona doğru 2 |
| 4 | Kombo (önceki kilitle karışık) | 3-4 | hafif |
| 5 | En zor | 4-5 | tam, ibre en hızlı |

Bölüm içinde de zorluk artar (başta kolay dalga, sona doğru daha çok hedef ve tuzak); dalga boyu dalgadan dalgaya değişir. Kilidin kimliği her basamakta vardır (Kasa hep 3 numaralı hedef, Tut-bırak her dalgada 1 tut); tuzak kilidin kendi ikizidir (Çift: tuzak, Kasa: alarm, Nefes: diken, Tut-bırak: sıcak yay…), ikizi olmayan kilitte (Tek, Trafik, Işınlanma) düz kırmızı tuzak.

**Kilitlerin dalga hâli (aşama aşama, 2026-11-10):** Tut-bırak: dalgada 1 tut hedefi + diğerleri normal dokunuş (kullanıcı seçimi). İki halka (tek ibre, şerit değiştirir; hedefler iki halkada karışık, ibre o halkadayken vurulur): 1-2. basamakta ibre yalnız halkadaki görünür KAPIDAN geçince halka değiştirir (öğrenme); 3-4. basamakta kapılar çoğalır ve ara sıra kapısız geçiş gelir; 5. basamakta geçiş tamamen rastgele ve hedefe varmadan hemen önce geçmeye meyilli (kullanıcı: "hedeften önce hata yaptırmaya meyilli olsun"). Adillik için rastgele geçişten ~0,3 sn önce ibre kısa bir işaret verir (titrer/parlar); ibre hep görünür kuralı sürer. Kasa (dalgada hep 3 numaralı hedef): 1-2. basamakta numaralar ibrenin geliş sırasıyla (1-2-3, yalnız yerleri değişir); 3. basamaktan itibaren sıra karışır (ibre önce 3'ün, sonra 1'in yanından geçer, oyuncu doğru numarayı bekler, yanlış numaraya dokunmak ıska); 5. basamakta her dalga karışık (kullanıcı seçimi "sonlara doğru karışık"). Nefes (hedef hiç kapanmaz, en çok ~%38 boya daralır): 1-2. basamakta dalgadaki hedefler birlikte daralıp genişler; 3. basamaktan itibaren her hedefin kendi ritmi (evresi) olur, biri açıkken öteki dar (kullanıcı seçimi "sonlara doğru ayrı"). Kayan: 1-2. basamakta dalgadaki hedefler birlikte aynı yöne kayar; 3. basamaktan itibaren karşılıklı (biri ibreye doğru gelir, öteki ibreden kaçar; kullanıcı seçimi "sonlara doğru karşılıklı"). Genel ilke (kullanıcının üç seçiminden): ilk basamaklar düzenli ve birlikte, 3. basamaktan sonra hedefler ayrışır, 5. basamakta kilit ibre hedefe varmadan hemen önce hata yaptırmaya meyillidir; bu hep kısa bir görünür işaretle (adillik) olur. Trafik ışığı: 1-2. basamakta ışıklar eşit aralıkla sırayla değişir; sonlara doğru ibre yaklaşırken bazı ışıklar önce SARI (uyarı), sonra kırmızı olur (kullanıcı seçimi "sonlara doğru son anda"). Sabır: 1-2. basamakta dalgada tek sabır hedefi + normal hedefler; sonlara doğru dalgadaki bütün hedefler sabırlı, nokta sayıları farklı (1, 2, 3) olduğu için ayrı turlarda açılır (kullanıcı seçimi "sonlara doğru hepsi"). Gelgit: 1-2. basamakta hızlandıran koyu bantlar sabit; sonlara doğru bant yavaşça kayıp sıradaki hedefin hemen önüne gelir, ibre hedefe hızlı varır (bant hep görünür, yavaş kayar = işaret; kullanıcı seçimi "sonlara doğru kayan bant"). Ritim: 1-2. basamakta notalar eşit aralıklı (düz tempo); sonlara doğru gruplu ve değişen aralıklı ritim (kullanıcı seçimi "sonlara doğru değişen"). Bomba: 1-2. basamakta dalgada tek bomba + normal hedefler; sonlara doğru birkaç bomba, fitil süreleri farklı (kısa fitilli uzakta olabilir, ibre yetişmeli; kullanıcı seçimi "farklı fitiller"). Hayalet: 1-2. basamakta dalgadaki hedefler birlikte kaybolur; sonlara doğru tek tek, biri ibre yaklaşırken titreyip silinir (titreme = işaret; kullanıcı seçimi "sonlara doğru tek tek"). Işınlanma: 1-2. basamakta tek çıkış kapısı; sonlara doğru iki çıkış, ibre girince çıkacağı kapı yanar (işaret); çıkıştan hedefe en az ~0,5 sn pay (kullanıcı seçimi "iki çıkış"). Tek, Çift, Tut-bırak: kural tek başına yeter, ayrıca soru yok (Çift 2 hedef, Tek 1 hedef + tuzak basamakları). Yön değiştir (yeni): her vuruşta ibre ters döner (ortada yön oku); sonlara doğru ibre ara sıra hedefe varmadan kendiliğinden de ters döner, önce ucu sarı parlayıp büyür (~0,3 sn işaret; kullanıcı seçimi "kendiliğinden de"). Zırhlı pim (yeni): iri hedef her vuruşta bir kat incelir ve çatlar, son katta parçalanır (zırh katları dış kenarda mor çizgiler); 1-2. basamakta hep 3 kat, sonlara doğru dalgada karışık kat (1, 2, 3; kullanıcı seçimi "karışık kat"). Ani pim (yeni): hedef ibrenin önünde şimşek gibi çakar, kısa yaşar; 1-2. basamakta ibrenin epey önünde (geniş tepki payı), sonlara doğru ibreye daha yakın, çakmadan ~0,25 sn önce o noktada sarı kıvılcım (işaret; kullanıcı seçimi "sonlara doğru yakında"). Yalancı şimşek ikizi tuzak basamaklarında. Değirmen (yeni): ortadaki iki kanat halkayı süpürür, kanadın altındaki hedef o an tuzak (kırmızı); 1-2. basamakta kanatlar sabit hızla tek yöne, sonlara doğru ara sıra hızlanır ya da ters döner, öncesinde göbek sarı parlar (işaret; kullanıcı seçimi "hız ve yön değişir"). Nabız (yeni): ibre kalp atışı gibi atışta kısa hızlanır, ortada kalp atar (ses ve titreşim); 1-2. basamakta düzenli atış, sonlara doğru düzensiz (fazladan atış), öncesinde kalp sarı parlar (işaret; kullanıcı seçimi "sonlara doğru düzensiz"). NOT: bu bölümdeki kilit görselleri yalnız davranış çizimiydi; oyunda hepsi onaylı oyun görünüşüyle (Bölüm 25 / V2 önizlemesi, mevcut oyunun lila + şeftali dili) çizilecek.

## Kilit sırası (kombolara göre)

| # | Kilit | Bölümler | Not |
|---|---|---|---|
| 1 | Tek pim | 1-5 | |
| 2 | Çift pim | 6-10 | Tuzak ikizi |
| 3 | Kayan pim | 11-15 | Kayan tuzak |
| 4 | Nefes pim | 16-20 | Diken; 19'da **Dönen çember** |
| 5 | Kasa turu (üçlü) | 21-25 | Çift pimin zorlaşmış hâli; Alarm |
| 6 | Tut-bırak | 26-30 | Sıcak yay |
| 7 | Trafik ışığı | 31-35 | |
| 8 | Sabır pimi | 36-40 | Çürük kilit; 38'de **Yayılan tuzak** |
| 9 | Gelgit-Mıknatıs | 41-45 | Gelgit + Mıknatıs birleşti; Girdap |
| 10 | Ritim pim | 46-50 | Sahte nota; 48'de **Vites** |
| 11 | Yön değiştir | 51-55 | |
| 12 | Zırhlı pim | 56-60 | Vurdukça ufalanır |
| 13 | Ani pim | 61-65 | |
| 14 | Bomba pim | 66-70 | 68'de **Nefes alan çember** |
| 15 | Hayalet pim | 71-75 | Hayalet tuzak |
| 16 | Değirmen | 76-80 | |
| 17 | Nabız | 81-85 | 83'te **Ayna dünya** |
| 18 | Işınlanma | 86-90 | |
| 19 | İki halka | 91-95 | Kilitli halka; Bölümlerde İki halka TEK İBRE: Şerit değiştiren ibre (iç ve dış halka arasında geçer), iki ibre yok |

Değiştiriciler tek başına bölüm değildir, diğer bölümleri zorlaştırır: Dönen çember, Yayılan tuzak, Vites (turbo/fren kararı), Nefes alan çember, Ayna dünya.

Özel parçalar bölüm sayılmaz: Şans çarkı her kilidin 5. bölümünden sonra ödül; Altın yağmuru 3 yıldızlı bölüm sonu kısa ödül; Sürpriz kutu bölüm içinde ara sıra çıkan pim; Piyano ayrı mod; Ateş bütün bölümlere yayılan sistem; Düello ayrı mod.

Yedek liste: Altın pim, Sarkaç ibre, Hızlanan ibre, Şok dalgası, Dürbün, Boya, ortamlar (Kış, Çöl, Deniz, Volkan), ibre karakterleri ve geliştirme.

## Sayılar (ilk tahmin)

g = kilit sırası (0-18), k = basamak (0-4), I = g / 18.

| Değer | Formül | Aralık |
|---|---|---|
| İbre hızı (rad/sn) | 2,2 + 1,2·I + 0,12·k | 2,2 → 3,88 |
| Hedef yarı genişliği (rad) | 0,50 − 0,22·I − 0,035·k, en az 0,15 | 0,50 → 0,15 |
| Bölüm süresi hedefi (ilk deneme, sn) | [45, 55, 65, 75, 90][k] | Vuruş sayısı buna göre botla ayarlanır, ~1,3 sn/vuruş: [35, 42, 50, 58, 69] |
| Hedef geçme oranı, orta bot (σ 0,08) | [%97, %90, %80, %68, %55][k] | |
| Altın | [15, 20, 30, 40, 60][k] + 2·g | 15 → 96 |

Oyundaki Süreli aralıklarıyla aynı uçlar (`DIFF.omegaMin/Max`, `hwMin/Max`). Testere dişi: her kilidin 1. bölümü bir önceki kilidin 5. bölümünden belirgin kolaydır (hız ~0,4 rad/sn düşer, hedef ~0,12 genişler).

Kombo ve değiştiriciler zorluğu artırır; bu yüzden 3-5. basamaklarda hedef geçme oranını tutturmak için hedef genişliği bot ölçümüyle ayarlanır (kombo eklendiğinde genişlik bir miktar açılır).

**Giriş (kullanıcı kararı, 2026-11-09):** menüde Bölümler önce BÖLÜM LİSTESİNİ açar (geçilenler, yıldızlar, sıradaki; geçilmiş bölüme dönülebilir). Liste ekranının görünüşü için 3-4 canlı alternatif gösterilecek (harita/hikâye YOK kuralı geçerli).

**Canlar bitince (kullanıcı kararı, 2026-11-09: "Evet, reklam/altınla"):** Süreli'deki ikinci şans kadranı açılır (aynı tasarım ve kurallar yeri: `OV.st` 'ch'); reklam ya da altınla 3 can dolar, kaldığı dalgadan devam eder; bölüm başına en çok 2 kez (sayılar ekonomiyle netleşecek). Devamla geçilen bölüm 1 yıldız alır (hata sayısı zaten 3+). Vazgeçerse aynı bölüm baştan, gizli yardım sayacı işler.

**Temel şablon tamam (2026-11-09):** giriş listesi → bölüm (kesintisiz dalga, 3 can) → yanınca ikinci şans ya da baştan → bölüm sonu ~1 sn kutlama, aynı halkada sonraki → 5 bölümde grup kartı + Şans çarkı → yeni kilit Hayalet gösteri.

**Liste ve tanıtım (kullanıcı onayı, 2026-11-09, V2 akış turu `docs/bolumler-akis-onizleme-v2.html`):** her kilit bir kadran (5 dilim = 5 bölüm, ortada kilidin canlı önizlemesi); yalnız SIRADAKİ kilit soluk ve kilitli görünür, sonrakiler "???". Yeni kilit tanıtımı: asma kilit kırılır, kadran renklenir, kural üç kartta (ör. Bas · Tut · Bırak), Hayalet gösteride adımlar sırayla yanar, "Sıra sende!".

**Dünyalar = İBRELİ ALETLER (kullanıcı seçimi, 2026-11-09):** Pusula (kilit 1-4), Kasa (5-8), Saat kulesi (9-12), Radar (13-15), Cehennem (16-19). Liste kaydırılırken arka plan, büyük alet deseni ve parçacıklar aletten alete yumuşak geçer; dünya şeridi + üstte "Dünya N · ad". Manzaralı dünyalar (çöl, deniz…) REDDEDİLDİ: "iki farklı konsept bir arada olmuyor". Önizleme `docs/bolumler-liste-aletler.html`. **Sonra (2026-11-10) ibreli alet yüzeyli arka planlar (V5) REDDEDİLDİ:** "git gide kötüye gidiyoruz, alakasız dünyalar bile arka plana resim koymaktan iyiydi". Ardından manzaralı dünyaların uyumlu hâli de, üç yeni dil (Helezon, Kart destesi, Takımyıldız; `docs/bolumler-liste-dil-secenekleri.html`) de elendi. **KARAR (2026-11-10): liste TEMASIZ V2** (Helezon güzel ama yeni bölüm eklenince büyümez; kart destesinde uzak bölüme kaydırmak zor). Dünya/tema YOK; temel liste V2 (`docs/bolumler-akis-onizleme-v2.html`, kullanıcı: "çok iyi"). Bölüm içi alet görünümü de karar almadı.

Jokerler (ertelendi, kullanıcı: "sonra düşünelim"): Steteskop, Kalkan, Kum saati Bölümler'de aynen çalışır; Kronometre için öneri "+1 can" ya da Bölümler'de gizli, karar yok.

**Gizli yardım (kullanıcı kararı, 2026-11-09: "Evet, sessizce"):** aynı bölümde üst üste 3 kayıptan sonra hedef yarı genişliği ×1,10, 5 kayıptan sonra ×1,18 (üst sınır); ekranda hiçbir işaret yok, yıldız ve altın tam verilir; bölüm geçilince sayaç sıfırlanır. Bot ölçümü yardımsız yapılır. Ekonomi ve fiyatlandırma sonra netleşecek (Apple tarzı merdiven).

Ekonomi kontrolü: 95 bölümün tamamı yaklaşık 4.850 altın, 3 yıldızlarla en çok ~7.300. Mağazadaki açılışların toplamı ~18.700; ekonomi bozulmaz.

## Ölçüm planı (kodlanınca)

1. Her bölüm için `tools/bot.js` ile üç beceri (yeni 0,12, orta 0,08, iyi 0,05), bölüm başına en az 100 koşu.
2. Orta botun geçme oranı yukarıdaki hedefin ±%5'i içinde olmalı; dışındaysa önce hedef genişliğini, sonra hızı oyna.
3. Her kilidin 1. bölümünü yeni bot da %85+ geçmeli (öğrenme bölümü).
4. Sonuç tablosu bu belgenin sonuna eklenir.


**95 bölüm görünümü (2026-11-10):** `docs/bolumler-95.html` 19 kilit × 5 bölümün canlı küçük sahneleri; pimler oyunun kendi çizim koduyla (src/game.html'den birebir kopya). Eski kilitler eski tasarımda kalır; istisnalar: Trafik sarı uyarı, Zırhlı pim mor çizgili katlar (kullanıcı orijinal beyaz noktalıyı beğenmedi). Her kilit 5 bölüm.

**Bölüm içi akış ve ilham kuralı (kullanıcı, 2026-11-10):** Her 5 bölüm bir kilidi öğretir; ÖĞRENİLMEMİŞ kilit hiçbir bölümde gelmez (değiştirici de ancak ilk göründüğü bölümden sonra). Her bölüm üç parça, geçişler yumuşak: BAŞ = o bölümün kilidi tek başına (geç davranış yok); ORTA ve SON = önce öğrenilmiş bölümlerden ilham + kendi kilidi. Eşleme (g = kilit sırası): 1. bölüm orta g-1'in 2.si, son g-1'in 3.sü; 2. bölüm orta g-1'in 3.sü, son 4.sü; 3. bölüm orta g-1'in 4.sü, son 5.si; 4. bölüm (kombo) orta g-4'ün 4.sü, son g-4'ün 5.si (ör. 89: orta 69, son 70); 5. bölüm (en zor) orta g-2'nin 5.si, son g-4'ün 5.si (ör. 85: orta 75, son 65). Amaç çeşitlilik, kombinasyon ve "ilk denemede olmadı, ikincide olsun" hissi. Kilidin geç davranışı (karşılıklı kayma gibi) bölümün tek konusu olmaz, orta/sonda karışır. 3. bölüm 4.den kolay; 5. bölümde hedef küçük, tuzak 2 tane. Görünüm: `docs/bolumler-95.html` (her bölüm baş/orta/son üç canlı sahne).

**Revizyon 2026-11-10 (kullanıcı): 85 bölüm, 17 kilit.** Tek ve Çift tek grup (1-5; 2. bölümde çift gelir, 5. bölümün ortasından itibaren 3'lü hedef). Bomba pim KALDIRILDI; Vites KALDIRILDI. Yeni sıra: Tek+Çift, Kayan, Nefes, Kasa, Tut-bırak, Trafik, Sabır, Gelgit, Değirmen (Ritim'in yerine), Ritim, Yön, Zırhlı, Ani, Hayalet, Nabız, Işınlanma, İki halka. Değiştiriciler: Dönen çember Nefes'in 4.sünde (14), Yayılan Sabır'ın 3.sünde (33), Nefes alan çember Ani'nin 3.sünde (63, Bomba'dan taşındı), Ayna Nabız'ın 3.sünde (73). Dönen çember 3. bölümlerde YOK, 4 ve 5. bölümlerde var; çift yönlü (ara ara ters) dönme 5. bölümlerde ve ilk kez Trafik'in 5.sinde (30). Değirmen 1-2. bölümde 2 kanat, sonra 3. Kayan'ın 5.sinde tuzaklar da kayar. Nefes 3 ve 5. bölüm sonunda en az 2 nefes pimi. İlham kuralı: ilk grup (eski ilk 10 bölüm) sonraki grupların 4-5. bölümlerine ilham olmaz; orta ve son FARKLI kilitlerden gelir (çeşitlilik; ör. Zırhlı 4: orta Trafik 4, son Nefes 5). Hız bölüm içinde yumuşak artar (baş < orta < son), geç bölümler biraz daha hızlı başlar. İki halkada şerit geçişi ~0,6 sn yumuşak (video geçişi gibi), geçiş bitmeden vuruş sayılmaz.

**Ek kısıt (kullanıcı, 2026-11-10):** bir bölümde ortanın ilham aldığı bölüm numarası, sonun ilham aldığından BÜYÜK olamaz (orta ≤ son; ör. 19: orta 9, son 15 doğru). Böylece bölüm içinde de baştan sona doğal zorlaşma olur.

**Tuzak sınırı (kullanıcı, 2026-11-10):** bir turda en çok 3 tuzak pim. Değirmen kanat uçları tuzak sayılır: 2 kanatlı değirmende en çok 1 ek tuzak, 3 kanatlıda hiç ek tuzak yok. Diken (nefesin dikenli kenarı) tuzak pim sayılmaz, kalır. Kaldırılan tuzağın zorluğu öğrenilmiş başka bir kilidin tuzaksız mekaniğiyle dengelenir (nefes, kayan, zırh, hayalet, gelgit).

**Revizyon 2 (kullanıcı, 2026-11-10): 80 bölüm, 16 kilit.** Zırhlı pim KALDIRILDI. Sabır pimi yerine **Buz pim** (yeni ad): şeftali çekirdeğin iki yanında buz katları; 3 katlıda uzun, her vuruşta iki uçtan bir kat kırılır (kısalır), son vuruşta kaybolur; vurulmadan geçilirse bir kat geri uzar (buz tekrar büyür). 1-2. bölümde dalgada 1 buz pim (3 kat), sonlara doğru hepsi buz ve kat sayıları karışık (1-3). Yön değiştir'de ortadaki ok YOK. Nabız'da ortadaki kalp yerine canlı EKG çizgisi (çemberle dönmez; fazladan atıştan önce sarıya döner). Işınlanma iki çıkışta: açık çıkış atan halkayla belli, kapalı olan soluk ve kilitli, açık olan anlık değişir (~1,1 sn); ibre yalnız açık olandan çıkar. Işınlanma 3. bölüm ortası Kasa 5 (20); 5. bölüm ortası 2 kanatlı değirmen (44), sonu 3 kanatlı (45). İki halka: halkalar arası geçiş köprüsü, üstünde akan oklar ibrenin gideceği halkayı gösterir; ibre ~0,6 sn kayarak geçer; İki halkayla Işınlanma birlikte gelmez (mantık çelişkisi), yerine nefes.

**Revizyon 3 (kullanıcı, 2026-11-10):** Buz pim görünüşü beğenilmedi (yalnız ortaya vurulacak ve hedef küçük sanıldı); 4 model gösterildi (A buz kabuğu, B katman plakaları, C sayılı buz, D eriyen buz), seçim bekleniyor. Yön değiştir ve Ritim'de ibrenin boş alanda uzun süre gitmesi oyunu soğutuyordu: Ritim notaları ibrenin hemen önünden başlar, Yön'de hedefler ibrenin iki yanına yakın konur (ters dönünce hemen hedef gelir). Nabız EKG'si sade: tek atış periyodu, ince, soluk. Işınlanma hatası düzeldi: ibre çıkarken o an açık olan kapıdan çıkar, ibre kapıdayken açık kapı değişmez. İki halka geçişi dik değil ÇAPRAZ: köprü ibrenin gittiği yönde eğik, ibre köprü boyunca ilerledikçe halka değiştirir (zamanla değil, yol boyunca).

**Revizyon 4 (kullanıcı, 2026-11-10):** Buz/Damla/Kristal/Sıçrayan denemeleri reddedildi; ORİJİNAL Sabır pimi (oyundaki kilitli mor hedef, altın noktalar, açılınca altın) geri geldi. Ek: her vuruşta bir nokta yanar ve kilitli hedef bir boy küçülür; vurulmadan geçilirse bir nokta söner ve hedef büyür (titrer). Noktalar dolunca altın açılır, son vuruş bitirir. 1-2. bölümde dalgada 1 sabır pimi (3 nokta); sonlara doğru birden çok, nokta sayıları farklı (3, 1, 2).

**Ekonomi notu (kullanıcı, 2026-11-10; ekonomi düzenlenirken yapılacak):** Altın her vuruşta/her açılışta çıkmasın. Normal bölümlerde 2-3 bölümde bir, zor bölümlerde 2 bölümde bir altın çıksın; her seferinde farklı miktar. Buna göre Sabır pimi açıldığında her zaman altın renginde değil, altın taşıdığı turda altın görünür (diğer zamanlarda şeftali açılır).

**ONAY (kullanıcı, 2026-11-11): 80 bölümlük düzen bu hâliyle KESİN** (`docs/bolumler-95.html`, 16 kilit × 5 bölüm, baş/orta/son). Oyundaki görünüş ve animasyonlar `docs/bolumler-akis-onizleme-v2.html` (V2 akış önizlemesi) ile yapılacak: parçalanma, kıvılcım, şok halkası, sarsıntı, dalga ışığı, sıvı, halka içi yıldızlar, liste ve tanıtım. Pimler oyunun kendi çizim kodu (drawPin ailesi) + bu belgedeki eklemeler (Trafik sarı uyarı, Sabır küçülmesi, Nabız EKG, Işınlanma açık/kapalı çıkış, İki halka çapraz köprü, Değirmen 2/3 kanat).
