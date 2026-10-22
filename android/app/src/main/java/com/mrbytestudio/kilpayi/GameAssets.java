package com.mrbytestudio.kilpayi;

import android.content.Context;
import android.content.res.AssetManager;
import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;

import com.getcapacitor.Bridge;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/* V0.10.1: oyun dosyaları (assets/public/**) APK içinde AES-256-GCM ile şifreli durur (<dosya>.kpe: 12 bayt IV + şifreli veri + 16 bayt etiket; dosya yolu ek doğrulama verisidir, dosyalar birbirinin yerine konamaz).
   Uygulama çalışırken istek geldiğinde burada, yalnızca bellekte açılıp WebView'e verilir; düz hâli diske hiçbir zaman yazılmaz.
   Anahtar APK'da hazır durmaz: KP_A (derleme sırasında üretilir) ile capacitor.config.json + capacitor.plugins.json'un özetinin XOR'udur; ayar dosyalarından biri değiştirilirse anahtar tutmaz.
   Etiket tutmazsa (dosya değiştirilmiş) istisna atılır ve MainActivity "değiştirilmiş kopya" uyarısını gösterir. KP_A boşsa (geliştirme derlemesi, şifreleme adımı çalışmamış) hiçbir şey yapılmaz, Capacitor düz dosyaları kendisi sunar. */
final class GameAssets {
    private final AssetManager assets;
    private final Bridge bridge;
    private final ConcurrentHashMap<String, byte[]> cache = new ConcurrentHashMap<>();
    private volatile byte[] key;

    GameAssets(Context ctx, Bridge bridge) {
        this.assets = ctx.getAssets();
        this.bridge = bridge;
    }

    boolean enabled() {
        String a = BuildConfig.KP_A;
        return a != null && a.length() == 64;
    }

    /** Şifreli bir karşılığı olan isteğe cevap verir; olmayana null döner (Capacitor kendi yolundan sunar). Etiket tutmazsa istisna atar. */
    WebResourceResponse serve(WebResourceRequest request) throws Exception {
        if (!enabled() || !"GET".equalsIgnoreCase(request.getMethod())) return null;
        Uri u = request.getUrl();
        String host = u.getHost(), scheme = u.getScheme(), path = u.getPath();
        if (host == null || scheme == null || path == null) return null;
        if (!host.equalsIgnoreCase(bridge.getHost()) || !scheme.equalsIgnoreCase(bridge.getScheme())) return null;
        String rel = "/".equals(path) ? "index.html" : path.substring(1);
        if (rel.isEmpty() || rel.contains("..") || rel.startsWith("_capacitor_")) return null;
        byte[] data = plain(rel);
        if (data == null) return null;
        String mime = mimeOf(rel);
        InputStream body = new ByteArrayInputStream(data);
        if (rel.endsWith(".html")) body = bridge.getLocalServer().getJavaScriptInjectedStream(body);
        Map<String, String> headers = new HashMap<>();
        headers.put("Cache-Control", "no-cache");
        boolean text = mime.startsWith("text/") || mime.endsWith("javascript") || mime.endsWith("json") || mime.endsWith("svg+xml");
        return new WebResourceResponse(mime, text ? "utf-8" : null, 200, "OK", headers, body);
    }

    private byte[] plain(String rel) throws Exception {
        byte[] hit = cache.get(rel);
        if (hit != null) return hit;
        byte[] blob = readOrNull("public/" + rel + ".kpe");
        if (blob == null) return null;
        if (blob.length < 12 + 16) throw new IllegalStateException("kısa");
        Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
        c.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key(), "AES"), new GCMParameterSpec(128, blob, 0, 12));
        c.updateAAD(rel.getBytes(StandardCharsets.UTF_8));
        byte[] out = c.doFinal(blob, 12, blob.length - 12);
        cache.put(rel, out);
        return out;
    }

    private byte[] key() throws Exception {
        byte[] k = key;
        if (k != null) return k;
        synchronized (this) {
            if (key != null) return key;
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] cfg = readOrNull("capacitor.config.json"), plug = readOrNull("capacitor.plugins.json");
            if (cfg != null) md.update(cfg);
            if (plug != null) md.update(plug);
            md.update("kp-key-v1".getBytes(StandardCharsets.UTF_8));
            byte[] m = md.digest(), a = hex(BuildConfig.KP_A), out = new byte[32];
            for (int i = 0; i < 32; i++) out[i] = (byte) (a[i] ^ m[i]);
            key = out;
            return out;
        }
    }

    private byte[] readOrNull(String path) throws IOException {
        try (InputStream in = assets.open(path)) {
            ByteArrayOutputStream bo = new ByteArrayOutputStream(Math.max(1024, in.available()));
            byte[] buf = new byte[16384];
            int n;
            while ((n = in.read(buf)) > 0) bo.write(buf, 0, n);
            return bo.toByteArray();
        } catch (FileNotFoundException e) {
            return null;
        }
    }

    private static byte[] hex(String s) {
        byte[] b = new byte[s.length() / 2];
        for (int i = 0; i < b.length; i++) b[i] = (byte) Integer.parseInt(s.substring(i * 2, i * 2 + 2), 16);
        return b;
    }

    private static String mimeOf(String rel) {
        String r = rel.toLowerCase(Locale.ROOT);
        if (r.endsWith(".html")) return "text/html";
        if (r.endsWith(".css")) return "text/css";
        if (r.endsWith(".js")) return "application/javascript";
        if (r.endsWith(".json")) return "application/json";
        if (r.endsWith(".woff2")) return "font/woff2";
        if (r.endsWith(".woff")) return "font/woff";
        if (r.endsWith(".png")) return "image/png";
        if (r.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }
}
