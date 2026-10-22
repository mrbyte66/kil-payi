package com.mrbytestudio.kilpayi;

import android.net.Uri;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebViewClient;

import java.io.ByteArrayInputStream;
import java.util.HashMap;

/* V0.10.1: Capacitor'un istemcisinin yerine geçer; şifreli oyun dosyası isteklerini GameAssets ile bellekte açıp verir, geri kalan her şey Capacitor'un kendi yolundan gider. */
final class GameWebViewClient extends BridgeWebViewClient {
    private final Bridge bridge;
    private final GameAssets secure;
    private final Runnable onTamper;

    GameWebViewClient(Bridge bridge, GameAssets secure, Runnable onTamper) {
        super(bridge);
        this.bridge = bridge;
        this.secure = secure;
        this.onTamper = onTamper;
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        try {
            WebResourceResponse r = secure.serve(request);
            if (r != null) return r;
        } catch (Throwable t) {
            Log.w("KilPayi", "oyun dosyası açılamadı: " + t.getClass().getSimpleName());
            onTamper.run();
            /* uyarı penceresinin arkasında tarayıcı hata sayfası yerine düz mor bir ekran görünsün */
            byte[] blank = "<!doctype html><body style=\"margin:0;background:#2A1B80\">".getBytes(java.nio.charset.StandardCharsets.UTF_8);
            return new WebResourceResponse("text/html", "utf-8", 200, "OK", new HashMap<String, String>(), new ByteArrayInputStream(blank));
        }
        return super.shouldInterceptRequest(view, request);
    }

    /* V0.10.3: oyun yalnızca kendi yerel sayfasını yükler (https://localhost); başka bir adrese gidiş (enjekte edilmiş bağlantı, yönlendirme vb.) engellenir. Java'dan loadUrl ile yapılan yüklemeler buradan geçmez. */
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        Uri u = request.getUrl();
        String host = u.getHost(), scheme = u.getScheme();
        boolean own = host != null && scheme != null && host.equalsIgnoreCase(bridge.getHost()) && scheme.equalsIgnoreCase(bridge.getScheme());
        if (!own) Log.w("KilPayi", "dış gezinti engellendi");
        return !own;
    }
}
