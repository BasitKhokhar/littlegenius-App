// ──────────────────────────────────────────────────────────────
// Motion — standardised animation guidelines (springs, timings,
// press feedback). Centralises the spring configs that were copy-
// pasted across Home / Onboarding / ProfileSetup.
//
// Usage:
//   Animated.spring(v, { toValue: 1, ...Motion.spring.soft, useNativeDriver: true })
//   Animated.timing(v, { toValue: 1, ...Motion.timing.base, useNativeDriver: true })
// ──────────────────────────────────────────────────────────────
import { Easing } from 'react-native';

export const Motion = {
  spring: {
    soft: { tension: 120, friction: 14 },
    bouncy: { tension: 180, friction: 12 },
    gentle: { tension: 80, friction: 12 },
  },
  timing: {
    fast: { duration: 180, easing: Easing.out(Easing.cubic) },
    base: { duration: 240, easing: Easing.out(Easing.cubic) },
    slow: { duration: 360, easing: Easing.out(Easing.cubic) },
  },
  // Touchable press feedback
  pressScale: 0.97,
  // Stagger between list/grid items appearing
  stagger: 60,
  easing: {
    out: Easing.out(Easing.cubic),
    inOut: Easing.inOut(Easing.quad),
  },
};

export default Motion;
