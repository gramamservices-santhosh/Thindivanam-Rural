import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.namtindivanam.customer',
  appName: 'Nam Tindivanam',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // For development, uncomment below to load from dev server
    // url: 'http://192.168.1.15:3000',
    // cleartext: true
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#667eea',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#667eea'
    }
  }
};

export default config;
