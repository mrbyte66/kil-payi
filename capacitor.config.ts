import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mrbytestudio.kilpayi',
  appName: 'Kıl payı',
  webDir: 'www',
  plugins: {
    /* Kapalı test bildirimleri (V0.9.11): durum çubuğu simgesi (android/app/src/main/res/drawable/ic_stat_kilpayi.xml) ve rengi */
    LocalNotifications: { smallIcon: 'ic_stat_kilpayi', iconColor: '#6D58E0' }
  }
};

export default config;
