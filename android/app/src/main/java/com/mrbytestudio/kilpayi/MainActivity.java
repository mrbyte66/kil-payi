package com.mrbytestudio.kilpayi;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Display;
import android.util.Log;
import android.view.WindowManager;
import android.webkit.WebSettings;

import androidx.appcompat.app.AlertDialog;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestHighRefreshRate();
        installClient();
        checkIntegrity();
    }

    /* V0.10.1: oyun dosyaları APK'da AES ile şifrelidir; Capacitor'un istemcisi yerine bellekte şifre çözen istemci takılır (bkz. GameAssets). Sayfa yüklemesi GameWebView'de bir tur ertelendiği için ilk istek de buradan geçer. */
    private void installClient() {
        try {
            Bridge br = getBridge();
            if (br == null) return;
            br.setWebViewClient(new GameWebViewClient(br, new GameAssets(getApplicationContext(), br), () -> runOnUiThread(this::showTampered)));
            hardenWebView(br);
        } catch (Throwable t) {
            /* istemci takılamazsa Capacitor'un kendi istemcisi kalır (şifreli dosyalar o zaman açılmaz; yalnızca geliştirme derlemelerinde olabilir) */
            Log.w("KilPayi", "istemci takılamadı: " + t.getClass().getSimpleName());
        }
    }

    /* V0.10.3: oyunun kullanmadığı WebView yetenekleri kapatılır (Capacitor varsayılanları geniştir): konum, dosya ve içerik erişimi, otomatik pencere açma, karışık içerik. Müzik için
       setMediaPlaybackRequiresUserGesture(false) (Capacitor'un ayarı) bilerek KORUNUR: menü müziği Web Audio ile ilk dokunuşsuz başlar. */
    @SuppressWarnings("deprecation")
    private void hardenWebView(Bridge br) {
        WebSettings s = br.getWebView().getSettings();
        s.setGeolocationEnabled(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setAllowFileAccessFromFileURLs(false);
        s.setAllowUniversalAccessFromFileURLs(false);
        s.setJavaScriptCanOpenWindowsAutomatically(false);
        s.setSupportMultipleWindows(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
    }

    /* V0.10.0: oyun dosyaları değiştirilmiş mi (bkz. Integrity)? Denetim arka planda yapılır (açılışı yavaşlatmaz, ana iş parçacığını tutmaz). */
    private void checkIntegrity() {
        final Context app = getApplicationContext();
        new Thread(() -> {
            if (!Integrity.assetsIntact(app)) runOnUiThread(this::showTampered);
        }, "kp-check").start();
    }

    private boolean tamperShown;

    private void showTampered() {
        if (isFinishing() || tamperShown) return;
        tamperShown = true;
        try {
            new AlertDialog.Builder(this)
                .setTitle(R.string.app_name)
                .setMessage(R.string.kp_tamper_msg)
                .setCancelable(false)
                .setPositiveButton(R.string.kp_tamper_btn, (d, w) -> {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + getPackageName()))); } catch (Exception e) { /* Play yok */ }
                    finishAffinity();
                })
                .setNegativeButton(R.string.kp_tamper_close, (d, w) -> finishAffinity())
                .show();
        } catch (Exception e) {
            finishAffinity();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        requestHighRefreshRate();
    }

    /* V0.9.8: oyun ekranın desteklediği EN YÜKSEK yenileme hızında (120 Hz gibi) çalışsın. Kullanıcı "kaydırırken 44 fps hissi veriyor, 120 fps bekliyorum" dedi;
       uygulama istemezse çoğu telefon pencereyi 60 Hz'e (ya da dalgalı bir değere) bırakabiliyor. Aynı çözünürlükteki en hızlı mod seçilir; destek yoksa sistem seçimi kalır. */
    private void requestHighRefreshRate() {
        try {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return;
            Display display = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R ? getDisplay() : getWindowManager().getDefaultDisplay();
            if (display == null) return;
            Display.Mode current = display.getMode();
            Display.Mode best = current;
            for (Display.Mode mode : display.getSupportedModes()) {
                if (mode.getPhysicalWidth() == current.getPhysicalWidth() && mode.getPhysicalHeight() == current.getPhysicalHeight() && mode.getRefreshRate() > best.getRefreshRate()) {
                    best = mode;
                }
            }
            WindowManager.LayoutParams params = getWindow().getAttributes();
            params.preferredDisplayModeId = best.getModeId();
            params.preferredRefreshRate = best.getRefreshRate();
            getWindow().setAttributes(params);
        } catch (Exception e) {
            /* eski ya da özel cihaz: sistemin seçimi kalır */
        }
    }
}
