package com.mrbytestudio.kilpayi;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.AttributeSet;

import com.getcapacitor.CapacitorWebView;

import java.util.Map;

/* V0.10.1: Capacitor'un WebView'i (res/layout/capacitor_bridge_layout_main.xml bu sınıfı kullanır). Tek farkı: sayfa yüklemesi ana iş parçacığının sıradaki turuna ertelenir.
   Neden: Capacitor ilk loadUrl'u köprü kurulurken (BridgeActivity.onCreate içinde) yapar; şifreli oyun dosyalarını açan istemciyi (GameWebViewClient) MainActivity ancak bundan hemen sonra
   takabilir. Yükleme bir tur ertelenince ilk istek de kesinlikle şifre çözen istemciden geçer (yarış yok); gecikme bir ana-iş-parçacığı turudur (< 1 ms). */
public class GameWebView extends CapacitorWebView {
    private final Handler main = new Handler(Looper.getMainLooper());

    public GameWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    @Override
    public void loadUrl(final String url) {
        if (url == null || url.startsWith("javascript:")) {
            super.loadUrl(url);
            return;
        }
        main.post(() -> GameWebView.super.loadUrl(url));
    }

    @Override
    public void loadUrl(final String url, final Map<String, String> additionalHttpHeaders) {
        if (url == null || url.startsWith("javascript:")) {
            super.loadUrl(url, additionalHttpHeaders);
            return;
        }
        main.post(() -> GameWebView.super.loadUrl(url, additionalHttpHeaders));
    }
}
