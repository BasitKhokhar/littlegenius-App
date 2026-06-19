// ──────────────────────────────────────────────────────────────
// Theme — the design-system entry point. Import everything from here:
//   import { Colors, Typography, Spacing, Radius, Elevation, Motion } from '../../Theme';
//
// Colors      = LIGHT palette by default (dark-ready via ThemeContext)
// Typography  = families + size/lineHeight scale + semantic textStyles
// Spacing     = 4pt scale     Radius = corner scale
// Elevation   = 5-level soft shadows (Shadow kept as alias)
// Motion      = spring/timing presets   Layout = misc layout constants
// ──────────────────────────────────────────────────────────────
import { lightColors, darkColors, gradients, moduleColors, palettes } from './colors';
import { Fonts } from './fonts';
import { Elevation, Shadow, coloredShadow } from './elevation';
import { Motion } from './motion';

// Default (light) semantic colour tokens.
export const Colors = lightColors;
export const ColorsDark = darkColors;

// ── Typography ────────────────────────────────────────────────
const family = {
  regular: Fonts.regular,
  medium: Fonts.medium,
  semiBold: Fonts.semiBold,
  bold: Fonts.bold,
  extraBold: Fonts.extraBold,
  urdu: Fonts.urdu,
  urduBold: Fonts.urduBold,
  arabic: Fonts.arabic,
  arabicBold: Fonts.arabicBold,
};

export const Typography = {
  font: family,
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 34,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.45,
    relaxed: 1.7,
  },
};

// Semantic, ready-to-spread text styles so screens stop hand-tuning.
// Spread directly into a Text style: <Text style={[textStyles.h2, {...}]} />
export const textStyles = {
  display: { fontFamily: family.extraBold, fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
  h1: { fontFamily: family.extraBold, fontSize: 26, lineHeight: 32, letterSpacing: -0.4 },
  h2: { fontFamily: family.bold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  h3: { fontFamily: family.bold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  title: { fontFamily: family.bold, fontSize: 15, lineHeight: 20 },
  body: { fontFamily: family.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: family.semiBold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: family.medium, fontSize: 13, lineHeight: 18 },
  overline: {
    fontFamily: family.extraBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  button: { fontFamily: family.bold, fontSize: 15, lineHeight: 20, letterSpacing: 0.2 },
};

// ── Spacing (4pt base) ────────────────────────────────────────
export const Spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 56,
};

// ── Radius ────────────────────────────────────────────────────
export const Radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  full: 9999,
};

// ── Layout misc ───────────────────────────────────────────────
export const Layout = {
  screenPadding: 16,
  cardPadding: 16,
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
  minTouch: 44,
  tabBarHeight: 64,
};

export { Elevation, Shadow, coloredShadow, Motion, gradients, moduleColors, palettes };
export { lightColors, darkColors };
