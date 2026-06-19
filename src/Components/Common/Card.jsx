import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../Context/ThemeContext';
import { Radius, Spacing, Elevation, coloredShadow } from '../../Theme';

// ──────────────────────────────────────────────────────────────
// Card — a soft, elevated surface. The premium default container.
//
//   <Card>…</Card>
//   <Card onPress={…} elevation="md" radius="lg" padded>…</Card>
//
// GradientCard — same shape, gradient fill (real expo-linear-gradient).
//   <GradientCard colors={[from,to]} tint={from}>…</GradientCard>
// ──────────────────────────────────────────────────────────────
export const Card = ({
  children,
  onPress,
  elevation = 'sm',
  radius = 'lg',
  padded = true,
  style,
  activeOpacity = 0.85,
  ...rest
}) => {
  const colors = useThemeColors();
  const base = [
    styles.base,
    {
      backgroundColor: colors.surface,
      borderRadius: Radius[radius] ?? Radius.lg,
      borderColor: colors.border,
    },
    padded && styles.padded,
    Elevation[elevation],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={base} onPress={onPress} activeOpacity={activeOpacity} {...rest}>
        {children}
      </TouchableOpacity>
    );
  }
  return (
    <View style={base} {...rest}>
      {children}
    </View>
  );
};

export const GradientCard = ({
  children,
  colors: gradColors,
  tint,
  onPress,
  radius = 'lg',
  padded = true,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  elevation = 'md',
  style,
  ...rest
}) => {
  const palette = useThemeColors();
  const pair = gradColors || palette.gradients.cta;
  const shadow = tint ? coloredShadow(tint, elevation) : Elevation[elevation];

  const inner = (
    <LinearGradient
      colors={pair}
      start={start}
      end={end}
      style={[
        { borderRadius: Radius[radius] ?? Radius.lg, overflow: 'hidden' },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={[{ borderRadius: Radius[radius] ?? Radius.lg }, shadow]}
        {...rest}
      >
        {inner}
      </TouchableOpacity>
    );
  }
  return <View style={[{ borderRadius: Radius[radius] ?? Radius.lg }, shadow]}>{inner}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  padded: {
    padding: Spacing.lg,
  },
});

export default Card;
