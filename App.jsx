import React, { useEffect } from 'react';
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
import { AuthProvider, DialogProvider, ThemeProvider } from './src/Context';
import { RootNavigator } from './src/Navigation';

// Global App Container (StatusBar + SafeArea + background)
import AppContainer from './src/AppContainer';

// Branded splash — shown while the font assets load so the first frame
// already matches the boot splash (no jarring two-screen feel).
import { BrandSplash } from './src/Components/Common';

// Global font installer
import { applyGlobalFont } from './src/Theme/applyGlobalFont';

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

  // NOTE: we mount the FULL provider tree immediately (even before the fonts
  // finish loading) and let RootNavigator own the one-and-only BrandSplash.
  // Rendering a separate splash here would mount a second BrandSplash later,
  // re-running its entrance animation — that's what made the logo look like it
  // appeared twice. One mount → one splash.
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <DialogProvider>
            <AppContainer>
              <NavigationContainer>
                <RootNavigator fontsReady={fontsLoaded} />
              </NavigationContainer>
            </AppContainer>
          </DialogProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
