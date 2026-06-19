import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { Spacing, Radius, textStyles } from '../../Theme';

// ──────────────────────────────────────────────────────────────
// Skeleton — a single shimmering placeholder block. Compose several
// to fake a screen's layout while real content loads (premium feel,
// better perceived performance than a bare spinner).
//
//   <Skeleton width={120} height={16} />
//   <LoadingState />  ← ready-made card list placeholder
// ──────────────────────────────────────────────────────────────
export const Skeleton = ({ width = '100%', height = 14, radius = Radius.sm, style }) => {
  const colors = useThemeColors();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: colors.surfaceSunken, opacity }, style]}
    />
  );
};

export const LoadingState = ({ label, rows = 4, style }) => {
  const colors = useThemeColors();
  return (
    <View style={[styles.wrap, style]}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Skeleton width={48} height={48} radius={Radius.md} />
          <View style={styles.lines}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="40%" height={12} />
          </View>
        </View>
      ))}
      {!!label && (
        <Text style={[textStyles.caption, { color: colors.textMuted, textAlign: 'center', marginTop: Spacing.sm }]}>
          {label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md, padding: Spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  lines: { flex: 1, gap: Spacing.sm },
});

export default LoadingState;
