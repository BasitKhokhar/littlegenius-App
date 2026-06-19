import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, StatusBar, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { lightColors, gradients } from '../../Theme/colors';
import { Spacing, Radius, textStyles, coloredShadow } from '../../Theme';

// ──────────────────────────────────────────────────────────────
// BrandSplash — the single branded splash shown on EVERY launch.
// Rendered both while fonts load (App.jsx, BEFORE ThemeProvider) and
// as the boot gate (RootNavigator). It therefore uses STATIC brand
// tokens, not the theme hook — the splash identity is fixed indigo.
// ──────────────────────────────────────────────────────────────
const BrandSplash = () => {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.84)).current;
  const footerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
      Animated.timing(footerFade, { toValue: 1, duration: 900, delay: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, scale, footerFade]);

  return (
    <LinearGradient colors={gradients.splash} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={lightColors.brandSurface} />

      {/* Soft depth blobs */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />
      <View style={[styles.blob, styles.blob3]} />

      <Animated.View style={[styles.center, { opacity: fade, transform: [{ scale }] }]}>
        <View style={[styles.logoRing, coloredShadow(lightColors.primary, 'xl')]}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.appName}>Little Genius</Text>
        <Text style={styles.tagline}>Premium Offline Learning</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: footerFade }]}>
        <Text style={styles.footerText}>
          Made With <Text style={styles.heart}>❤️</Text> By <Text style={styles.author}>Basit</Text>
        </Text>
      </Animated.View>
    </LinearGradient>
  );
};

const C = lightColors;
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  blob: { position: 'absolute', borderRadius: Radius.full },
  blob1: { top: -70, left: -60, width: 220, height: 220, backgroundColor: C.brandSurfaceAlt, opacity: 0.5 },
  blob2: { bottom: -50, right: -50, width: 180, height: 180, backgroundColor: C.primaryDark, opacity: 0.4 },
  blob3: { top: '38%', right: -40, width: 110, height: 110, backgroundColor: C.primary, opacity: 0.18 },

  center: { alignItems: 'center' },
  logoRing: {
    width: 168,
    height: 168,
    borderRadius: 44,
    backgroundColor: C.brandSurfaceAlt,
    borderWidth: 3,
    borderColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  logo: { width: 132, height: 132, borderRadius: 32 },
  appName: { ...textStyles.display, color: C.onBrand },
  tagline: {
    ...textStyles.overline,
    color: C.onBrandMuted,
    marginTop: Spacing.sm,
    letterSpacing: 1.4,
  },

  footer: { position: 'absolute', bottom: 42, alignItems: 'center' },
  footerText: { ...textStyles.bodyStrong, color: '#C7D2FE', letterSpacing: 0.4 },
  heart: { fontSize: 14 },
  author: { color: C.accent, fontFamily: 'Baloo2_800ExtraBold' },
});

export default BrandSplash;
