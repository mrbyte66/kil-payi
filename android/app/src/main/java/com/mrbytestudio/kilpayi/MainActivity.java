package com.mrbytestudio.kilpayi;

import android.os.Build;
import android.os.Bundle;
import android.view.Display;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestHighRefreshRate();
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
