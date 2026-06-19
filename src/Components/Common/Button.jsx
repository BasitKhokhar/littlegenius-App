import React, { useRef } from 'react';
import { Animated, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../Context/ThemeContext';
import { Radius, Spacing, Typography, Motion, coloredShadow, Layout } from '../../Theme';

// ──────────────────────────────────────────────────────────────
// Button — the premium CTA. Token-driven, dark-ready, with a spring
// press-scale and an optional gradient fill.
//
//   variant: 'primary' | 'gradient' | 'secondary' | 'tonal' | 'ghost' | 'danger'
//   size:    'sm' | 'md' | 'lg'
//   icon:    leading emoji/glyph (string)
//
//   <Button title="Start Learning" variant="gradient" size="lg" onPress={…} />
// ──────────────────────────────────────────────────────────────
const SIZES = {
  sm: { minHeight: 40, padV: Spacing.sm, padH: Spacing.lg, font: Typography.size.sm },
  md: { minHeight: 48, padV: Spacing.md, padH: Spacing.xl, font: Typography.size.md },
  lg: { minHeight: 56, padV: Spacing.lg, padH: Spacing.xxl, font: Typography.size.lg },
};

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
  textStyle,
  gradientColors,
  ...rest
}) => {
  const colors = useThemeColors();
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;
  const dims = SIZES[size] || SIZES.md;

  const pressIn = () =>
    Animated.spring(scale, { toValue: Motion.pressScale, useNativeDriver: true, ...Motion.spring.soft }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, ...Motion.spring.soft }).start();

  // Resolve per-variant colours.
  const v = {
    primary: { bg: colors.primary, fg: colors.onPrimary, border: 'transparent' },
    secondary: { bg: 'transparent', fg: colors.primary, border: colors.primary },
    tonal: { bg: colors.primaryLight, fg: colors.primary, border: 'transparent' },
    ghost: { bg: 'transparent', fg: colors.textSecondary, border: 'transparent' },
    danger: { bg: colors.error, fg: '#FFFFFF', border: 'transparent' },
    gradient: { bg: 'transparent', fg: '#FFFFFF', border: 'transparent' },
  }[variant] || { bg: colors.primary, fg: colors.onPrimary, border: 'transparent' };

  const containerStyle = [
    styles.base,
    {
      minHeight: dims.minHeight,
      paddingVertical: dims.padV,
      paddingHorizontal: dims.padH,
      borderRadius: Radius.md,
      backgroundColor: v.bg,
      borderWidth: variant === 'secondary' ? 1.5 : 0,
      borderColor: v.border,
    },
    fullWidth && styles.fullWidth,
    (variant === 'primary' || variant === 'danger') && coloredShadow(v.bg, 'sm'),
    isDisabled && styles.disabled,
    style,
  ];

  const label = (
    <React.Fragment>
      {!!icon && <Text style={[styles.icon, { color: v.fg, fontSize: dims.font }]}>{icon} </Text>}
      <Text style={[styles.text, { color: v.fg, fontSize: dims.font }, textStyle]}>{title}</Text>
    </React.Fragment>
  );

  const content = loading ? <ActivityIndicator color={v.fg} size="small" /> : label;

  return (
    <Animated.View style={[fullWidth && styles.fullWidth, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        hitSlop={Layout.hitSlop}
        style={variant === 'gradient' ? (fullWidth && styles.fullWidth) : containerStyle}
        {...rest}
      >
        {variant === 'gradient' ? (
          <LinearGradient
            colors={gradientColors || colors.gradients.cta}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[containerStyle, coloredShadow(colors.primary, 'md')]}
          >
            {content}
          </LinearGradient>
        ) : (
          content
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  text: {
    fontFamily: Typography.font.bold,
    letterSpacing: 0.2,
  },
  icon: {
    fontFamily: Typography.font.bold,
  },
});

export default Button;
