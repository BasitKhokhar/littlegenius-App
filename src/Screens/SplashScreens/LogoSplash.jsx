import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Typography, Spacing } from '../../Theme';
import { Colors } from '../../Data/colorsTheme';
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
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgMain} />
      <View style={styles.logoWrapper}>
        <Text style={styles.logo}>🎓</Text>
        <Text style={styles.appName}>Little Genius</Text>
        <Text style={styles.tagline}>Premium Offline Education Edition</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgMain,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logo: {
    fontSize: 80,
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textLight,
    marginTop: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

export default LogoSplash;
