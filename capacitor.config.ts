import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.lovable.zenithtask',
  appName: 'ZenithTask',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
