import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.softwarevala.app',
  appName: 'Software Vala',
  webDir: 'dist',
  server: {
    url: 'https://60a74dfa-5c53-48bd-b711-c4f1a1cc9bf5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    buildOptions: {
      releaseType: 'APK'
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
