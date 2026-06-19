// ──────────────────────────────────────────────────────────────
// Colors — SINGLE SOURCE OF TRUTH for every colour in the app.
//
// Little Genius "Refined Indigo" premium-kids palette.
//   • Brand     → Indigo #6366F1  +  Gold #FCD34D
//   • Surfaces  → soft violet-white bg, white cards, deep-indigo hero
//
// Exposes a LIGHT and a DARK palette with identical keys so the app is
// dark-ready. The default `colors` export = light, so existing static
// StyleSheets keep working while we migrate screens onto the tokens.
//
// Each palette carries BOTH semantic names (bg, surface, brandSurface,
// textPrimary…) AND the legacy key aliases the codebase already uses
// (bodyBackground, cardBackground, textDark, bgCard…) so nothing breaks
// mid-migration.
// ──────────────────────────────────────────────────────────────

// Brand constants (theme-independent identity).
const BRAND = {
  indigo: '#6366F1',
  indigoDark: '#4338CA',
  indigoDeep: '#1E1B4B',
  indigoDeepAlt: '#312E81',
  indigoTint: '#EDE9FE',
  gold: '#FCD34D',
  goldDeep: '#F59E0B',
};

// Status colours (shared across themes).
const STATUS = {
  success: '#22C55E',
  successDeep: '#16A34A',
  warning: '#F59E0B',
  error: '#EF4444',
  errorDeep: '#DC2626',
  info: '#3B82F6',
};

// ── LIGHT ─────────────────────────────────────────────────────
export const lightColors = {
  mode: 'light',

  // Brand
  primary: BRAND.indigo,
  primaryDark: BRAND.indigoDark,
  primaryLight: BRAND.indigoTint,
  onPrimary: '#FFFFFF',
  accent: BRAND.gold,
  accentDeep: BRAND.goldDeep,
  onAccent: BRAND.indigoDeep,

  // Deep-indigo "brand surface" used for hero cards, header & tab bar
  brandSurface: BRAND.indigoDeep,
  brandSurfaceAlt: BRAND.indigoDeepAlt,
  onBrand: '#FFFFFF',
  onBrandMuted: '#A5B4FC',

  // Backgrounds & surfaces
  bg: '#F6F5FC',
  surface: '#FFFFFF',
  surfaceAlt: '#F2F0FA',
  surfaceSunken: '#ECEAF6',

  // Text
  textPrimary: '#1E1B4B',
  textSecondary: '#4B5563',
  textMuted: '#8A8DA3',
  textInverse: '#FFFFFF',

  // Lines
  border: '#ECEAF6',
  borderStrong: '#DDD9F0',
  divider: '#F3F2F9',
  borderFocus: BRAND.indigo,

  // Status
  ...STATUS,

  // Scrims
  overlay: 'rgba(15,12,41,0.55)',
  scrim: 'rgba(15,12,41,0.35)',

  // Absolutes
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // ── Legacy key aliases (keep old imports alive) ──
  bodyBackground: '#F6F5FC',
  cardBackground: '#FFFFFF',
  headerBackground: BRAND.indigoDeep,
  headerSurface: BRAND.indigoDeepAlt,
  // `secondary` historically means the emerald "correct" accent used by
  // quiz/game screens — keep that meaning to avoid colour regressions.
  secondary: STATUS.success,
  periwinkle: '#A5B4FC',
  bgMain: '#F6F5FC',
  bgCard: '#FFFFFF',
  borderLight: '#ECEAF6',
  textDark: '#1E1B4B',
  textLight: '#8A8DA3',
  background: '#F6F5FC',
  text: '#1E1B4B',
  inputBg: '#FFFFFF',
  surfaceSecondary: '#F2F0FA',
  // vibrant module accents used as data in older screens
  amber: STATUS.warning,
  purple: '#8B5CF6',
  blue: STATUS.info,
  pink: '#EC4899',
  secondaryDark: STATUS.successDeep,
};

// ── DARK (staged — wired but light ships first) ───────────────
export const darkColors = {
  ...lightColors,
  mode: 'dark',

  onPrimary: '#FFFFFF',
  brandSurface: '#15122E',
  brandSurfaceAlt: '#211C45',
  onBrand: '#FFFFFF',
  onBrandMuted: '#9C9AC4',

  bg: '#0E0B1F',
  surface: '#1A1730',
  surfaceAlt: '#231F3D',
  surfaceSunken: '#15122E',

  textPrimary: '#F5F4FF',
  textSecondary: '#C7C5DA',
  textMuted: '#8E8BA8',
  textInverse: '#1E1B4B',

  border: '#2A2647',
  borderStrong: '#37325A',
  divider: '#221E3C',

  overlay: 'rgba(5,4,12,0.7)',
  scrim: 'rgba(5,4,12,0.5)',

  // legacy aliases
  bodyBackground: '#0E0B1F',
  cardBackground: '#1A1730',
  bgMain: '#0E0B1F',
  bgCard: '#1A1730',
  borderLight: '#2A2647',
  textDark: '#F5F4FF',
  textLight: '#8E8BA8',
  background: '#0E0B1F',
  text: '#F5F4FF',
  inputBg: '#1A1730',
  surfaceSecondary: '#231F3D',
};

// ── Gradients (real expo-linear-gradient pairs — NOT CSS strings) ──
export const gradients = {
  brand: [BRAND.indigoDeep, BRAND.indigoDeepAlt],
  hero: [BRAND.indigoDeepAlt, BRAND.indigoDark],
  splash: [BRAND.indigoDeep, BRAND.indigoDark],
  cta: [BRAND.indigo, BRAND.indigoDark],
  gold: [BRAND.gold, BRAND.goldDeep],
};

// ── Per-module accent gradients (kids modules, harmonised) ──
// Each: { from, to, solid } — `from`/`to` feed <LinearGradient>.
export const moduleColors = {
  alphabet: { from: '#FB7185', to: '#F43F5E', solid: '#F43F5E' },
  urdu: { from: '#A78BFA', to: '#7C3AED', solid: '#7C3AED' },
  numbers: { from: '#34D399', to: '#059669', solid: '#10B981' },
  islamic: { from: '#38BDF8', to: '#4F46E5', solid: '#0EA5E9' },
  pakistan: { from: '#34D399', to: '#059669', solid: '#16A34A' },
  world: { from: '#38BDF8', to: '#0EA5E9', solid: '#0EA5E9' },
  habits: { from: '#FCD34D', to: '#F59E0B', solid: '#F59E0B' },
  stories: { from: '#FBBF24', to: '#F97316', solid: '#F59E0B' },
  games: { from: '#60A5FA', to: '#8B5CF6', solid: '#6366F1' },
};

// Add the module gradient pairs onto each palette under `gradients`
// so `Colors.gradients.alphabet` etc. resolve. Header/hero/cta too.
const moduleGradientPairs = Object.fromEntries(
  Object.entries(moduleColors).map(([k, v]) => [k, [v.from, v.to]])
);
const allGradients = { ...gradients, header: gradients.brand, ...moduleGradientPairs };

lightColors.gradients = allGradients;
darkColors.gradients = allGradients;

// ── Active default palette ────────────────────────────────────
export const colors = lightColors;
export const palettes = { light: lightColors, dark: darkColors };
export default colors;
