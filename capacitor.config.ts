import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.softwarevala.app',
  appName: 'Software Vala',
  webDir: 'dist',
  
  // Live URL - APK always loads latest version from web
  // When you update the website, APK users automatically get updates!
  server: {
    url: 'https://60a74dfa-5c53-48bd-b711-c4f1a1cc9bf5.lovableproject.com?forceHideBadge=true',
    cleartext: true,
    allowNavigation: ['*'],
    errorPath: '/offline.html'
  },
  
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#1a1a2e',
    buildOptions: {
      releaseType: 'APK'
    },
    // Enable hardware acceleration for smooth performance
    useLegacyBridge: false
  },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: true,
      spinnerColor: '#8b5cf6',
      androidSpinnerStyle: 'large',
      splashFullScreen: true,
      splashImmersive: true
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a2e'
    }
  }
};

export default config;
