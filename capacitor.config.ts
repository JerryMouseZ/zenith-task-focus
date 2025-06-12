import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.lovable.zenithtask',
  appName: 'ZenithTask',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'DEFAULT', // Can be 'DARK' or 'LIGHT' too
    },
    Keyboard: {
      resize: 'body', // Or 'ionic', 'native'
      style: 'DEFAULT', // Or 'DARK'
      resizeOnFullScreen: true,
    }
  }
};

export default config;
