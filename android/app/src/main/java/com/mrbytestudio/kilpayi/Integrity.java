package com.mrbytestudio.kilpayi;

import android.content.Context;
import android.content.res.AssetManager;
import android.util.Log;

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.security.MessageDigest;

/* V0.10.0: oyunun kodu (assets/public/index.html.kpe ya da index.html) ve Capacitor ayar dosyaları derleme sırasında SHA-256 ile mühürlenir (build.gradle -> BuildConfig.ASSET_SHA256);
   uygulama açılırken burada yeniden hesaplanır. Biri APK'yı açıp oyun dosyasını değiştirirse (kapalı testte olan buydu) özet tutmaz ve MainActivity uyarı verip kapanır.
   Yanlış alarm vermemek için beklenmedik her hata "sağlam" sayılır; mühür boşsa (derlemede dosyalar yoktu) denetim yapılmaz. */
final class Integrity {
    private static final String[] CONFIGS = { "capacitor.config.json", "capacitor.plugins.json" };

    private Integrity() {}

    static boolean assetsIntact(Context ctx) {
        try {
            String expected = BuildConfig.ASSET_SHA256;
            if (expected == null || expected.isEmpty()) return true;
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            AssetManager am = ctx.getAssets();
            byte[] buf = new byte[16384];
            /* V0.10.1: şifreli derlemede mühür şifreli oyun dosyasını (index.html.kpe), geliştirme derlemesinde düz index.html'i kapsar; build.gradle ile aynı sıra */
            String main = "public/index.html.kpe";
            try { am.open(main).close(); } catch (FileNotFoundException e) { main = "public/index.html"; }
            String[] files = { main, CONFIGS[0], CONFIGS[1] };
            for (String f : files) {
                try (InputStream in = am.open(f)) {
                    int n;
                    while ((n = in.read(buf)) > 0) md.update(buf, 0, n);
                } catch (FileNotFoundException e) {
                    /* derlemede de yoktu: Gradle yalnızca var olan dosyaları özetler */
                }
            }
            StringBuilder sb = new StringBuilder();
            for (byte b : md.digest()) sb.append(String.format("%02x", b & 0xff));
            boolean ok = sb.toString().equalsIgnoreCase(expected);
            if (!ok) Log.w("KilPayi", "oyun dosyalarının mührü tutmadı");
            return ok;
        } catch (Throwable t) {
            /* kasıtlı: beklenmedik bir hatada (G/Ç, sağlayıcı) oyunu engellemek meşru oyuncuyu cezalandırır; bu denetim zaten kararlı birini durdurmaz (bkz. docs/guvenlik-raporu.md) */
            Log.w("KilPayi", "bütünlük denetimi çalışamadı: " + t.getClass().getSimpleName());
            return true;
        }
    }
}
