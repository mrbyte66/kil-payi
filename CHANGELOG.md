# Sürüm notları

Sürüm adları `V0.x.y` biçimindedir. Her sürümün APK'sı `kil-payi-v0.x.y.apk` adıyla verilir ve git'te `v0.x.y` etiketini taşır;
"şu sürümdeki şu özelliği koru" denince bu adlar kullanılır. Her sürüm çıkarılınca bu dosya güncellenir, değişiklikler push'lanır.

## V0.10.2 — Mağazada ilk dokunuş artık kaybolmuyor (2026-10-22)

- **Mağazada "İçeri gir" ve alt şerit butonlarına ilk dokunuşta tepki vermeme düzeltildi** (kullanıcı: "mağazada İçeri gir butonlarına, alttaki butonlara 1 kere tıklayınca çalışmıyor, bazı caselerde"; ilk kez V0.9.9'da gelmişti, "yine"). Neden bulundu ve ölçüldü (başsız Chrome'da gerçek dokunuş benzetimi, parmağın basma-kayma-kalkma hâli): iki ayrı yutulan dokunuş vardı.
  1. **Vitrini kaydırdıktan sonra 350 ms boyunca HER dokunuş yutuluyordu.** Bir dükkânı kaydırıp hemen "İçeri gir"e ya da alt şeritteki simgeye basınca (300 ms içinde, yani çoğu kullanıcı) ilk dokunuş kayboluyordu, ikinci dokunuş çalışıyordu. Artık yalnızca o kaydırmanın kendi tıklaması (80 ms) yutuluyor, sonraki ayrı dokunuş anında çalışıyor.
  2. **Dükkânın kendisine (cepheye) 10 piksel ve üstü kayarak dokunmak hiçbir şey yapmıyordu**: parmak dokunurken doğal olarak biraz kayar, oyun bunu "kaydırma" sanıp dokunuşu yok sayıyordu (eşik 8 px). Eşik 18 px oldu; küçük kaymalı dokunuş artık dokunuş sayılıyor.
- **Yeni dokunuş katmanı**: parmakla yapılan dokunuş, parmak 18 px içinde kaldıysa parmak kalkarken DOĞRUDAN işlenir (basılan butona, parmağın nereye kaydığına bakılmaksızın; açılışta kayan cephelerde de çalışır); sonradan gelen yerel "click" aynı dokunuşun tekrarı sayılıp yutulur, yani hiçbir işlem iki kere olmaz. Fare, klavye ve erişilebilirlik (TalkBack) tıklamaları eskisi gibi çalışır. Fiş açıkken dışarıya dokunma da aynı katmandan geçer.
- **Önce/sonra (gerçek dokunuş benzetimi)**: kaydır → 30 ms → "İçeri gir": yutuldu → çalışıyor; kaydır → 30 ms → alt şerit: yutuldu → çalışıyor; cepheye 10 ve 14 px kaymalı dokunuş: yutuldu → çalışıyor; kaydır → 300 ms ve üstü zaten çalışıyordu. Tarayıcının kendi sınırı değişmedi: ~15 px üstü kaymada Android dokunuşu iptal eder (oyun bunu kaydırma sayar).
- Kapsam: mağaza (sokak, dükkân içleri, fiş, alt şerit). Menü ve oyun içi düğmeleri yerel tıklamayla çalışmaya devam ediyor.
- Emülatörde GERÇEK WebView ve gerçek parmak girdisiyle (adb input) denendi: eski sürümde kaydırıp hemen "İçeri gir"e basınca dokunuş yutuldu (oda açılmadı), V0.10.2'de ilk dokunuşta açıldı.
- Testler: `node tools/store-test.mjs` yeni **"dokunuş (gerçek)"** grubu (CDP touch ile 11 kontrol; V0.10.1 kodunda 3 hata verip bu düzeltmede geçiyor, yani gerçekten bu hatayı yakalıyor).

## V0.10.1 — Oyun dosyaları APK içinde AES ile şifreli (2026-10-22)

- **Oyun dosyaları artık şifreli** (kapalı testteki arkadaşın eleştirisi: "index öylece duruyor, şifrele"; kullanıcı: "mümkün olan her yeri şifrele"). V0.10.0'da APK'yı zip olarak açınca `assets/public/index.html` okunabiliyordu (JavaScript karıştırılmış olsa da HTML, CSS ve dosyanın kendisi ortadaydı). Şimdi APK'daki bütün oyun dosyaları (oyunun kendisi ve yazı tipleri) AES-256-GCM ile şifreli (`*.kpe`); uygulama çalışırken yalnızca bellekte açılıp WebView'e veriliyor, düz hâli diske hiç yazılmıyor. APK'da `index.html` yerine 318 baytlık boş bir yedek sayfa kaldı.
- **Anahtar APK'da hazır durmuyor**: uygulamanın içindeki bir parça ile Capacitor ayar dosyalarının özetinden çıkıyor; ayar dosyalarından biri değiştirilirse ya da şifreli dosyada tek bayt bozulursa oyun açılmıyor, "Uygulamanın bu kopyası değiştirilmiş görünüyor" uyarısı verip kapanıyor. Her dosya kendi yoluna bağlı: bir dosya başka bir dosyanın yerine konamaz.
- **Gerçek WebView'de denendi** (emülatör): normal açılış, Türkçe harfler (ğ ş ı), mağaza, bildirim izni ve planlama, ödüllü test reklamı ve ödül; değiştirilmiş APK denemeleri (şifreli oyun dosyasında 1 bayt, ayar dosyası, yazı tipi dosyası) hepsinde uyarı çıktı, zararsız yedek sayfayı değiştirmek oyunu etkilemedi; R8'li yayın derlemesinde de aynı. Oyunun içi, hızı ve akıcılığı V0.10.0 ile aynı (şifre çözme açılışta birkaç milisaniye, bellekte).
- **Artık iki APK var**: `kil-payi-v0.10.1.apk` deneme sürümü (kendi telefonunda dene: hata ayıklamaya açık, Java kodu karıştırılmamış) ve `kil-payi-v0.10.1-release.apk` **başkasına verilecek güçlü sürüm** (R8'li, hata ayıklamaya kapalı, Play'e gidenle aynı koruma). Play için `kil-payi-v0.10.1.aab` (versionCode 28).
- Dürüst sınır: anahtarı uygulamanın içine koymak zorundayız (çevrimdışı oyun, sunucu yok); kararlı biri Java kodunu çözüp anahtarı bulabilir ya da çalışırken bellekten okuyabilir. Bu katman "zip'i aç, dosyayı oku ya da değiştir" yolunu kapatır ve saldırganı karıştırılmış Java koduna yöneltir.
- Teknik: `tools/encrypt-assets.mjs` (cap sync'ten sonra, gradle'dan önce; `--selftest` var), `SecureAssets.java`, `SecureWebViewClient.java`, `SecureWebView.java` (+ `res/layout/capacitor_bridge_layout_main.xml`, ilk yüklemeyi bir tur erteler ki şifre çözen istemci kesin devrede olsun), `Integrity.java` mührü şifreli dosyayı kapsar, `build.gradle` `KP_A` ve mühür, `release.sh`/`release-aab.sh` sırası. Geliştirme derlemelerinde (şifreleme adımı çalışmaz) düz dosyalar sunulur.

## V0.10.0 — Ana ekranda donma düzeldi, oyun kodu karıştırıldı, kayıt imzalandı, değiştirilmiş kopya kapanıyor (2026-10-22)

