import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../Context/ThemeContext';
import { Spacing, Radius, textStyles, Motion } from '../../Theme';
import Button from './Button';

// ──────────────────────────────────────────────────────────────
// SuccessScreen — celebratory completion / reward screen. Used for
// "Quiz complete!", "You earned ⭐", final-screen moments.
//
//   <SuccessScreen emoji="🎉" title="Great job!" message="You earned 5 stars"
//       stars={5} primaryLabel="Continue" onPrimary={…}
//       secondaryLabel="Play again" onSecondary={…} />
// ──────────────────────────────────────────────────────────────
const SuccessScreen = ({
  emoji = '🎉',
  title = 'Great job!',
  message,
  stars,
  primaryLabel = 'Continue',
  onPrimary,
  secondaryLabel,
  onSecondary,
  style,
}) => {
  const colors = useThemeColors();
  const pop = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, ...Motion.spring.bouncy, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [pop, float]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }, style]}>
      <Animated.View
        style={[
          styles.medalWrap,
          { transform: [{ scale: pop }, { translateY }] },
        ]}
      >
        <LinearGradient colors={colors.gradients.gold} style={styles.medal}>
          <Text style={styles.emoji}>{emoji}</Text>
        </LinearGradient>
      </Animated.View>

      <Text style={[textStyles.h1, styles.center, { color: colors.textPrimary }]}>{title}</Text>
      {!!message && (
        <Text style={[textStyles.body, styles.center, { color: colors.textSecondary }]}>{message}</Text>
      )}

      {stars != null && (
        <View style={styles.stars}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Text key={i} style={[styles.star, { opacity: i < stars ? 1 : 0.25 }]}>
              ⭐
            </Text>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        {!!onPrimary && <Button title={primaryLabel} variant="primary" size="lg" onPress={onPrimary} />}
        {!!secondaryLabel && (
          <Button title={secondaryLabel} variant="ghost" size="md" onPress={onSecondary} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl, gap: Spacing.md },
  medalWrap: { marginBottom: Spacing.md },
  medal: {
    width: 128,
    height: 128,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 64 },
  center: { textAlign: 'center' },
  stars: { flexDirection: 'row', gap: Spacing.sm, marginVertical: Spacing.sm },
  star: { fontSize: 32 },
  actions: { width: '100%', gap: Spacing.sm, marginTop: Spacing.lg },
});

export default SuccessScreen;
