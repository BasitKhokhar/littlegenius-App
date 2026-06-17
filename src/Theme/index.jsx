import { colors } from './colors';
import { Fonts } from './fonts';

// Colors - Mapping the new dynamic theme to the app's existing color system
export const Colors = {
  // Brand
  primary: colors.primary,
  primaryLight: colors.primaryLight || colors.primary,
  primaryDark: colors.primaryDark || colors.primary,
  accent: colors.accent,

  // Backgrounds
  background: colors.bodyBackground,
  surface: colors.cardBackground,
  surfaceSecondary: colors.secondary || colors.cardBackground,
  inputBg: colors.cardBackground,

  // Text
  text: colors.textPrimary,
  textSecondary: colors.textSecondary || colors.textMuted,
  textMuted: colors.textMuted,
  textInverse: colors.textInverse || '#FFFFFF',

  // Borders
  border: colors.border,
  borderFocus: colors.primary,

  // Status
  success: '#4CAF50',
  warning: '#FF9800',
  error: colors.error,
  info: '#2196F3',

  // Gradients
  gradients: colors.gradients,

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0,0,0,0.6)',
};

// Typography - Restoring missing system
export const Typography = {
  font: {
    regular: Fonts.regular,
    medium: Fonts.medium,
    semiBold: Fonts.semiBold,
    bold: Fonts.bold,
    extraBold: Fonts.extraBold,
    urdu: Fonts.urdu,
    arabic: Fonts.arabic,
  },
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
    display: 36,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
};

// Spacing - Restoring missing system
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// Border Radius - Restoring missing system
export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Shadows - Restoring missing system
export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
};

export { colors };
