import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../Constants';

// Screens
import Onboarding from '../Screens/Onboarding/Onboarding';
import ProfileSetup from '../Screens/Auth/ProfileSetup';

const Stack = createNativeStackNavigator();

const AuthNavigator = ({ route }) => {
  // Returning (onboarded but unprofiled) users skip straight to Profile Setup.
  const onboardingDone = route.params?.onboardingDone;

  return (
    <Stack.Navigator
      initialRouteName={onboardingDone ? ROUTES.AUTH.PROFILE : ROUTES.AUTH.ONBOARDING}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name={ROUTES.AUTH.ONBOARDING} component={Onboarding} />
      <Stack.Screen name={ROUTES.AUTH.PROFILE}    component={ProfileSetup} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
