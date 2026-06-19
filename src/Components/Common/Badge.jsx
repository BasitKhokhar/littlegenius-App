import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { Radius, Spacing, Typography } from '../../Theme';

// ──────────────────────────────────────────────────────────────
// Badge / Pill — small labelled chips: module tags ("LEARN"), star
// counts, status. tone: 'brand' | 'tonal' | 'accent' | 'solid' | custom.
//
//   <Badge label="LEARN" />
//   <Badge label={String(stars)} icon="⭐" tone="accent" />
// ──────────────────────────────────────────────────────────────
const Badge = ({ label, icon, tone = 'tonal', color, textColor, style }) => {
  const colors = useThemeColors();

  let bg = colors.primaryLight;
  let fg = colors.primary;
  if (tone === 'brand') {
    bg = colors.brandSurfaceAlt;
    fg = colors.onBrandMuted;
  } else if (tone === 'accent') {
    bg = 'rgba(252,211,77,0.18)';
    fg = colors.accentDeep;
  } else if (tone === 'solid') {
    bg = color || colors.primary;
    fg = textColor || colors.onPrimary;
  } else if (tone === 'glass') {
    bg = 'rgba(255,255,255,0.22)';
    fg = colors.onBrand;
  }
  if (color && tone !== 'solid') bg = color;
  if (textColor) fg = textColor;

  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      {icon ? <Text style={[styles.icon, { color: fg }]}>{icon}</Text> : null}
      <Text style={[styles.label, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingVertical: 4,
    paddingHorizontal: Spacing.md,
    gap: 4,
  },
  icon: {
    fontSize: Typography.size.sm,
  },
  label: {
    fontFamily: Typography.font.extraBold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});

export default Badge;
