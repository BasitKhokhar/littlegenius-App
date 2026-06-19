import 'dotenv/config';
export default () => ({
  expo: {
    name: 'Little Genius',
    slug: 'little-genius',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/logo.png',
    owner: 'talhabasit7016',
    userInterfaceStyle: 'light',
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
