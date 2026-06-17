import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Typography, Spacing } from '../../Theme';
import { ROUTES } from '../../Constants';

const LogoSplash = ({ navigation }) => {
  useEffect(() => {
    const checkNavigationFlow = async () => {
      try {
        const onboardingComplete = await AsyncStorage.getItem('onboarding_complete');
        const storedUsers = await AsyncStorage.getItem('registeredUsers');
        const users = storedUsers ? JSON.parse(storedUsers) : [];

        setTimeout(() => {
          if (onboardingComplete === 'true') {
            if (users.length > 0) {
              navigation.replace(ROUTES.AUTH.LOGIN);
            } else {
              navigation.replace(ROUTES.AUTH.SIGNUP);
            }
          } else {
            navigation.replace(ROUTES.AUTH.ONBOARDING);
          }
        }, 2500);
      } catch (error) {
        console.warn('Navigation check failed, defaulting to Onboarding:', error);
        setTimeout(() => {
          navigation.replace(ROUTES.AUTH.ONBOARDING);
        }, 2500);
      }
    };

    checkNavigationFlow();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
      <View style={styles.logoWrapper}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Little Genius</Text>
        <Text style={styles.tagline}>Premium Offline Education Edition</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 36,
    marginBottom: Spacing.md,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A5B4FC',
    marginTop: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

export default LogoSplash;
