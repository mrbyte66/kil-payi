package com.mrbytestudio.kilpayi;

import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebViewClient;

import java.io.ByteArrayInputStream;
import java.util.HashMap;

/* V0.10.1: Capacitor'un istemcisinin yerine geçer; şifreli oyun dosyası isteklerini SecureAssets ile bellekte açıp verir, geri kalan her şey Capacitor'un kendi yolundan gider. */
final class SecureWebViewClient extends BridgeWebViewClient {
    private final SecureAssets secure;
    private final Runnable onTamper;

    SecureWebViewClient(Bridge bridge, SecureAssets secure, Runnable onTamper) {
        super(bridge);
        this.secure = secure;
        this.onTamper = onTamper;
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        try {
            WebResourceResponse r = secure.serve(request);
            if (r != null) return r;
        } catch (Throwable t) {
            onTamper.run();
            /* uyarı penceresinin arkasında tarayıcı hata sayfası yerine düz mor bir ekran görünsün */
            byte[] blank = "<!doctype html><body style=\"margin:0;background:#2A1B80\">".getBytes(java.nio.charset.StandardCharsets.UTF_8);
            return new WebResourceResponse("text/html", "utf-8", 200, "OK", new HashMap<String, String>(), new ByteArrayInputStream(blank));
        }
        return super.shouldInterceptRequest(view, request);
    }
}
