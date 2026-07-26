import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import LottieView from 'lottie-react-native';

// ──────────────────────────────────────────────────────────────
// Mascot — a big, gently bouncing cartoon character for the gameplay
// screens. Renders an emoji (default) inside a soft translucent glow
// halo, looping a slow bob so it feels alive. Pass `source` (a Lottie
// require) to swap the emoji for an animation without changing callers.
//
//   <Mascot emoji={theme.mascot} size={84} glow={theme.deco} />
// ──────────────────────────────────────────────────────────────
const Mascot = ({ emoji = '🎮', source = null, size = 84, glow = 'rgba(255,255,255,0.22)', style }) => {
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const rotate = bob.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] });
  const haloSize = size * 1.5;

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY }] }, style]}>
      <View
        style={[
          styles.halo,
          { width: haloSize, height: haloSize, borderRadius: haloSize / 2, backgroundColor: glow },
        ]}
        pointerEvents="none"
      />
      {source ? (
        <LottieView source={source} autoPlay loop style={{ width: size * 1.6, height: size * 1.6 }} />
      ) : (
        <Animated.Text style={[styles.emoji, { fontSize: size, transform: [{ rotate }] }]}>
          {emoji}
        </Animated.Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute' },
  emoji: { textAlign: 'center', includeFontPadding: false },
});

export default Mascot;
