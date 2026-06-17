import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../Constants';

// Screens
import LogoSplash from '../Screens/SplashScreens/LogoSplash';
import Onboarding from '../Screens/Onboarding/Onboarding';
import Login from '../Screens/Auth/Login';
import Signup from '../Screens/Auth/Signup';

const Stack = createNativeStackNavigator();

const AuthNavigator = ({ route }) => {
  const skipSplash = route.params?.skipSplash;

  return (
    <Stack.Navigator 
      initialRouteName={skipSplash ? ROUTES.AUTH.LOGIN : ROUTES.AUTH.SPLASH}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name={ROUTES.AUTH.SPLASH}     component={LogoSplash} />
      <Stack.Screen name={ROUTES.AUTH.ONBOARDING} component={Onboarding} />
      <Stack.Screen name={ROUTES.AUTH.LOGIN}       component={Login} />
      <Stack.Screen name={ROUTES.AUTH.SIGNUP}      component={Signup} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