- **Ana ekranda şeftali (ibre) donması düzeldi** (kullanıcı: "oyun ilk açıldığında ana ekranda şeftali dönerken donuyor"). Neden bulundu ve ölçüldü: V0.9.9'da eklediğim "görünmez mağaza ısınması" menü açıkken her açılışta mağazanın bütün efektlerini ekran kartına yüklüyordu; bu yüzden menüdeki ibre ilk 5-6 saniye boyunca 300 ms'den 2 sn'ye varan kare kayıplarıyla takılıyordu (ölçüm: ısınma açıkken menüde kare aralığı 2067 ms, kapalıyken 33 ms). Artık ısınma **yalnızca telefona kurduktan sonraki ilk açılışta** yapılır ve açılış ekranının devamı gibi görünen bir örtünün arkasında ("Oyun cihazına hazırlanıyor… (yalnızca ilk açılışta)", ilerleme çubuğu, ~3-6 sn); ekran kartı yetişene kadar bekleyerek ilerler, yavaş telefonda en çok 8 sn sürer. Sonraki açılışlarda hiç çalışmaz: menü ilk andan akıcıdır. Bildirim izin penceresi de örtü kalkana kadar bekler (ilk açılışta üst üste binmesin).
- **Genel donma taraması**: menü, oyun, ölüm kartı, ayarlar, mağaza, dükkânlar, fiş (CPU 4× yavaşlatılmış ölçüm): ana iş parçacığında uzun görev yok; kalan tek kare kaybı bir dükkâna ilk girişteki ekran kartı hazırlığıydı, o da yukarıdaki ilk açılış ısınmasıyla kapanıyor.
- **Oyun kodu karıştırıldı** (kullanıcı: "kaynak kodu açılamasın"): yayın sürümünde oyunun JavaScript'i artık düz okunmuyor (yorumlar silinir, adlar kısaltılır, bütün yazılar ve anahtarlar kodlanmış bir tabloya taşınır). Karıştırma sonrası kare hızı ve açılış etkilenmedi: oyun döngüsü kare başına ~0,02 ms (1×) / ~0,08 ms (4× yavaş telefon) fazla, açılışta +40 ms (4×); mağaza ve Cehennem testlerinin hepsi karıştırılmış kodla da geçiyor. HTML ve CSS okunur kalır; çevrimdışı çalışan bir oyunda kod hiçbir zaman tamamen gizlenemez, amaç kolay kopyalamayı ve kolay hileyi zorlaştırmaktır.
- **Kayıt imzalandı**: coin, joker, yuva, hediye, rekor kaydı artık kendi içinde bir imza (HMAC-SHA256) taşıyor. Biri kayıt dosyasını elle değiştirirse oyun bunu fark eder, ekonomi ve ilerleme sıfırlanır ("Kayıt dosyası değiştirilmiş görünüyor, sıfırlandı"), ayarlar ve dil korunur. Önceki sürümün imzasız kaydı bir kez kabul edilir ve imzalanır (kimse elindekini kaybetmez). Kaydetme maliyeti ihmal edilebilir (~0,06 ms).
- **Değiştirilmiş kopya açılmıyor** (kapalı testte bir arkadaşın APK'yı açıp oyunu değiştirmesi): uygulama açılırken oyun dosyalarının mührünü (SHA-256) derleme sırasında gömülen değerle karşılaştırır; tutmazsa "Uygulamanın bu kopyası değiştirilmiş görünüyor, lütfen aslını Google Play'den yükle" uyarısı verip kapanır. Denetim arka planda yapılır, açılışı yavaşlatmaz. Emülatörde gerçek bir değiştirilmiş APK ile denendi.
- **R8 etkin** (Play'in "kod karartma %1" uyarısı): Java kodu küçültülüp adları karıştırılıyor, yayın derlemesi (Play paketi) ~6 MB'a indi (telefona kurulan deneme APK'sı R8'siz ve ~12 MB kalır); reklam (Google test reklamı ve ödül), bildirimler ve kayıt R8'li yayın derlemesinde emülatörde doğrulandı. Play Console, çökme raporları için eşleme dosyasını AAB'den kendisi alır.
- Bilinçli olarak yapılmadı: AGP 9.0'a yükseltme (Capacitor 8.5.3 AGP 8.13 ile geliyor; R8 zaten açıldı) ve 16 KB bellek sayfası (Play zaten "destekliyor" diyor). Sunucusuz tam koruma yok: Play Integrity ya da sunucu doğrulaması gerekirdi (sunucu yok kuralı).
- Teknik: `tools/protect.mjs` (terser + javascript-obfuscator, hafif ayar: kontrol akışı düzleştirme ve ölü kod KAPALI), `PROTECT=1 ./build.sh`, `tools/smoke-release.mjs` (kancasız yayın derlemesi duman testi, ilk açılış yolu dahil), release scriptleri karıştırır ve duman testinden geçirir; `Integrity.java` + `BuildConfig.ASSET_SHA256` (build.gradle), `proguard-rules.pro`, `store-test` yeni "imza" ve ısınma grupları, `package.json` devDependencies (terser, javascript-obfuscator). Paket sürümü `0.10.0`, versionCode 27.

## V0.9.14 — Yeni ikon "Cam kadran", açılış ekranı, İngilizce telefonda ad "Close Call" (2026-10-21)

- **Yeni uygulama ikonu** (kullanıcı seçimi "Cam kadran", 4+4+4 alternatiften; "K harfi" Türkçe dışında anlamsız kalacağı için harfsiz ve dilden bağımsız): parlak cam kadran, içinde şeftali sıvı (süre) ve ibre, mor degrade zemin. Uyarlanabilir ikon (her telefonun kendi şekline uyar), Android 7 ve öncesi için ayrı simgeler, Android 13'te tema renkli tek renkli sürüm ve Play Store için 512 piksel görsel hazır. Kaynak ve üretim betiği `tools/make-icon.py`.
- **Açılış ekranı yenilendi**: Capacitor'un varsayılan beyaz/mavi "X" görseli yerine ikonla aynı mor degrade ve ortada kadran (Android 12 ve üstünde sistem açılışı mor zeminde ikonu gösterir).
- **Uygulamanın simge altındaki adı telefonun diline uyar**: Türkçe telefonda "Kıl payı", diğer dillerde (İngilizce dahil) "Close Call" (oyun içinde İngilizce başlık zaten "Close call").
- Oyun, görünüm ve ayarlar V0.9.13 ile aynıdır. Paket adı yine `com.mrbytestudio.kilpayi`.
- Teknik: `res/mipmap-anydpi-v26/ic_launcher.xml` (arka plan, ön plan, tek renkli), `mipmap-*/ic_launcher_*.png`, `drawable/ic_launcher_monochrome.xml`, `values/strings.xml` + `values-tr/strings.xml`, `values/colors.xml` (`splash_bg`), `styles.xml` (`windowSplashScreenBackground`), şablondan kalan eski vektör ikon dosyaları silindi.

## V0.9.13 — Paket adı kesinleşti: com.mrbytestudio.kilpayi (2026-10-21)

- **Uygulamanın paket adı `com.mrbytestudio.kilpayi` oldu** (kullanıcı onayı; yeni Play Console hesabı "mrbyte studio"). Geçici ad `com.mrbyte66.kilpayi` idi; Play'e ilk yüklemeden sonra paket adı değiştirilemediği için şimdi kesinleştirildi. Oyun, görünüm ve ayarlar V0.9.12 ile aynıdır.
- **Önemli:** bu paket adı eskisinden FARKLI bir uygulamadır. Telefona kurunca eski "Kıl payı" yanında ikinci bir uygulama olarak durur; kayıtlar (puanlar, coin, jokerler) ve kapalı test sayacı bu uygulamada sıfırdan başlar. Eski uygulamayı silebilirsin.
- Teknik: `capacitor.config.ts`, `android/app/build.gradle` (`namespace`, `applicationId`), `strings.xml`, `MainActivity.java` (klasörüyle) güncellendi; temiz derleme ve emülatörde bildirim akışı yeni paket adıyla denendi.

## V0.9.12 — Cehennem'de akıcılık, yumuşak ibre hızı, yakın vuruşta sarsıntı ve yavaş çekim yok (2026-10-21)

- **Cehennem'e geçerken ve Cehennem boyunca kasma giderildi** (kullanıcı: "Usta'da Cehennem'e geçerken 44 fps hissi, telefon kasıyor"). Neden bulundu ve ölçüldü: Cehennem arka planındaki iki ekran boyu görsel (alttan yükselen ateş parıltısı ve kenarları karartan vinyet) her karede yeniden çiziliyordu. Artık tek bir sabit katmandır, bir kez çizilir. İşlemci 3 kat yavaşlatılmış denemede Cehennem'de kare süresi **22,3 ms → 16,7 ms (yaklaşık 45 → 60 fps)**, geçişteki yavaş kare sayısı 30+ → 0. Çatlaklar ve kor aynen duruyor, görünüm değişmedi.
- Tema geçişi daha az yük bindiriyor: renk geçişi tam sayfa stil hesabını ~65 yerine ~28 kez yaptırıyor; ayrıca mağaza kapanınca 1200+ öğelik içeriği boşaltılıyor (oyun sırasında her tema geçişini ağırlaştırıyordu).
- **Son saniyedeki "yakın vuruşta" ekran sarsıntısı ve yavaş çekim kalktı** (kullanıcı: "son saniyelerde vurunca ekran sarsılıyor, oyun aniden hızlanıyor, çubuk saçmalıyor"). Eskiden yakın vuruşta ekran sarsılıyor ve zaman 0,14 sn boyunca 0,3 hıza düşüp bir anda normale dönüyordu (bu "aniden hızlanma"ydı). Parçacık, halka, yazı, ses, titreşim ve gül rengi parlama duruyor.
- **İbre hızı artık yumuşak değişir** (kullanıcı: "hızlanma soft olmalı"): her turda yeniden kurulan hız, Kum saati, girdap, kilit çarpanı ve ters yön eskiden bir anda değişiyordu; şimdi ~0,3 sn'de yumuşakça yaklaşıyor. Işınlanmada ibre yine anında durur ve çıkınca eski hızla sürer; gelgit hızı değişmedi.
- Zorluk dengesi korundu (bot karşılaştırması, her biri 150 oyun, V0.9.11'e karşı): Normal orta bot 10. seviyeye ulaşma %34 → %35, Usta usta bot %81 → %86; yalnızca Cehennem'de pro botta küçük bir sertleşme (%50 → %42).
- Testler: `node tools/store-test.mjs` yeni "oyun hissi" grubu (yakın vuruşta sarsıntı ve yavaş çekim yok, hız artışı, yön değişimi, kum saati, ışınlanma, Cehennem parıltısı katmanı, tema adımları, mağaza DOM'u), yeni `node tools/bot-run.mjs` (bot ile zorluk ölçümü, eski sürümle karşılaştırılabilir).

## V0.9.11 — Kapalı test bildirimleri (17 gün, günde iki kez), Hz satırı kalktı (2026-10-21)

- **Ayarlar'daki "Ekran 120 Hz" tanılama satırı kaldırıldı** (kullanıcı: "120 Hz yazıyor, onu kaldır"; 120 Hz isteği çalışıyordu). Pencerenin en yüksek yenileme hızını isteyen `MainActivity` kodu yerinde.
- **Kapalı test bildirimleri eklendi** (kullanıcı isteği, kapalı test aşaması için; Ayarlar'da kapatma anahtarı YOK): uygulama ilk açıldığı gün ve saati kendi içinde tutar ve 17 gün boyunca bildirim gönderir. (1) **Uygulama açıldıktan, bildirim izni verildikten 1 dk sonra bilgilendirme**: "Kapalı test başladı · 17 gün boyunca günde iki kez haber vereceğiz. Teşekkürler!". (2) **Her gün sabah 09:00 ve akşam 16:30** (başlık "Kıl payı · Gün n/17", gövde kısa bir teşekkür ve oynamaya teşvik; altı farklı metin döner). **O gün oyuna girildiyse ikinci bildirim gönderilmez** (uygulama her açılışta bugünün 16:30 bildirimini iptal eder). Bildirimler yüksek öncelikli kanalda gelir (ekranın üstünde kısa süre belirir, olmazsa bildirim çubuğunda); telefon kapalı/uygulama kapalıyken de gelir ve telefon yeniden açılınca kendiliğinden yeniden kurulur. Türkçe ve İngilizce metinler (telefonun diline göre). Android 13 ve üstünde ilk açılışta menüde sistemin bildirim izni penceresi çıkar.
- **Bildirime dokununca "Gün n/17" kartı açılır**: 17 noktalı ilerleme (geçen günler lila, bugün şeftali), kısa teşekkür metni, "Oyna" ve "Kapat". Oyun sürerken dokunulursa oyunu bölmeden kısa bir bildirim satırı gösterilir. 17. günden sonra bildirim gelmez, kart "Test tamamlandı" der.
- Teknik: `@capacitor/local-notifications` 8.3.1 eklendi; tam zamanlı alarm KULLANILMAZ (eklentinin varsayılanı "Alarmlar ve hatırlatıcılar" ayar ekranını açardı), bu yüzden bildirimler ±1 dk kayabilir ve gereksiz `SCHEDULE_EXACT_ALARM` izni manifestten çıkarıldı. Durum çubuğu simgesi `ic_stat_kilpayi` (halka ve ibre).
- Testler: `node tools/store-test.mjs` (sahte eklentiyle izin, kanal, planlama, bilgilendirme zamanı, tarih mantığı: 08:00 ve 20:00 kurulum, 10. gün, 17. ve 18. gün, yaz saati geçişi, ikinci bildirimin iptali, dokununca kart, oyundayken satır, izin reddi, Ayarlar'da anahtar yok); emülatörde gerçek uçtan uca deneme (izin penceresi, alarmlar, bildirimin gelmesi, dokununca kart).

## V0.9.10 — Geri tuşu ilk dokunuşta çalışır, oyun içi Duraklat düğmesi, "128 / 180" hedef rozeti (2026-10-21)

- **Mağazadan çıkarken geri tuşuna 2 kere basma sorunu giderildi** (kullanıcı: "mağazadan çıkarken geri tuşunda hâlâ 2 kere tıklıyorum"). Dükkâna girdikten yaklaşık 1 sn içinde (giriş animasyonu sürerken) geri tuşuna ilk basış yutuluyordu (ekrandaki geri düğmesi ve telefonun kendi geri tuşu); ikinci basışta çalışıyordu. Artık geri, oda göründüğü anda çalışır; bekleyen giriş/oda değişimi işleri anında bitirilir (yakınlaşma, ışık, değişim zamanlayıcısı), sokak temiz döner.
- **Doğrudan girilen dükkândan geri menüye döner**: menüdeki joker yuvalarından ya da Ayarlar'dan bir dükkâna doğrudan girdiysen (fiş ya da seçici açıkken) geri artık seni sokağa değil geldiğin yere (menü) götürür; eskiden bir geri daha gerekiyordu. Sokaktan girdiğinde geri yine sokağa döner.
- **Oyuna Duraklat düğmesi eklendi** (kullanıcı seçimi "A, sağ üst köşe", dört yerleşimden): yuvarlak beyaz düğme, menüdeki Ayarlar düğmesiyle aynı dil; koyu temada uyum sağlar. Köşelere oyun dokunuşu en az geldiği için yanlışlıkla duraklatma riski düşük; düğme olduğu için oyun dokunuşu sayılmaz. Dene modunda görünmez. Telefonun geri tuşu duraklatmaya devam eder.
- **"Rekor 180" çipi kalktı, yerine puanın yanında "128 / (180)"** (kullanıcı: "rekor yazısı çok yer kaplıyor, 128/180 diyelim, 180'i aşılması gereken hedef olarak çerçeveyle işaretleyelim"): 180 lila çerçeveli bir rozet. Rekor geçilince rozet altın olur ve tik alır (eskiden altın "En iyi" çipi skorla birlikte yükseliyordu). Henüz rekor yokken (ilk oyun) rozet görünmez. "puan" yazısı da kalktı, büyük sayı zaten puandır.
- Testler: `node tools/store-test.mjs` (geri tuşu: ilk dokunuş, Android geri, değişim sırasında geri, doğrudan giriş; HUD: duraklat düğmesi, hedef rozeti, altın hâl, Dene modu; HUD grubu `DEBUG=2` derlemesiyle çalışır çünkü `DEBUG=1`'de `pause()` kapalıdır).

## V0.9.9 — Mağazada ilk girişin kasması giderildi: görünmez ısınma, kayan cepheye dokunuş yedeği (2026-10-20)

- **Mağazaya ilk girişte, ilk "İçeri gir"de ve ilk dokunuşlarda kasma giderildi** (kullanıcı: "ilk girdiğimde animasyon sonrakilerle aynı değil, kasıyor; İçeri gir'e ilk tıklayınca da; bazı yerlerde ilk tıklama kasıyor"). İzde ana iş parçacığı ilk girişte ikincisinden ağır değildi; fark ekran kartı tarafındaydı: her efekt (degrade, gölge, bulanıklık, yazı) ilk kullanımda hazırlanır, katmanlar ilk kez açılır. Çözüm: **menü ilk kez ~1,3 sn boşta kalınca mağaza menünün üstünde GÖRÜNMEZ biçimde bir kez baştan sona oynatılır** (açılış, dükkâna giriş yakınlaşması ve ışık, dört dükkân, kağıt fiş, yuva seçici, kaydırma, çıkış, ardından Ayarlar/Kilit defteri/Duraklat/Oyun sonu kartlarının bulanık arka planı). Opaklık 0,006'dır, hiçbir şeye dokunulamaz; sen bu sırada mağazaya girersen ya da oyun/pencere açarsan ısınma anında bırakılır ve sonraki boşta yeniden denenir. Her uygulama açılışında bir kez çalışır (~6,5 sn). Gerçek ekran kartlı Chrome'da ölçüm: ilk girişteki 67 ms'lik kare takılması ısınmayla 0'a indi.
- **Dükkânlara ilk dokunuşta "tepki vermiyor" düzeltildi**: açılışta cepheler yukarı kayarak girer, kaydırma oturur; parmak basarken öğe altından kayarsa tarayıcı dokunuşu iki öğenin ortak üstüne verir ve eylem sessizce kaybolurdu. Artık parmak çok oynamadıysa (16 px) eylem basılan öğeye verilir.
- Mağaza açılışında boşuna bir dükkân odası kuruluyordu (içeri girince zaten kuruluyor); kaldırıldı, açılışta daha az iş yapılıyor.
- Testler: `node tools/store-test.mjs` (ısınma: başlar, görünmez, menü düğmelerine dokunuşu engellemez, bitince eski durum, girişte ve pencerede bırakılır; dokunuş yedeği), yeni `node tools/cold-gpu.mjs` (gerçek ekran kartlı Chrome'da taze profille ısınmalı/ısınmasız ilk giriş karşılaştırması).

## V0.9.8 — 120 Hz isteği, kaydırma animasyonu bileşende, gökyüzü dükkânların arkasında, fiş açılışı, yavaş ölme (2026-10-20)

- **Oyun artık ekranın en yüksek yenileme hızını ister** (kullanıcı: "kaydırırken 44 fps hissi veriyor, 120 fps bekliyorum"). Android, uygulama istemezse pencereyi çoğu telefonda 60 Hz'e (ya da dalgalı bir değere) bırakabiliyor; `MainActivity` artık aynı çözünürlükteki en hızlı ekran modunu seçer. Ayarlar'ın altına **tanılama satırı** eklendi ("Ekran 120 Hz · WebView 13x · 411×915 · ×2.63"): hız, kare aralığından ölçülür; telefonun gerçekten kaç Hz çalıştığı buradan görülür (60 yazarsa ekran modunu telefonun kendi ayarından da kontrol et: Ekran > Yenileme hızı > Yüksek).
- **Kaydırma animasyonu artık bileşen iş parçacığında** (Web Animations): parmağı bırakınca ve dock kısayollarında şerit ana iş parçacığına bağlı kalmadan kayar; sürüklerken yalnızca tek bir transform yazılır. Dock ve "İçeri gir" yazısı animasyon başlar başlamaz yeni dükkâna geçer. Kaydırırken artık hiçbir animasyon durmaz ya da kalkmaz (V0.9.7'deki "mv" kalktı: kaydırma başlarken katman değişimi takılma yaratıyordu); odaktaki cephe belirleme kaydırma bitince (140 ms) hareketsizleri **duraklatır** (katman yok etmez).
- **Sokakta fazla küçük süsler kalktı** (katman sayısı 93 → 77): halka simgesinin zıplaması ve pencere yıldızlarının ikisi; her biri ayrı bir katmandı. Cephe duvarının gölgesi daha ucuz (blur 44 → 30). Görünmeyen görünümler, fiş ve karartma `visibility` ile çizim dışı kalır; mağaza açıkken oyun tuvali ve HUD çizilmez.
- **Fiş (Yuva 1 vb.) iki kere açılıyormuş gibi görünmüyor**: fiş önce görünmez çizilir (iki kare), sonra alttan kayar; eskiden içi henüz çizilmemiş boş fiş kayıp sonra dolduğu için "iki kere açıldı" izlenimi veriyordu. Geri tuşu bu aşamada da fişi kapatır.
- **Gündüz gökyüzü yeniden tasarlandı** (kullanıcı: "bulutlar ve kuşlar dükkânın önünde olmasın, çok hızlı, çok basit, kaydırırken duruyor"): bulutlar ve kuşlar artık dükkânların **arkasında, çatı hattının üstündeki gökyüzünde**; iki derinlikte (uzak soluk ve küçük, yakın büyük ve beyaz) üç ayrı bulut biçimi (kabarık, yassı, topak) ve gölgeli iki tonlu çizim; **2,3 kat yavaş** (yakın bulut 150 sn, uzak 260 sn'de bir geçer); kuşlar iki kanatlı ve kanat çırpar (üç yakın kuş sürüsü, bir de uzak sürü); **kaydırırken de akmaya devam eder**. Bulut gölgeleri dükkânların ve sokağın üstüne düşer.
- **Ölme animasyonu 0,5 sn daha yavaş** (kullanıcı isteği): sonuç kartı 1,45 yerine **1,95 sn** sonra gelir (alev 1,0 sn, kor yaklaşık 7 sn sürer).
- Testler: `node tools/store-test.mjs` (fişin ön raster aşaması, yeni gökyüzü, kaydırma), `node tools/hell-test.mjs` (yeni ölme zamanları).

## V0.9.7 — Mağazada kaydırma yeniden yazıldı, gündüz gökyüzü, yavaş ölme animasyonu, animasyonlar açık (2026-10-20)

- **Dükkânları parmakla kaydırmak yeniden yazıldı** (kullanıcı: "ekranda elimle kaydırırken hiçbir şey göremiyorum, bir kaydırıyorum bir anda Hediye dükkânındayım; kısayollardan kayarak gidiyor, elle kaymıyor"). Emülatörde (WebView 155) yerel kaydırma çalışıyordu; yani sorun telefonun WebView'inde kaydırma + snap + fling zincirindeydi ve oradan göremiyorum. Bu zincir yerine **kendi sayfalayıcım** var: parmak dükkân şeridini birebir izler, bırakınca **en çok bir dükkân** ilerler ve 0,25-0,45 sn'lik animasyonla oturur (en sert fırlatma bile tek dükkân ilerletir; kısayollar eskisi gibi kayarak gider). Kenarlarda yaylanır, sürükleme bitince gelen tıklama dükkâna girmez; fare ve bilgisayarda yatay tekerlek de çalışır. Kaydırırken süs animasyonları kalkar (aynı anda çizilen katman 69 → 27) ve durunca geri gelir. Gökyüzü paralaksı ve yerel kaydırma kalktı (silüetler sabit).
- **Gündüz gökyüzü** (kullanıcı: "bulutlar çok belli olmuyor, dükkânın üstünde olsun, kuşlar, gölge efekti de olabilir"): bulutlar büyük, beyaz ve dükkânların **önünden** geçer (çatı hattının üstünde, tabelayı kapatmaz), **bulut gölgeleri** cephelerin ve sokağın üstünden aynı hızda kayar, **kuş sürüsü** kanat çırparak geçer (daha büyük ve koyu). Başlık, "İçeri gir" düğmesi ve alt şerit bulutların üstünde kalır. Her efekt tek bir şerit olarak hareket eder (az katman). Koyu cephelerde cephe gölgesi silik kalır, sokaktaki gölgeler belirgindir.
- **Ölme animasyonu yavaşladı** (kullanıcı: "yandıktan sonra hemen ana menü geliyor, biraz yavaş geçsin"): alev ve kor 1,7 kat yavaş; sonuç kartı 0,85 yerine **1,45 sn** sonra gelir, kor kartın arkasında yaklaşık 5 sn sürer.
- **Animasyonlar varsayılan açık** (kullanıcı isteği): denerken kapatılmış olabilirdi; bu güncellemede bir kez açılır, sonra seçimin korunur (anahtar şimdilik duruyor).
- Testler: `node tools/store-test.mjs` kaydırma için yapay parmak olaylarıyla denetler (şerit parmağı izler, yavaş sürükleme aynı dükkânda kalır, çok sert fırlatma tek dükkân ilerletir, ters yön, uçlarda taşmaz, sürükleme sonrası tıklama girmez, kaydırırken animasyonlar kalkar ve geri gelir, eski kayıtta animasyon açılır); `node tools/hell-test.mjs` 39 kontrol (yavaşlayan yanma dahil).

## V0.9.6 — Oyuncu yanınca "Kül ve kor", Cehennem çemberinin dönüş programı (2026-10-20)

- **Oyuncu yanınca çember yanıp küle döner** (kullanıcı seçimi "B. Kül ve kor", 4 canlı örnekten; "yalnızca Cehennem'de değil, her kademede olsun" dedi). Ölünce çember 0,45 sn turuncu-kırmızı alevlenir, sonra kaybolur; 8 çember parçası yavaşça dağılıp düşer, yaklaşık 150 kor yukarı sürüklenir ve közden küle solar; kalan süre yazısı da solar. Sonuç kartı eskiden 0,6 sn sonra gelirdi, şimdi 0,85 sn sonra gelir (alev görünsün diye), kor kartın arkasında 3 sn kadar sürer. **İkinci şans** alınırsa kor temizlenir ve çember ortadan dışa doğru yeniden belirir. Açık ve koyu temada denendi (Cehennem'de kor çok iyi görünür, açık temada soluk sarı kor biraz silik kalır). "Animasyonlar" anahtarı kapalıysa ve Dene modunda yok (eski davranış).
- **Cehennem çemberi: dönüş programı** (kullanıcı seçimi "1. Yumuşak yön değişimi"): **Seviye 1-2'de dönmez** (yalnızca nefes alır), **Seviye 3-5'te tek yönlü ve yavaş** döner (4 → 10 °/sn, ibrenin tersine), **Seviye 6-10'da iki yönlü karışık** döner (12 → 20 °/sn): yön 5-9 saniyede bir rastgele değişir, çember yavaşça durur ve ters yöne döner. Nefes aynen sürer. Çentikler halkanın 2,5 katı hızda aynı yönde döner (eskiden hep dönüyordu, Seviye 1'de bile).
- **Spiral kalktı** (kullanıcı isteği): Cehennem çemberinin içindeki sarmal çizim artık yok.
- **Sıvı artık çemberin dönüşünü izlemez** (kullanıcı: "içerideki sıvı dönmenin momentumunda kalmasın"): eskiden sıvı yüzeyi de çemberle birlikte dönüyordu (sıvı döndürülmüş çizim bağlamında çiziliyordu); şimdi hep yatay ve sakin kalır, yalnızca nefesle birlikte büyüyüp küçülür.
- Testler: yeni `node tools/hell-test.mjs` (35 kontrol): dönüş programı (seviye seviye, yön değişimi, hız sınırı), sarmalın olmadığı, sıvının dönmediği (çizim bağlamı), her kademede yanma ve zamanlaması, ikinci şansta yeniden belirme, Animasyonlar kapalıyken ve Dene'de yok.

## V0.9.5 — Mağazada dükkânları kaydırmak akıcı (2026-10-20)

- **Dükkânları kaydırırken kasma giderildi** (kullanıcı: "animasyonlardan kaynaklı çok kasıyor, telefonum hızlı; kapatma seçeneği istemiyorum, kasmayacak şekilde performans odaklı çalışsın"). Ölçtüm: kaydırırken her karede gökyüzündeki iki büyük silüet yeniden çiziliyor, "İçeri gir" düğmesinin yazısı yeniden yazılıyor, sayfa yeniden hesaplanıyordu (iki kaydırmada ~190 boyama ve 52 yerleşim); üstüne sokakta aynı anda 65 animasyon ve 134 katman vardı. Düzeltmeler:
  (1) gökyüzü paralaksı artık ekran kartında çalışır (ScrollTimeline: ana iş parçacığına hiç dokunmaz; çok eski bir WebView'de silüet sabit kalır); (2) kaydırma işleyicisi kare başına en çok bir kez çalışır ve yalnızca dükkân değişince bir şey yazar; (3) yalnızca **odaktaki dükkânın** ve alttaki **seçili simgenin** süsleri hareket eder, ötekiler durur (hareketli katman 65 → ~38), dükkânın içindeyken sokak, sokaktayken dükkân içi hiç oynamaz (eskiden görünmeyen oda boşuna dönüyordu), odak kaydırma durunca (0,14 sn) değişir, yani kaydırırken hiçbir animasyon başlamaz ya da durmaz; (4) biten animasyonlar artık katman bırakmaz (mağaza ve menü kartlarında "fill" kalktı); (5) kapı ışığı katmanı yalnızca dükkâna girerken vardır.
  Ölçüm (masaüstü, ekran kartıyla): katman 134 → 90, kaydırırken ana iş parçacığında boyama ~75/sn → ~23/sn, yerleşim 52 → 4, "İçeri gir" düğmesinin boyaması 52 → 0. Gerçek telefonda denenmedi (emülatör ölçümü Mac'in yüküyle çok dalgalı çıktı); telefonda hâlâ takılma varsa haber ver.
- **Animasyonlar anahtarı şimdilik duruyor** (kullanıcı: "ihtiyacımız olmasın, kaldırma sonra"): kasma tamamen bitince kaldırılacak.
- **Sokağa dönünce vitrin, az önce içinde olduğun dükkânı gösterir.** Dükkândan dükkâna geçtiysen eskiden "İçeri gir" düğmesi ve alt şerit görünen dükkânla uyuşmayabiliyordu.
- Testler: `node tools/store-test.mjs` 136 kontrol (yeni: sokaktaki sonsuz animasyonlar dükkânın içindeyken durur, yalnızca odaktaki cephe hareketli, bitmiş animasyon katman bırakmaz, kaydırınca düğme yeniden yazılmaz, sokağa dönünce doğru dükkân). Yeni araç `node tools/perf-store.mjs` (GPU=1): sokağın katman sayısı, boyama ve iş parçacığı yükü, animasyon gruplarını tek tek durdurarak karşılaştırır.

## V0.9.4 — Animasyonlar telefonda da çalışıyor (2026-10-20)

- **Animasyonların görünmemesinin asıl sebebi bulundu** (kullanıcı: "mağazaya, dükkânlara girerken çıkarken animasyon yok, İçeri gir deyince animasyon yok, animasyonlar zayıf"). Telefonunda Android'in **"animasyonları kaldır"** ayarı açık (V0.9.2'deki "konfeti yok" şikâyeti de buydu). Oyun bu ayara uyup animasyonları kapatıyordu: mağaza geçişleri, dükkâna giriş, konfeti, menü ve kartların beliriş animasyonları, ekran sarsıntısı, süre kabındaki dalga, Cehennem çemberi, satın alma parıltısı... telefonunda hiçbiri görünmüyordu (benim denemelerimde göründü, çünkü emülatör ve tarayıcıda o ayar kapalıydı; bu yüzden fark etmedim). **Artık oyun telefonun bu ayarına bakmaz.** Ayarlar'a yeni bir **Animasyonlar** anahtarı geldi (varsayılan açık; telefonda ayar kapalıysa altında "Telefonunda kapalı; burada açık kalır" yazar). Kapatırsan eski "sakin" davranış sürer: ekranlar anında değişir, konfeti ve sarsıntı azalır.
  Bunu gerçek Android WebView'inde, "animasyonları kaldır" ayarını açarak denedim: WebView ayarı oyuna "azaltılmış hareket" diye bildiriyor, yeni sürüm aldırmıyor ve geçişler oynuyor.
- **Mağaza açılışı daha belirgin:** mağaza ekranın ortasından yakınlaşarak belirir (eskiden sol üst köşeden, hafifçe); başlık yukarıdan iner, dükkân cepheleri sırayla alttan yükselir (seçili olan önce), "İçeri gir" düğmesi zıplayarak gelir, alt şerit aşağıdan çıkar.
- **"İçeri gir"de kapıdan ışık:** sokak seçilen dükkâna daha çok yakınlaşır (×2,2 yerine ×2,4), sıcak bir ışık yayılır, oda ışığın altında belirir ve ışık sönerek odayı açar. Açılış animasyonu bitmeden basarsan animasyon bırakılır, giriş gecikmez.
- **Küçük cilalar:** Ayarlar satırları ve seviye düğmeleri basınca hafifçe küçülür.
- **Yarım kalan doğrulamalar tamamlandı** (gerçek WebView'de, emülatörde, gerçek dokunuşla): dil değişimi (Sistem / Türkçe / English, anında), gündüz sokağı (mavi gökyüzü, güneş, bulut, ışıklar kapalı), Hediye odası ve 24 saatlik kadran (1 saat sonra "23 sa sonra yenilenir", ibre 15° ilerler, 20 ve 30 işaretli, sırada 40), Ayarlar'daki yeni anahtar, mağazaya giriş / dükkâna giriş / geri / çıkış, oyuna başlama ve oyun sonu kartı.
- Not: yazılımla çizen emülatör, geçişin ilk karelerini yavaş çizer (büyük sahnenin ilk boyanışı); gerçek telefonlarda ekran kartı bunu hızla yapar. Telefonda takılma görürsen Ayarlar > Animasyonlar'ı kapatabilirsin; haber verirsen geçişleri hafifletirim.
- Testler: `node tools/store-test.mjs` artık 131 kontrol yapar (yeni **animasyon** grubu: telefonun "animasyonları kaldır" ayarı taklit edilir, oyunun yine animasyonlu olduğu, açılış / giriş / geri / çıkış / dükkândan dükkâna geçişlerin oynadığı ve anahtar kapanınca anında olduğu doğrulanır; eski kayıtta anahtarın açık geldiği). Yeni araç `tools/anim-frames.mjs` geçişleri kare kare çıkarır (zamanlayıcılar ve animasyonlar elle ilerletilir).

## V0.9.3 — Dil seçimi, menü müziği, mağazaya gündüz ve akşam, yumuşak geçişler, düzen düzeltmeleri (2026-10-20)

- **Dil artık Ayarlar'dan seçilir** (kullanıcı isteği: "ilk yüklendiğinde sistem diliyle gelsin ama ayarlardan desteklenen diller arasında seçilebilsin"). Ayarlar'daki Dil satırında üç düğme var: **Sistem** (telefonun dili; Türkçe ya da İngilizce, başka dilde İngilizce), **Türkçe**, **English**. İlk kurulumda "Sistem" seçilidir. Seçince oyun yeniden başlatmadan hemen o dile geçer; tercih kaydedilir.
- **Menü müziği** (kullanıcı isteği: "boş menüde gezerken oyunun müziği olmalı, açılıp kapatılabilsin"). Dosya ve internet yok: müzik oyunun içinde, çalarken üretilir (sakin bir "gece pazarı" havası: yumuşak akor örtüsü, yankılı küçük bir arpej, ara sıra çan ve pırıltı; dört akor, dakikada 72 vuruş, her ölçüde arpej değişir, tekrar yormaz).
  **Menüde, mağazada, ayarlarda ve kilit defterinde** çalar; oyun başlayınca (ya da Dene, ikinci şans, reklam sırasında) yumuşakça susar, menüye dönünce geri gelir; uygulama arka plana geçince durur. Ayarlar'da yeni **Müzik** anahtarı var (varsayılan açık); eski "Ses" satırı **Ses efektleri** oldu ve müzikten bağımsızdır.
  Ben kulakla dinleyemedim: ses düzeyi ve tonu ölçümle ayarlandı (tepe −17 dB, kırpma yok, düşük frekans payı azaltıldı). Beğenmezsen tarzı ya da sesi değiştiririm.
- **Mağazaya gündüz ve akşam** (kullanıcı isteği). Telefonun saati **06:30-18:00 arasıysa gündüzdür**: gökyüzü mavi, güneş, bulutlar ve kuşlar var, ışıklar ve lambalar yanmaz, dükkânlar aynıdır. Akşam ve gece (18:00 sonrası) mevcut tasarım aynen sürer, üstüne **arada bir kayan yıldız** düşer. Mağaza açıkken saat dilimi geçerse sahne kendiliğinden değişir.
- **Mağaza düzeni düzeltildi** (kullanıcı geri bildirimi): "İçeri gir" düğmesi ile alttaki şerit çakışıyordu; dükkân biraz alçaldı, düğme ile şerit arasında rahat boşluk var (küçük, orta ve uzun ekranlarda denendi). Alet çantası dükkânının tabelasında "Rafta 1 / 7 açık" yerine açık yazan **Joker 1/4** ve **Yuva 1/4** çubukları var; Yetenekler dükkânı "Açık yetenek 0/2" der.
- **Hediye: son ödül 500 coin**, ve **24 saatlik pencere** (kullanıcı isteği): ödüller sırayla **20 · 30 · 40 · 50 · 500**. 24 saatlik süre **ilk reklamı izlediğin anda** başlar; süre dolunca hakların baştan başlar (en baştaki 20 coin'e döner), kaç reklam izlemiş olursan ol. Beş reklamı da izlediysen düğme "X saat sonra gel" der (X = pencerenin bitmesine kalan süre). Odadaki büyük kadran bu **24 saatlik saattir**: ibre geçen süreyi gösterir, yeşil yay kalan süredir; altında "Hediyeler 22 saat 40 dk sonra yenilenir" yazar. Sürenin kaynağı telefon saatidir (geri alınırsa pencere 24 saati aşmaz). V0.9.2'deki 12 saatlik bekleme kalktı.
- **Yumuşak geçişler ve eksik animasyonlar** (kullanıcı geri bildirimi: "+'ya basınca çat diye geçiyor"). Ana ekrandan mağazaya girerken mağaza alttaki ekranın üstünde yakınlaşarak belirir, çıkarken solar ve menü yukarı doğru yeniden belirir (eskiden sert açılıyor ve kapanıyordu). Sokaktan dükkâna girişte kapıya yakınlaşılır, geri dönüşte uzaklaşılır, dükkânın içindekiler sırayla belirir. **Coin çubuğundaki +** artık sokakta önce Hediye dükkânının önüne kayar sonra girer, bir dükkânın içindeyken oda yumuşakça değişir.
  Satın alınan ürün sıçrar ve üstünde parıltı patlar (joker açma, yuva açma, stok, yükseltme, Otomatik joker, reklam hediyesi), menüdeki çanta yuvası değişince sıçrar, menüdeki coin sayısı değişince saymaya başlar. Geçiş sürerken dokunuşlar yok sayılır (çift dokunuşla iki geçiş başlamaz). Animasyonları azalt açıksa hepsi anında olur.
- **Türkçe harfler yazı tipine uydu** (kullanıcı: "Mağaza'daki ğ sırıtıyor"). Sebep: oyunun başlık yazı tipi Fredoka **ğ Ğ ş Ş İ harflerini hiç içermiyor**; bu harfler başka bir yazı tipinden (Nunito) geliyordu ve "Mağaza", "İçeri gir", "Şeftali", "Işınlanma" gibi başlıklarda farklı duruyordu. Bu beş harf Fredoka'nın kendi parçalarından (s, S, g, G, I, çengel, nokta; breve yeni çizildi) üç kalınlıkta üretildi (`tools/make-tr-glyphs.py`, 1,4 KB'lık üç dosya) ve yalnızca bu harflere bağlandı. Tuvaldeki yazılar için de yüklenir.
- **Ayarlar kısa ekranda taşmaz** (5 satır oldu): kart kaydırılabilir, satırlar küçük ekranda sıkılaşır. Mağaza alt başlığı kısaldı ("Dükkânları gez").
- **Hız:** geçiş animasyonları ve büyük katmanlar önceden katman yapıldı (`will-change`); bilgisayarda hepsi 60 kare/sn. Yavaş emülatörde bile en kötü takılma yarıya indi; gerçek telefonlarda GPU ile daha akıcıdır.
- Testler: `node tools/store-test.mjs` artık 106 kontrol yapar (fiyat ve stok, 24 saatlik hediye, eski kayıt geçişleri, mağaza akışı ve geçişleri, gündüz/akşam, müzik, dil, Türkçe harfler); başsız Chrome'u `tools/cdp.mjs` ile sürer. Emülatörde gerçek WebView'de denendi (müzik gerçekten çalıyor: ses akışı açık, dil değişimi, geçişler, Hediye, gündüz/akşam).

## V0.9.2 — Mağaza (akşam çarşısı), joker yuvaları, Otomatik joker, Hediye, rekor kutlaması düzeltmesi (2026-10-19)

- **Mağaza: dükkân dükkân gezilen akşam çarşısı** (kullanıcı isteği: "genel bir alışveriş yeri olsun, jokerler, yetenekler... dükkânlar; şık, albenili, wow"; 5 tasarım yönü çizildi, **"Çarşı + halka ikonları"** seçildi). Ana ekranda üstteki çanta düğmesi ve ölünce çıkan kartta "Mağaza" düğmesi sokağı açar: dört dükkân yan yana, kaydırarak gezilir, altta halka simgeli bir şerit vardır (Alet · Yetenek · Görünüm · Hediye), "İçeri gir" ile dükkâna yaklaşılır.
  Ürünler rafta durur, dokununca **kağıt fiş** açılır (ad, açıklama, fiyat, satın alma düğmesi). Her ikon oyunun kendi halkasıdır: ibre döner, joker ortada durur, yay jokerin seviyesi kadar dolar. Eski "Alet çantası" penceresi kalktı. Geri tuşu: önce fiş, sonra dükkân, sonra mağaza kapanır.
  Sahne tek bir tasarım alanında çizilip ekrana oranlanır: küçük ve uzun telefonlarda, açık ve koyu temada, Türkçe ve İngilizce denendi (mağaza gece sahnesidir, tema ne olursa olsun koyu kalır).
- **Başlangıçta yalnızca 1 joker (Kronometre) ve 1 yuva var** (kullanıcı isteği: "joker 1 ile başlasın, kilitli olsun; 2. jokeri açıp 2. yuvayı açmadıysan ikisinden birini seçerek oyuna alabilmeliyim"). Joker kilitleri ve yuvalar coinle açılır, **fiyatlar kasten sıkı** (bir Normal oyun ≈ 85 coin):
  Kalkan 800, Steteskop 1.500, Kum saati 2.500; 2. yuva 1.200, 3. yuva 2.400, 4. yuva 4.000; Otomatik joker 4.000. Hepsini açmak yaklaşık 190 Normal oyun (17 saat) sürer.
  Oyuna yalnızca **yuvalardaki jokerler** girer; oyun içindeki joker sırasında yalnızca onlar görünür. Yeni joker boş bir yuva varsa kendiliğinden takılır; yuvadan fazla joker varsa seçim yapılır: **menüdeki çanta satırından** bir yuvaya dokun (seçince menüye dönersin) ya da Mağaza'da Alet çantası dükkânında kemerdeki kılıfa dokun. Takılı olan başka yuvadaysa yerleri değişir, "Boş bırak" da var.
  Menüde yeni **çanta satırı**: dört yuva (dolu: joker ve stok sayısı, boş, kilitli; sıradaki kilitli yuva nabız gibi atar) ve "Çanta · 1 / 4 yuva · Mağaza ›". Yeni bir şey alınabilecek durumdaysa Mağaza düğmesinde altın nokta yanar.
- **Stok kuralları** (kullanıcı isteği: "ikinci stok daha pahalı, üçüncü daha da; en çok 5; stok artırma mağazada satılsın; varsayılan 1'den başlasın"): her joker stoğu **1** ile başlar (açılışta 1 tane gelir), **en çok 5** olur. "+1 al" fiyatı elindeki sayıyla artar: Kronometre, Steteskop, Kum saati **30 → 45 → 60 → 90 → 120**, Kalkan **40 → 60 → 80 → 120 → 160**. Stok doluyken düğme "Stok dolu" der. Hediye jokerleri (Cehennem sonu ödülü) yalnızca açık ve stoğu dolmamış jokere gelir.
- **Yükseltme–alma açığı kapatıldı** (kullanıcı: "jokerleri alırım alırım öyle yükseltirim, ucuza yükseltmiş olurum"). Eskiden tane fiyatı sabit, yükseltme de stoktaki bütün jokerleri etkilediği için önce biriktirip sonra tek yükseltmek çok ucuzdu. Şimdi iki kural var:
  (1) **Seviye yükselince jokerin tanesi de pahalanır** (seviye 2 ×1,3, seviye 3 ×1,6; Kronometre seviye 3'te 50 · 70 · 95 · 145 · 190). (2) **Yükseltme, elindeki stoğun yükselen değerini de öder**: stok doluyken yükseltmek pahalıdır (Kronometre seviye 1 → 2: stok 1 iken 145, stok 5 iken 240 coin; seviye 2 → 3: 330'dan, stok 5 iken 430'a kadar).
  Sonuç: önce biriktirip sonra yükseltmek ile önce yükseltip sonra biriktirmek **toplamda tam olarak aynı tutardır** (testle doğrulandı: aynı alışverişi her sırayla yapınca ödenen coin eşit); ucuza yükseltmenin yolu yok. Fişte küçük bir not bunu söyler.
- **Otomatik joker yeteneği (4.000 coin, Yetenekler dükkânı)** (kullanıcı isteği: "otomatik joker bence mağazada ve parayla açılan bir özellik olsun"): açıkken önerilen joker parlayınca 0,7 sn sonra kendiliğinden kullanılır (etrafında dolan yay ve "Oto" rozeti görünür, etiket "Oto · Kronometre +4 sn" der); sen de dokunup elle kullanabilirsin, **"akıllı hamle" puanı yalnızca elle kullanıma verilir**. Kapalıyken jokerler yalnızca dokunduğunda çalışır (ekranda başka yere dokunmak jokeri kullanmaz; V0.6.1'den beri böyle). Yetenekler dükkânında ayrıca "Yedek canla başla" (2.000, **yakında**) vitrinde durur; Görünüm dükkânı (ibre, halka, konfeti örnekleri) "açılış yakında" der ve kapalıdır.
- **Ayarlar penceresi** (üstteki ses ve titreşim düğmelerinin yerine, ana ekranda sağ üstteki ayar simgesi): Ses, Titreşim, Otomatik joker (alınmadıysa kilitli, dokununca Yetenekler dükkânına götürür), Dil (telefonun diline göre; yalnızca bilgi) ve sürüm.
- **Hediye dükkânı: reklam izle, coin kazan** (kullanıcı isteği): ilk reklam **20**, sonra **30 · 40 · 50 · 100** coin; beşinciden sonra düğme **"12 saat sonra gel"** der (kalan süre dakika dakika görünür, bekleme bitince merdiven baştan başlar). Sürenin kaynağı telefon saatidir (saat geri alınsa bile bekleme 12 saati aşmaz). Kayıtlı bir basamak bekleme olmadan sürer (ara vermek ilerlemeyi silmez).
- **Rekor kutlaması düzeltildi** (kullanıcı: "konfeti yağmuru istemiştim ama yok, rekor kırdığımı fark etmiyorum bile"). Konfeti artık telefondaki "animasyonları kaldır" ayarına bakmaz (o ayar açıkken hiç çıkmıyordu), parçalar ekran genişliğine göre büyür, yağmur daha uzun sürer, "Yeni rekor!" kapsülü biraz daha uzun kalır; oyun içi kutlama eşiği 25 → 10. Not: **Kamp oyunlarında** (Seviye 2 ve sonrasından başlayan) rekor sayılmaz, kutlama da çıkmaz.
- **"Stetoskop" yazımı "Steteskop" yapıldı** (oyunda ve belgelerde).
- **Eski kayıtlar korunur:** önceki sürümlerde oynayanın dört jokeri ve dört yuvası açık kalır, coin ve seviyeleri aynen sürer (elindekini kimse kaybetmez). Yeni düzeni sıfırdan görmek için uygulamayı silip yeniden kurmak (ya da Android'de uygulama bilgisinden "Verileri sil") yeter.
- **Hız:** emülatörde (yazılımla çizen yavaş ortam) sokak 9 → 24, Alet çantası 16 → 40 kare/sn oldu: mağaza açıkken arkadaki oyun tuvali çizilmez, ekrandan çıkan cepheler animasyonu durdurur, hareketli ikonların gölge/parıltıları sabit katmanlarla yapıldı, kedi ve ışıklar katman olarak oynar.
- Metin denetimi (`tools/check-strings.mjs`) artık iki dilin metin anahtarlarının aynı olduğunu ve kodda kullanılan her anahtarın tanımlı olduğunu da kontrol eder (383 anahtar). Mağaza testi: `tools/store-test.mjs` (fiyat ve stok kuralları, yükseltme eşitliği, hediye merdiveni, eski kayıt geçişleri, ekran akışı; başsız Chrome). Emülatörde gerçek dokunuşla denendi: sokak, kaydırma, dükkâna giriş, joker açma, yuva açma, seçici, geri tuşu, test reklamıyla Hediye, Otomatik joker oyun içinde, rekor konfetisi.

## V0.9.1 — İlk görüşte "Hayalet gösteri", titreşim düğmesi (2026-10-19)

- **Yeni kilit ve engel artık "Hayalet gösteri" ile tanıtılıyor** (kullanıcı geri bildirimi: "spot ışığı sürekli öğretiyor, bir kere göster; amaç kullanıcıya ilk defa gördüğü şeyi yanmadan öğretmek; bilgi kartı çok yer kaplıyor"; 5 tasarım gösterildi, **Hayalet gösteri** seçildi).
  Bir kilit ya da engel ilk kez geleceği an oyun durur (süre akmaz). Gerçek halkada yeni pinler spot ışığıyla aydınlanır, saydam bir **hayalet ibre** ve **hayalet parmak** doğru hamleyi bir kez oynar; halkanın altındaki tek satırlık şerit ne olduğunu söyler ("Bomba pim · Süre dolmadan vur: +25").
  Sonra gerçek pinler gelir, şerit "Sıra sende!" der ve oyun sürer. Gösteri dokunarak geçilir (ilk 0,7 sn yok sayılır: tempoda vuran parmak kazara atlatmasın); geri tuşu hepsini geçer; ana ekrana gidip dönünce baştan başlar (görüldü sayılmaz).
  Her kilit ve engel için **yalnızca bir kez** çıkar (14 kilit, 11 engel; Dene modunda çıkmaz; eski sürümde zaten karşılaşılmışsa da çıkmaz). Gerçek tur gösteriyle birlikte gelmez, gösteriden sonra gelir; yani öğrenmek için ölmek gerekmez. Hayalet ibre, gerçek ibrenin durduğu yerden doğar; Cehennem çemberi dönerken gösteri de onunla döner.
- **Üstteki büyük bilgi kartı kalktı, ✓/✕ işaretleri ve tekrar eden spot ışığı da** (kullanıcı seçimi). Kilit açılınca artık yukarıda 8 sn duran kart çıkmaz, ilk üç görünüşte ibreyi yavaşlatan ışık ve hedefin yanındaki küçük ✓ / ✕ rozetleri yoktur; öğretim yalnızca ilk görüşteki gösteridir.
  Büyük kart yalnızca Dene modunda kalır. Uzun ekranlarda kart yeri 102 → 56 px küçüldü (haber satırı ve seviye bandı sığar); halka orta boy ekranlarda biraz büyür, altında gösterinin şeridine yer var.
- **Titreşim açma/kapama düğmesi** (kullanıcı isteği): ana ekranda ses düğmesinin yanında; kapalıyken oyun hiç titremez, ayar kaydedilir. Dört düğme dar telefonda bile tek sıraya sığar (320 px altında düğmeler biraz küçülür).
- Zorluk aynı kaldı (botla, n = 30: Normal orta oyuncu medyan seviye 8, 10. seviyeye %33; Usta iyi oyuncu %30; Cehennem pro bot %37; V0.9.0 ölçümüyle aynı düzey). Emülatörde gerçek dokunuşla denendi: ilk Çift pim gösterisi, atlama, "Sıra sende!", ana ekrana gidip dönme, İngilizce metinler.

## V0.9.0 — Süre ortada, yeni kilit ipucu, rekor kutlaması, ikinci şans, yeni ekonomi (2026-10-19)

- **Süre artık çemberin ortasında, puan üstte** (kullanıcı isteği: "süre ile puanı yer değiştirsek"; 3 tasarım gösterildi, **Sıvı seviyesi** seçildi). Halkanın içi bir kap gibidir: süre azaldıkça sıvı alçalır, ortada kalan süre yazar.
  2,5 sn'nin altında sıvı sarıya, 1 sn'nin altında kırmızıya döner ve altta "Son 1 sn: ×3" yazar. **Son saniyede dalga, şişme ya da titreşim yoktur** (kullanıcı: "hata yapmaya meyilli olduğu anda ekstra bir şeyle kafasını bulandırmayalım"); dış halkanın nabzı da kalktı, yerine sabit ince bir halka geldi.
  Üstte puan büyük yazılır (dokunuşta hafifçe zıplar), "En iyi" kapsülü sağdadır, altındaki çubuk **rekora yaklaşmayı** gösterir (rekor kırılınca altın ve dolu olur), kombo çipi ("×3 · 12") çubuğun yanında, can çipi yanında durur. Eski süre çubuğu ve sağdaki süre yazısı kalktı.
- **Yeni kilit ipucu: Spot ışığı** (kullanıcı: "bomba örnekti, her bölüm için olmalı"; 5 tasarım gösterildi). Her kilit ve engel, ilk üç görünüşünde: ekran kısa süre kararır, yalnızca o turun pinleri aydınlık kalır (beyaz çerçeveli), **ibre yavaşlar** (×0,4, yaklaşık 1,3 sn).
  İbre, ✓/✕ işaretleri ve süre karartmanın üstünde kalır; dokunuş ipucunu hemen kapatır. 14 kilidin ve 11 engelin hepsinde çalışır (çift halkada her halkanın pini ayrı aydınlanır). Dene modunda ve oyunun ilk turunda çıkmaz; oyunun üstüne pencere açılmaz.
- **Yeni kilit, açıldıktan hemen sonraki turda gelir** (kullanıcı seçimi: 0 tur). Eskiden açıldıktan ortalama 1,4-3,1 tur sonra çıkıyordu (en çok 5), botla ölçüm: şimdi hep 0. Ayar `CFG.newAfter` (tur sayısı).
- **Hedef boyu süreye ve kademeye göre, "Keskin" eğri** (kullanıcı isteği: "8. saniyede dar, 1. saniyede geniş; Cehennem başlangıçta çok dar; adil bir alt ve üst sınır"). Her kademenin kendi iki ucu var: süre doluyken en dar, bitmek üzereyken en geniş
  (Rahat ×0,95 → ×2,6, Normal ×0,52 → ×2,0, Usta ×0,45 → ×1,8, Cehennem ×0,36 → ×1,5; aradaki geçiş eskisiyle aynı biçimde). Hedefin yarı genişliği hiçbir zaman 4,3°'nin (toplam 8,6°) altına inmez, üst sınırı kademeye göre 46° (Rahat, Normal), 34° (Usta), 20° (Cehennem).
  Seviye 7-10'da hedefin ortalama toplam genişliği (çubuk 8 sn → 2 sn): Rahat 33° → 70°, Normal 20° → 52°, Usta 17° → 42°; Cehennem 4-6. seviyelerde 12° → 37°, 7-10. seviyelerde 10° → 31° (çubuk doluyken neredeyse imkânsız dar, süre azalınca geniş kurtarma payı).
- **Cehennem'de süre erimesi 1,25 → 0,9.** Hedefler bu kadar daralınca eski süre baskısıyla Cehennem aşılmaz olurdu (pro bot %4 bitiriyordu); hedef "refleksi çok iyi olanların bir kısmı geçsin" olduğu için dar hedef + daha yavaş erime dengesi seçildi.
  Rahat'ın hedef çarpanı 1,2 → 0,95, Normal 1 → 1,03, Usta 0,9 → 1 oldu (yeni eğriyle eski zorluk düzeyini korumak için botla ayarlandı).
- **Ekonomi: çabuk zenginleşme yok** (kullanıcı seçimi: B "Düzenli oyun"). Koşunun bütün coin kaynakları (puan, kıl payı, altın/kasa/sabır, seviye ödülleri, +100 bitiriş ödülü) artık kademe çarpanıyla çarpılır: **Rahat ×0,12, Normal ×0,3, Usta ×0,54, Cehennem ×0,75**
  (eskiden yalnızca puan kısmı ×0,7 / ×1 / ×1,4 / ×2 idi, seviye ödülleri çarpansızdı). Alet yükseltme fiyatları ×1,5 oldu (135 / 330, kalkan 180 / 390). Botla ölçülen koşu başına kazanç: Rahat'ta orta oyuncu 71 (eskiden 480), Normal'de orta oyuncu 102 (eskiden 341),
  Usta'da iyi oyuncu 235 (eskiden 521), Cehennem'de usta oyuncu 402 (eskiden 784). Alet çantasını tamamen doldurmak Normal'de orta oyuncu için yaklaşık 20 koşu (eskiden 4-5). Dakikada kazanç (bot, yukarıdaki oyuncu düzeyleri): Rahat 12, Normal 26, Usta 61, Cehennem 143 coin; yani kolay modda az, zor modda ve Cehennem'de çok. Reklamla +20 coin aynı kaldı.
- **İkinci şans: geri sayımlı kart, 3 hak** (kullanıcı seçimi: "Geri sayımlı"). Oyun bitince kartta 5 saniyelik geri sayım halkası, "Reklam izle" ve coin düğmeleri vardır; karar verilmezse blok yumuşakça kapanır. Bir koşuda en çok **3 hak**: fiyat 25 → 50 → 100 coin (her hakta iki katı), **reklam yalnızca ilk iki hakta**;
  üçüncü hak yalnızca coinle. Her hak +4 sn ve kısa bir yavaşlatma verir. Dükkân açıkken ya da reklam oynarken sayaç durur. Kısa ekranda (640 px altı) başlık gizlenir, kart taşmaz.
- **Rekor kutlaması: konfeti yağmuru** (kullanıcı seçimi). Oyun sırasında rekor ilk kez geçilince halkanın arkasında konfeti yağar, üstte altın "Yeni rekor!" kapsülü çıkar, "En iyi" kapsülü altın olur ve skorla birlikte yükselir; kamera, süre ve oyun akışı bozulmaz.
  Oyun sonunda yeni rekorda başlık, puan ve "Yeni rekor" rozeti altın olur, kartın önünde konfeti patlar. Önceki rekor 25'in altındaysa oyun içi kutlama çıkmaz (ilk oyunlarda sürekli kutlanmasın). "Hareketi azalt" açıksa konfeti yoktur.
- Botla ölçüldü (10. seviyeye ulaşma; n = 300): Normal yeni %5, orta %33, iyi %76; Rahat yeni %36, orta %77; Usta iyi %24, usta %86; Cehennem pro bot %39 ulaşıyor, %23 bitiriyor (usta bot %2, iyi bot %0). V0.8.0 ölçümüyle (Normal yeni %5, orta %37, iyi %79; Rahat yeni %31, orta %76; Usta iyi %31, usta %86; Cehennem pro %24) aynı düzeyde.
  Ölçümler artık **başsız Chrome ile** yapılıyor (yüzlerce oyun birkaç saniyede); `tools/bot.js` koşu başına coini ve (`window.__logChal` ile) her turun başındaki süre ve hedef genişliğini de verir.

## V0.8.0 — İlk görüşte tanıtım, Cehennem çemberi, altın sırası (2026-10-17)

- **Yeni kilit ya da engel ilk kez geldiğinde oyun birkaç saniye durur, küçük bir animasyon onu tanıtır** (öğreticiyi aramana gerek kalmaz). Üstteki yeni-kilit kartı uzar, içinde kilit baştan sona oynanır
  (ibre geçer, parmak dokunur, ödül çıkar) ve ne yapılacağı adım adım yazılır; halka aşağı kayıp küçülür, oyun alanı hafifçe silinir, joker sırası soluk kalır. Oyunun üstüne pencere açılmaz.
  Dokununca geçilir (ilk 1,2 saniyedeki dokunuş yok sayılır, tempoda vuran parmak kazara atlatmasın), yoksa 4-5,5 saniye sonra kendiliğinden kapanır ve "Kaldığın yerden devam" yazısıyla oyun sürer. **Yalnızca ilk görüşte çıkar**
  (daha önce karşılaştığın kilitler için çıkmaz); iyi kilit ile engel ikizi birlikte gelirse art arda gösterilir (önce kilit, sonra engel). 25 türün hepsinin (14 kilit, 11 engel) kendi animasyonu var ve gerçek oyun çizimleriyle yapıldı.
  Uygulama arka plana giderse yarım kalan tanıtım devamında baştan başlar; Android geri tuşu tanıtımları geçer. Kilit defteri ve **Dene** aynen duruyor. Türkçe ve İngilizce.
  Kullanıcı isteğiyle yapıldı: "oyunun üstüne yeni pencere açmak istemiyorum" dediği için dört tasarım gösterildi, "üst kart büyür" seçildi.
- **Cehennem'de çember nefes alıyor, ters dönüyor, gözü yoruyor** (yalnızca Cehennem kademesinde; Usta'nın cehennem bölümlerinde yok). Çember yavaşça küçülüp geri açılır (**nefes**), bütün çember (çentikler, hedefler, ibre) **ibrenin tersine döner**,
  içinde üç kollu bir **sarmal** döner. Seviye ilerledikçe güçlenir: nefes 1. seviyede %3 küçülür, 10. seviyede %25'e çıkar ve 3,4 sn'den 1,6 sn'ye hızlanır; çember 1. seviyede saniyede 3°, 10. seviyede 18° döner.
  Yalnızca görüntü oynar: ibre ile hedef arasındaki açı ve dokunuş mantığı değişmez (botla ölçüldü: Cehennem sayıları aynı çıktı). Çember hiçbir zaman ayarlanan boyutundan büyümez, bu yüzden kartın altına girmez;
  rakamlar (çift pimin 1-2'si) dönmez, hep dik kalır. "Hareketi azalt" ayarı açık cihazlarda efekt kapalıdır. Cehennem'i seçmeyen oyuncu hiçbir fark görmez.
  Kullanıcı isteğiyle yapıldı; nefes açık, ters dönüş "bütün çember", sarmal açık, yalnızca Cehennem modu olarak seçildi.
- **Altın pim ana hedeften sonra açılır.** Altın önce soluk ve kilitlidir (üstünde küçük kilit); sıradaki ana hedefi vurunca **parlayarak açılır**. Açıldıktan sonra ilk dokunuş altına aittir: dokunup tutturamazsan normal ıska cezası ve altın kaybolur;
  hiç dokunmadan ibre altını geçerse ceza yok, altın yalnızca kaybolur. Lanetli altın (engel ikizi) buna göre yeniden yerleşti: gerçek altının önünde ya da ardında, her zaman ana hedeften sonra.
- **Hedefin boyu süre çubuğuna göre belirgin değişiyor.** "8 saniyelik çubuğun 8. saniyesinde hedef zor, 7. saniyesinde daha kolay…" isteği V0.6.1'de yapılmıştı ama hissedilmiyordu: iyi oynayan oyuncuda çubuk hep 7,5-8 sn'de durduğu için eski tabloda
  (×0,80 ile ×0,87) fark yalnızca %8'di. Şimdi çubuk doluyken hedef ×0,62, 7 sn'de ×0,80, 6 sn'de ×0,94 (aşağısı aynı: 5 sn ×1,02, 4 sn ×1,12, 3 sn ×1,25, 2 sn ×1,42, 1 sn ×1,62, bitmek üzereyken ×1,8);
  yani bir ıskadan sonra çıkan hedef gözle görülür biçimde büyür. Orta kısmı da sertleştirmek Usta ve Cehennem'i fazla zorlaştırdığı için yalnızca üst iki saniye değiştirildi.
- Botla ölçüldü (10. seviyeye ulaşma; n = 18-70, hata payı ±10 puan): Normal yeni %3, orta %50, iyi %84; Usta usta bot %78; Cehennem pro bot %37 ulaşıyor, %27 bitiriyor. V0.7.0 ölçümüyle (Normal orta %38, iyi %83; Cehennem pro bitirme %25) hata payı içinde aynı:
  bu sürümdeki değişiklikler zorluğu bozmadı. İlk görüş tanıtımı botları durdurmasın diye `DEBUG=1` derlemesinde kapalıdır (`DEBUG=2`'de açık).

## V0.7.0 — Işınlanma pimi (2026-10-17)

- **Yeni kilit: Işınlanma pimi** (Seviye 7'nin sonuna doğru gelir, Kilit defterinde ve **Dene**'de de var). Halkada iki kapı olur: **mavi kapı** ibreyi içeri alır, **turuncu kapı** dışarı verir.
  İbre mavi kapıya girince küçülüp kaybolur; **ne zaman çıkacağı belli olmaz**: 0,15 ile 0,50 saniye arasında (her turda farklı), turuncu kapıdan çıkar. Hedef turuncu kapının ilerisindedir
  (çıkıştan yaklaşık yarım saniye sonra), yani çıktığını görüp vurabilirsin. Kapının içindeyken dokunursan ıska sayılır. İbre kapıdayken süre akmaya devam eder.
  Kullanıcı isteğiyle yapıldı ("ışına girip ne zaman çıkacağı belli olmasın, her an çıkabilir, hızlı çıksın"); önce canlı bir deneme gösterilip onaylandı, çıkış hızı "Hızlı" seçildi.
- ★ güçlenme bu kilide de uygulanabilir: bekleme aralığı 0,12-0,58 sn, sonra 0,10-0,66 sn'ye genişler, hedef çıkışa biraz yaklaşır.
- Kilit defteri artık 15 kilit gösterir. Seviye 7'nin ★ güçlenmesi seviyenin %82'sinden %90'ına kaydı (ışınlanma pimine yer açmak için).
- Botla ölçüldü: ışınlanma pimini zayıf bot bile %74, iyi bot %99 vuruyor (bot çıkışı hiç şaşırmadan görür, insan için daha zor olabilir); bir tur yaklaşık 1,6 sn sürer, bu yüzden süre kazancı ×1,2.
  Diğer kademelerin zorluğu değişmedi (Normal orta bot %38, iyi bot %83; Usta iyi bot %30; Cehennem pro bot %25 bitiriyor).
- **GitHub'da iki ayrı dal:** `android` = Android projesi (oyunun paketlenmiş hali dahil; Android Studio'da `android` klasörünü açarsın), `html` = yalnızca HTML oyunu. İkisi de her sürümde güncellenir, `main`'e birleştirilmez (`main` ilk sürüm olarak kaldı). `tools/publish.sh` ikisini birden gönderir.
- Bekleyen: Işınlanma'nın engel ikizi **Kara kapı** (ibreyi geri atan kapı) yapılmadı; sonsuz mod için Sarkaç, Renk, Sis fikirleri duruyor.

## V0.6.1 — Süreye göre hedef, mod geçişi, sağlam jokerler (2026-10-17)

- **Hedefin uzunluğu süre çubuğunun her saniyesinde farklı.** Süre doluyken (8. saniye) hedefler en dar (×0,8: zor), sonra saniye saniye uzar: 7. sn ×0,87, 6. sn ×0,94, 5. sn ×1,02, 4. sn ×1,12, 3. sn ×1,25, 2. sn ×1,42, 1. sn ×1,62, süre bitmek üzereyken ×1,8 (en kolay).
  Dar kısım ilk üç seviyede yavaş yavaş devreye girer (1. seviyede hedefler hiç daralmaz).
- **Cehennem bölümü yalnızca Usta'da açılıp kapanır.** Rahat ve Normal'de artık hiç cehennem bölümü yok, seviyeler kesintisiz akar (botla ölçüldü: Normal'de orta bot 10. seviyeye %40, iyi bot %77 ulaşıyor; V0.6.0'da %30 ve %80'di, yani zorluk neredeyse aynı kaldı). Usta'da her seviyenin sonunda kısa cehennem eskisi gibi sürer.
  Cehennem kademesinde baştan sona cehennem bölümü vardır ve cehennem gücü artık her seviyede etkindir.
- **Cehennem gerçekten zor.** Baştan sona cehennem bölümü olarak yeniden ayarlandı (hedef ×0,82, ibre ×1,18, süre erimesi ×1,25, hata cezası ×1,5, cehennem gücü ×0,64). Botla ölçüldü (10 seviyeyi bitirme): kusursuza yakın oynayan bot (pro) %25'ini,
  usta bot %5'ini, iyi bot hiçbirini bitiriyor (iyi bot çoğunlukla 5.-6. seviyede kalıyor). Aynı ölçümle V0.6.0'daki Cehennem ayarlarını pro bot %35, usta bot %18 bitiriyordu; yani en iyi oyuncu için de belirgin biçimde zorlaştı.
  Bot insan değildir: insan yeni kuralı ilk görüşte öğrenmek zorundadır ama jokerleri kullanabilir, gerçek oyuncuda sayılar farklı çıkabilir. Çok zor gelirse bir tık kolaylaştırılır.
- **Dikende nefes oyun ilerledikçe büyüyor.** Diken ikizinde hedefin kapanan payı seviyeyle artar: 3. seviyede yaklaşık %24, 7. seviyede %35, 10. seviyede %50 (★'lı kilitte ve cehennemde en çok %62); yani ortadaki açıklık gitgide daralır.
- **Jokerler tek dokunuşla çalışıyor.** Basılı tutmak kalktı. Kullanınca sayı hemen azalır, düğme zıplar. Joker istediğin an kullanılabilir (yandığında değil); parlaması yalnızca "şimdi işe yarar" ipucudur.
  Sıra ekranın en altında ve düğmeler büyüdü (60 px, parlayan 76 px); halka ile jokerler arasında en az parmak boyu (yaklaşık 1,5 cm) boş alan kalır, oyun dokunuşları oraya gider ve jokerlere değmez.
- **Mod değiştirince yarım kalan oyun silinir, uyarılırsın.** Yarım kalan oyun varken başka bir kademe (Rahat, Normal, Usta, Cehennem) seçersen "Yarım kalan oyun silinsin mi?" penceresi çıkar: bu oyun ve henüz alınmamış coinin kaybolacağı yazar, "Sil ve geç" ya da "Vazgeç".
  "Devam et" artık kademeyi de gösterir ("Normal · Seviye 5 · 4.200 puan"); yarım kalan oyun kendi kademesinde sürer, yanlış moda karışmaz. Eski kayıtta kademe yoksa şimdi seçili olan kademeye bağlanır.
- Küçük: Cehennem'de "Cehennem" haberi yalnızca bir kez, oyun başında çıkar; HUD'daki cehennem geri sayım rozeti yalnızca Usta'da; botta "pro" becerisi eklendi (`tools/bot.js`).
- Bekleyen: **Işınlanma pimi** (ibre kapıya girer, rastgele bir an sonra çıkar). Önce görsel tasarım gösterilip onaylanacak, sonra yapılacak.

## V0.6.0 — Dene ve Cehennem zorluğu (2026-10-17)

- **Kilit defteri baştan yazıldı.** Artık 14 kilidin hepsi görünür: açtıkların tam açıklamalarıyla, açmadıkların adı ve açılacağı seviyeyle (sıradaki kesikli çerçeveli "Sıradaki · Seviye 4"). Başlıkta "3 / 14 açıldı" yazar.
- **Dene.** Defterde her satırda **Dene** düğmesi var, açılmamış kilitlerde de. Dokununca o kilidin kısa canlı denemesi başlar: yavaş ibre, geniş hedef, süre ve ceza yok, puan ve kayıt yok.
  Engelinden de çıkar (ikinci turdan sonra). Ceza nesnesine dokunmadan 3 turu bitirirsen "Öğrendin" yazar (sabır pimi 1 tur). Üstte "Dene" rozeti, üç nokta ve "Bitir"; kural kartı hep açık kalır;
  ortada doğru turlar sayılır. Uygulamadan çıkarsan ya da geri tuşuna basarsan deneme kapanır, deftere dönersin. Denerken oyun kaydın ve rekorların değişmez.
- **Dördüncü zorluk: Cehennem.** Rahat, Normal, Usta, **Cehennem**. Baştan sona cehennem teması (kırmızı-siyah, kor ve çatlaklar); hedefler %28 dar, ibre %22 hızlı, süre %35 çabuk erir (taslakta %50'ydi, çok sert çıktı), hata cezası %80 ağır,
  engel ikizleri kilitle birlikte açılır ve çok sık gelir, coin ×2. Ayrı rekoru ve kırmızı rozeti var (oyun içinde seviye rozeti kırmızı, sonuç ekranında "Cehennem · Seviye N"). Menüde seçince altında tek satırlık açıklaması çıkar
  (küçük ekranda gizlenir). Usta modunda iki uzun oyundan sonra "Usta kolay mı? Cehennem modu" önerisi çıkar; Cehennem'de üç kısa oyundan sonra Usta önerisi.
  Botla ölçüldü: en iyi oyuncunun (usta bot) %37'si 10. seviyeyi bitiriyor, iyi oyuncunun %0'ı.
- **Trafik ışığı:** ışık değişim aralığı biraz rastgele (±%22); eskiden belli hız ve aralıkta ibre hep kırmızıya denk gelip tur uzayabiliyordu.
- Dört kademe 320 piksel genişlikte de sığar; yeni defter satırları dar ekranda sıkılaşır.
- Bekleyen: kalan kilit fikirleri (Sarkaç, Renk, Sis...) sonsuz mod için, mağaza hazırlığı (kullanıcı hesabı açınca).

## V0.5.1 — Cehennem zorlaştı, düzeltmeler (2026-10-17)

- **Cehennem artık gerçekten zor.** Eskiden en güçlü cehennem bile normal bölümden yalnızca %4 farklıydı. Şimdi cehennem bölümünde ibre %13'e kadar hızlı, hedefler %18'e kadar dar,
  süre %18'e kadar çabuk erir, hata cezası %40'a kadar ağır ve engel ikizleri daha sık gelir. Cehennemin adı seviyeyle büyür: seviye 1-3 **Kolay cehennem**, 4-6 **Orta cehennem**,
  7-9 **Zor cehennem**, 10 ve sonrası **Cehennem**. Güç ilk seviyelerde yumuşak başlar (yeni oyuncu ilk cehennemde boğulmasın), 4-5. seviyede en yüksek olur, sonra normal bölüm zaten çok yoğun olduğu için biraz iner.
  Botla ölçüldü: yeni başlayan bir oyuncunun 3.-6. seviyelerdeki cehennemi geçme şansı yaklaşık %95'ten %85-45 arasına indi; sıradan oyuncuda 6.-8. seviyelerde %80-90, 9. ve 10. seviyede %63 ve %38.
- **Süre azalınca hedef uzar.** İlk sürümlerdeki denge geri geldi: süre çubuğu doluyken hedefler biraz dar, süre azaldıkça (tam yanacakken) %30'a kadar uzar; yani kıl payı kurtulma şansın var.
  İlk üç seviyede dar kısım yavaş yavaş devreye girer.
- **Diken ibreye uyuyor.** İbre hızlandıkça diken de hızlı girip hızlı çıkıyor ve ibre hedefe girerken dikenler kapanmış oluyor (hedefin ortası yine hep açık). Artık dikenden önce vuruvermek yok.
- **Altın yarım kalmıyor.** Altın hedef hep ana hedeften önce gelir; ana hedefi vurunca altın ortadan kalkamaz.
- **Bölüm geçişi düzeldi.** Bölüm ya da cehennem başlayınca ibre hedefe varmak üzereyken hedef artık ortadan kaybolmuyor (yeni bölüm bir sonraki turdan başlar). Tema geçişi daha az güncelleme yapıyor (telefonda takılma azalır).
- **Yazılar halkadan çıktı.** "Seviye N" ve "Cehennem" haberi halkanın üstünde, kart yerinde çıkıyor (yeni kilit kartı varken HUD rozeti yetiyor). İki halkada puan balonları halkaların dışında. Joker etiketi halkaya binmiyor.
- **Jokerler yanlışlıkla harcanmıyor.** Jokeri kullanmak için basılı tutulur (parlayan 0,3 sn, diğerleri 0,5 sn; halka dolar). Kısa dokunuş her zaman oyuna gider; ibre bir hedefin üstündeyken joker sırasına dokunsan da vuruş gecikmez.
  Tut-bırak pininde parmağın joker sırasındayken de basış ve bırakış çalışır.
- Bekleyen tasarımlar (onay istendi): kilit defterinde açılmamış kilitleri de gösterme ve kilit başına kısa canlı deneme ("Dene"); dört kademeli zorluk (Rahat, Normal, Usta, Cehennem).

## V0.5.0 — Yeni kilitler ve gerçek zorluk (2026-10-17)

- **Her seviye artık yeni bir oyun:** Seviye 4-10'da her seviyenin başında yeni bir kilit, ortasında onun engeli gelir; yeni bir şey yaklaşık 13 saniyede bir görülür.
  Seviye 4: **Altın pim** (ince altın hedef, ×3 puan) ✚ **Lanetli altın** (aynı şekil ama soluk, zehir yeşili çerçeveli, kafatası işaretli: dokunma) ve **Sabır pimi**
  (kilitli pim; ibre üç kez geçince açılır, beklerken yan hedeflere vurursun). Seviye 5: **Kasa turu** ✚ **Alarm turu**, **Çürük kilit**.
  Seviye 6: **Ritim pim** ✚ **Sahte nota**, **Trafik ışığı** (yeşil hedefe vur, kırmızıya dokunma; ışıklar yer değiştirir). Seviye 7: **İki halka** ✚ **Kilitli halka**
  (kilitli iç halka donar, dış ibre hızlanır, geri sayım görünür). Seviye 8: **Hayalet pim** ✚ **Hayalet tuzak** (hedef ve tuzak gerçekten kaybolur, hafızadan vurursun),
  **Bomba pim** (fitil yanar; vurmazsan patlar). Seviye 9: **Gelgit ibre** ✚ **Girdap**. Seviye 10: **Tut-bırak pim** ✚ **Sıcak yay** (bas, tut, sonda bırak).
- **Seviyeler uzadı:** normal bölüm 20-32 sn; 10. seviyenin sonuna kadar yaklaşık 5 buçuk dakika.
- **Zorluk yeniden ayarlandı:** bonuslar kısıldı (vuruş +1,1 → +0,95 sn, mükemmel vuruş bonusu yarıya, cehennem sonu +4 → +2 sn, joker hediyesi her 3 seviyede),
  ıska ve tuzak biraz daha pahalı. Botla ölçüldü: Normal'de yeni başlayanın %4'ü, sıradan oyuncunun %32'si, iyi oyuncunun %86'sı 10. seviyeye varıyor; Usta modunda
  iyi oyuncunun %33'ü. (Bunlar bot sonucu; gerçek oyuncu geri bildirimine göre ayarlanacak.)
- **Diken:** hızlı girer (0,3 sn), bekler (0,8 sn), yavaş çıkar (1,5 sn); kenar daha uzun süre dikenli kalır, hedefin ortası yine her zaman açık.
- **Yeni kilit kartı büyüdü ve düzeldi:** büyük yazı, hareketli mini simge, şeftali nokta (ne yapacağın) ve gül nokta (nelere dokunmayacağın). Yeni kilidin ilk hedefi
  çözülene kadar ekranda kalır. Halkanın üstündeki yazı etiketleri kalktı (görüşü kapatıyordu); yerine hedefin dışında küçük ✓ (vur) ve ✕ (dokunma) işaretleri geldi.
- **Kilit defteri** 14 kilidi gösterir (simge, kural, uyarı).
- **Küçük düzeltmeler:** joker etiketi ekranın dışına taşmıyor; duraklatma basılı tutulan tut-bırak pinini bırakır; İngilizce kart yazıları kısaltıldı (küçük ekranda sığıyor);
  kamptan başlayınca o seviyenin yeni kilidi kartıyla gelir (önceden sessizce açılıyordu). Seviye süreleri değiştiği için V0.4.1'den kalan yarım oyun "Devam et" ile sürdürülmez; kamp kayıtların aynen duruyor.
- Bilinen eksikler: Sarkaç, Sis, Renk, Aynalı pim gibi kalan fikirler (`docs/kilit-katalogu.md`) sonsuz mod ve sonraki sürümler için bekliyor. Gerçek telefonda denenmedi
  (emülatör, tarayıcı ve botla sınandı). Mağaza hazırlığı (ikon, imzalı paket, gizlilik sayfası, gerçek reklam kimliği, paket adı) kullanıcı hesabı açınca yapılacak.

## V0.4.1 — Rahat oynanan yolculuk (2026-10-17)

- **Tempo:** cennet bölümü kalktı. Seviyeler kısaldı (normal 20-28 sn, cehennem 6-10 sn), zorluk 3 kat daha yavaş artıyor, "Normal" daha kolay;
  hedef: sıradan bir oyuncu yaklaşık 5 dakikada 10. seviyeye varabilsin. Seviye bitince +4 sn, coin, her 2 seviyede bir joker hediyesi.
  "Usta" eski V0.4.0 sertliğine yakın.
- **Jokerler artık kullanışlı:** halkanın hemen altında, başparmağın bulunduğu yerde. İşe yarayacağı an ilgili joker parlayıp büyür ve ne işe
  yarayacağını yazar; dokununca çalışır, doğru zamanda kullanırsan +25 puan ("Akıllı hamle!"). Parlamayan joker basılı tutulunca çalışır.
  Yeni oyuncu her jokerden 2 ile başlar. Joker kullanmadan biten oyunda sonda küçük bir hatırlatma çıkar.
- **Can:** en fazla 1 tane toplanan yeşil "+" hedefi; süre çubuğunun yanında yeşil "+ Can" rozeti ve yeşil çerçeve. Süre bitince kendiliğinden
  +3 sn verip oyunu sürdürür. (Kalp simgesi kullanılmadı.)
- **Kaldığın yerden devam:** uygulamadan çıksan ya da uygulama kapansa bile oyun kaydedilir; menüde "Devam et" çıkar, 3-2-1 sayıp devam eder.
  "Yeni oyun" kayıt varken önce sorar.
- **Ekran:** yalnızca "Seviye N" yazar (toplam yok), altında ince ilerleme çizgisi. Yeni kilit için üst kart (simge, ad, kural, uyarı) ve ilk üç
  karşılaşmada hedefin yanında kısa etiket ("Açıkken vur", "Dikene dokunma"). Yeni kilidin ilk hedefi kart çıktıktan 2 sn sonra, ibreden uzak doğar.
- **Menü:** güzelleşti; "Oyun" sayacı kalktı; **Kilit defteri** eklendi (gördüğün kilitlerin açıklamaları); büyük Devam et / Oyna düğmesi.
- **Düzeltmeler:** Seviye 3'teki diken artık kenardan kapanır, hedefin ortası her zaman açıktır (pas geçmek zorunda kalmazsın); kayan tuzak hedeften
  dar ve hedefin açıkta kalan parçası her zaman vurulabilir; duraklatma ekranına "Menü" düğmesi eklendi.
- **Tasarım kuralları (sonraki sürümler için):** sis, renk ve sıcak yay kilitlerindeki mantık hataları (görmeden atış, hedefe girmeden değişen renk,
  sıcak yayın ilk karşılaşmada anlaşılmaması) tasarımda düzeltildi; bu kilitler henüz oyunda olmadığı için kodu yok. Ritim, Sarkaç ve Sis sonsuz moda taşındı.
- Bilinen eksikler: Seviye 4 ve sonrasının yeni kilitleri (Kasa, Altın, Hayalet, Gelgit, Renk, Tut-bırak) henüz yok; o seviyelerde yalnızca ★ güçlenme
  ve bilinen kilitlerin karışımı çıkar. İkon, imzalı paket, gizlilik sayfası ve gerçek reklam kimliği ayrı bir sürümde yapılacak.

## V0.4.0 — Yolculuk (2026-10-16)

- 10 seviyelik yolculuk: ilerledikçe yeni kilitler açılır. Seviye 1-3: çift pim ✚ tuzak pim, kayan pim ✚ kayan tuzak, nefes pim ✚ diken.
  Seri çarpanı, ★ güçlenme, karışım olayları ve nefes bonusu (tam açıkken +1).
- Her seviyede cennet (süre donar, ıska cezasız, puan ×2) ve cehennem (süre hızlı erir, ceza ağır, hedefler dar) bölümü.
  Cehennemin gücü seviyeyle artar.
- Tema yumuşak geçişle altın-krem (cennet) ve kızıl-siyaha (cehennem) döner; bulut, kıvılcım, kor ve çatlak efektleri.
- Ekranda "Seviye N/10", 10 noktalı yol, bölüm rozeti ve bölüm başlığı.
- Kamp: seviye bitince kayıt noktası, menüde "Kamp · Seviye N". Kamp oyunları puan rekorunu etkilemez, en iyi seviye ayrı tutulur.
- Duraklatma her şeyi dondurur; "Devam et"ten sonra 3-2-1 sayılır.
- Menüde en iyi seviye. En fazla iki puan balonu, HUD'un altında.
- Düzeltme: tuzak, çift pimin ikinci hedefinin üstüne düşmüyor.
- Bilinen sorunlar (V0.4.1'de ele alınacak): jokerler oyun sırasında zor kullanılıyor, uygulamadan çıkınca oyun kaldığı yerden devam etmiyor,
  yeni kilit yazıları zor okunuyor, 3. seviyedeki diken hedefi tamamen kapatıp pas geçirtebiliyor, süreler uzun.

## V0.3.0 — Seri, övgü ve zorluk seviyeleri (2026-10-16)

- Seri çarpanı: 5, 10, 20 ve 35 ardışık vuruşta puan ×2..×5; ıska seriyi bozar, kalkan korur.
- Övgü ve laf satırları: seri kilometre taşlarında "Wow!" tarzı övgü, ıskada hafif laf ("Senin yapacağın iş değil"), oyun sonunda duruma göre başlık.
- Zorluk seviyeleri: Rahat, Normal, Usta; her birinin rekoru ayrı. Üç kısa oyundan sonra Rahat, iki uzun oyundan sonra Usta önerisi.
- İki halka: dokunuş ekranın neresinde olursa olsun hedefteki ibreyi vurur; iç halka lila, dış halka şeftali.
- Puan tepesindeki hap ve yazılar ortalandı.
- (Telefonda uygulama bilgisinde "0.2.0" görünür; adlandırma sonradan değişti.)

## V0.2.0 — Kilit türleri ve alet çantası (2026-10-15)

- Oyun ilerledikçe açılan kilit türleri: çift pim, kayan pim, tuzak pim, iki halka.
- Alet çantası: steteskop (hedefi genişletir), kronometre (+süre), kalkan (ıskayı bağışlar), kum saati (ibreyi yavaşlatır).
  Coin ile alınır ve yükseltilir; ödüllü reklam +20 coin verir.
- Küçük ekranlarda halka, ipucu satırları ve alet çubuğu birbirine çarpmıyor.

## V0.1.0 — İlk Android sürümü (2026-10-15)

- Kadranda dönen ibre, şeftali hedef bölge, eriyen süre çubuğu; süre bitmek üzereyken (son 1 sn) vuruş ×3.
- Dalgalı zorluk (10 vuruşluk dalga, "Nefes al" aralığı); ölünce "İkinci şans" (reklam izle ya da 25 coin ile +4 sn).
- Android paketi (Capacitor), çevrimdışı yazı tipleri, Google test reklamı, titreşim, açık ve koyu tema, Türkçe ve İngilizce.
- (Önceki web prototipi: "Kıl payı: ilk oynanabilir sürüm", yalnızca tarayıcı.)
