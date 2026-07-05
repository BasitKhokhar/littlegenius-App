import 'dotenv/config';

const projectId = process.env.EXPO_ID;

export default () => ({
  expo: {
    name: 'Little Genius',
    slug: 'little-genius',
    version: '1.1.0',
    orientation: 'portrait',
    icon: './assets/logo.png',
    owner: 'talhabasit7016',
    userInterfaceStyle: 'light',
    // ── OTA (Over-The-Air) updates via EAS Update ──────────────────────────
    // JS/asset changes ship instantly without a new store build.
    // runtimeVersion "appVersion" policy => an update only lands on a build
    // whose `version` matches. Bump `version` above ONLY when you change
    // native code / add native modules, then rebuild. Pure JS/UI changes keep
    // the same version and are delivered with `eas update`.
    runtimeVersion: { policy: 'appVersion' },
    updates: {
      url: `https://u.expo.dev/${projectId}`,
      enabled: true,
      // 0 = launch instantly from cache, fetch the new bundle in the
      // background and apply it on next app open (best UX for kids app).
      fallbackToCacheTimeout: 0,
    },
    splash: {
      image: './assets/logo.png',
      resizeMode: 'contain',
      backgroundColor: '#1E1B4B'
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.littlegenius.app'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/logo.png',
        backgroundColor: '#1E1B4B'
      },
      package: 'com.basitkhokhar.littlegenius.app',
      // Offline kids app — request only what's used (VIBRATE via expo-haptics,
      // INTERNET for opening legal links). Block sensitive permissions that
      // libraries may inject; they are a Families-policy rejection risk.
      permissions: ['android.permission.INTERNET', 'android.permission.VIBRATE'],
      blockedPermissions: [
        'android.permission.SYSTEM_ALERT_WINDOW',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE'
      ]
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: ['expo-font'],
    extra: {
      eas: {
        projectId: process.env.EXPO_ID
      }
    }
  }
});
