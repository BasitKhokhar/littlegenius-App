import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../Context';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { Loader } from '../Components/Common';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { isAuthenticated, loading, isSignOut } = useAuth();

  if (loading) return <Loader />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="App"  component={AppNavigator} />
      ) : (
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator} 
          initialParams={{ skipSplash: isSignOut }}
        />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
