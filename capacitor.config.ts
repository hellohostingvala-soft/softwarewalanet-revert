import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.60a74dfa5c5348bdb711c4f1a1cc9bf5',
  appName: 'softwarewalanet',
  webDir: 'dist',
  server: {
    url: 'https://60a74dfa-5c53-48bd-b711-c4f1a1cc9bf5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    }
  }
};

export default config;
