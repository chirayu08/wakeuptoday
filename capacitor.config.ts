import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.32f3b3bee0c047fb9d359c284204da32',
  appName: 'wakeupnow',
  webDir: 'dist',
  server: {
    url: 'https://32f3b3be-e0c0-47fb-9d35-9c284204da32.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    }
  }
};

export default config;