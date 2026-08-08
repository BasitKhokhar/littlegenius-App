import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../Context';
import { getOnboardingComplete } from '../Utils/secureAuth';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { BrandSplash } from '../Components/Common';

const Stack = createNativeStackNavigator();

// Minimum time the branded splash stays on screen on every launch.
const SPLASH_MIN_MS = 2200;

const RootNavigator = ({ fontsReady = true }) => {
  const { isAuthenticated, loading } = useAuth();
  const [bootReady, setBootReady] = useState(false);
  // null = not yet resolved for the current unauthenticated stretch.
  const [onboardingDone, setOnboardingDone] = useState(null);

  // Minimum splash dwell — guarantees the splash appears on EVERY launch.
  useEffect(() => {
    const timer = setTimeout(() => setBootReady(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  // Re-read the onboarding flag every time we're not authenticated — this
  // covers first boot AND the moment logout/account-deletion drops us back
  // here, so the Auth stack always mounts with a fresh flag instead of the
  // one read at app launch (which would otherwise skip Onboarding again
  // right after a logout).
  useEffect(() => {
    if (isAuthenticated) return;
    let alive = true;
    setOnboardingDone(null);
    (async () => {
      const done = await getOnboardingComplete();
      if (alive) setOnboardingDone(done);
    })();
    return () => {
      alive = false;
    };
  }, [isAuthenticated]);

  const authFlowReady = isAuthenticated || onboardingDone !== null;

  // Single splash gate: stay on the branded splash until the auth state is
  // resolved, the onboarding flag for this stretch is known, the fonts are
  // registered AND the minimum dwell has elapsed.
  if (loading || !bootReady || !fontsReady || !authFlowReady) return <BrandSplash />;

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
