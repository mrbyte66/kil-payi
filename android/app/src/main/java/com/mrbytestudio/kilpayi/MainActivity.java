package com.mrbytestudio.kilpayi;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Display;
import android.view.WindowManager;

import androidx.appcompat.app.AlertDialog;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestHighRefreshRate();
        checkIntegrity();
    }

    /* V0.10.0: oyun dosyaları değiştirilmiş mi (bkz. Integrity)? Denetim arka planda yapılır (açılışı yavaşlatmaz, ana iş parçacığını tutmaz). */
    private void checkIntegrity() {
        final Context app = getApplicationContext();
        new Thread(() -> {
            if (!Integrity.assetsIntact(app)) runOnUiThread(this::showTampered);
        }, "kp-check").start();
    }

    private void showTampered() {
        if (isFinishing()) return;
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
