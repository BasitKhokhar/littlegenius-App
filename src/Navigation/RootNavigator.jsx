import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../Context';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { BrandSplash } from '../Components/Common';

const Stack = createNativeStackNavigator();

// Minimum time the branded splash stays on screen on every launch.
const SPLASH_MIN_MS = 2200;

const RootNavigator = ({ fontsReady = true }) => {
  const { isAuthenticated, loading } = useAuth();
  const [bootReady, setBootReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  // Boot gate: hold the branded splash for a minimum dwell while we read
  // the onboarding flag — guarantees the splash appears on EVERY launch.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const flag = await AsyncStorage.getItem('onboarding_complete');
        if (alive) setOnboardingDone(flag === 'true');
      } catch (e) {
        // default: treat as not onboarded
      }
    })();

    const timer = setTimeout(() => {
      if (alive) setBootReady(true);
    }, SPLASH_MIN_MS);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  // Single splash gate: stay on the branded splash until the auth state is
  // resolved, the fonts are registered AND the minimum dwell has elapsed.
  if (loading || !bootReady || !fontsReady) return <BrandSplash />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          initialParams={{ onboardingDone }}
        />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
