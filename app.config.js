import 'dotenv/config';
export default () => ({
  expo: {
    name: 'Little Genius',
    slug: 'little-genius',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    owner: 'talhabasit7016',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FDFBF7'
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.littlegenius.app'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FDFBF7'
      },
      package: 'com.littlegenius.app'
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
