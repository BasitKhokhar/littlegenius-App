import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Baloo2_400Regular,
  Baloo2_500Medium,
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from '@expo-google-fonts/baloo-2';
import {
  NotoNastaliqUrdu_400Regular,
  NotoNastaliqUrdu_700Bold,
} from '@expo-google-fonts/noto-nastaliq-urdu';
import {
  NotoNaskhArabic_400Regular,
  NotoNaskhArabic_700Bold,
} from '@expo-google-fonts/noto-naskh-arabic';

// Context Providers
import { AuthProvider } from './src/Context';
import { RootNavigator } from './src/Navigation';

// Global App Container (StatusBar + SafeArea + background)
import AppContainer from './src/AppContainer';

// Theme — colors for the loading splash + global font installer
import { colors } from './src/Theme/colors';
import { applyGlobalFont } from './src/Theme/applyGlobalFont';

// Minimal splash shown only while the font assets load (no navigation).
const LoadingSplash = () => (
  <View style={styles.splash}>
    <Text style={styles.splashLogo}>🎓</Text>
    <Text style={styles.splashName}>Little Genius</Text>
  </View>
);

export default function App() {
  const [fontsLoaded] = useFonts({
    Baloo2_400Regular,
    Baloo2_500Medium,
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    NotoNastaliqUrdu_400Regular,
    NotoNastaliqUrdu_700Bold,
    NotoNaskhArabic_400Regular,
    NotoNaskhArabic_700Bold,
  });

  // Install the global Baloo 2 font once the assets are registered.
  useEffect(() => {
    if (fontsLoaded) applyGlobalFont();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <LoadingSplash />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContainer>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AppContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bodyBackground,
  },
  splashLogo: {
    fontSize: 80,
    marginBottom: 16,
  },
  splashName: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.5,
  },
});
