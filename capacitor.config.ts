
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.temporalharmonyoracle', // You can change this to your desired app ID
  appName: 'Temporal Harmony Oracle',
  webDir: 'out', // This is the output directory from `next build && next export`
  server: {
    // For local development with live reload, you might want to use:
    // url: 'http://localhost:9002', // Your Next.js dev server
    // cleartext: true
    // For production builds, webDir is used.
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0 // Optional: control splash screen duration
    }
  },
  // bundledWebRuntime: false, // Optional: use if you manage your own web runtime
};

export default config;
