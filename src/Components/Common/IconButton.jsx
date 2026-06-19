import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { Radius, Layout } from '../../Theme';

// ──────────────────────────────────────────────────────────────
// IconButton — a guaranteed ≥44px circular/rounded touch target for
// back / close / inline actions. `glyph` is text/emoji (←, ✕, ⚙️).
//   tone: 'tonal' | 'brand' | 'glass' | 'plain'
// ──────────────────────────────────────────────────────────────
const IconButton = ({
  glyph,
  onPress,
  tone = 'tonal',
  size = 44,
  round = false,
  color,
  glyphColor,
  style,
  accessibilityLabel,
  ...rest
}) => {
  const colors = useThemeColors();

  let bg = colors.surfaceAlt;
  let fg = colors.textPrimary;
  if (tone === 'brand') {
    bg = colors.brandSurfaceAlt;
    fg = colors.onBrand;
  } else if (tone === 'glass') {
    bg = 'rgba(255,255,255,0.18)';
    fg = colors.onBrand;
  } else if (tone === 'plain') {
    bg = 'transparent';
    fg = colors.textSecondary;
  }
  if (color) bg = color;
  if (glyphColor) fg = glyphColor;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={Layout.hitSlop}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: round ? size / 2 : Radius.md,
          backgroundColor: bg,
        },
        style,
      ]}
      {...rest}
    >
      <Text style={[styles.glyph, { color: fg }]}>{glyph}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontSize: 20,
    fontFamily: 'Baloo2_700Bold',
    includeFontPadding: false,
    textAlign: 'center',
  },
});

export default IconButton;
