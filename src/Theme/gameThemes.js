// ──────────────────────────────────────────────────────────────
// gameThemes — per-game "cartoon premium" visual theme for the
// gameplay screens (NOT the Games menu, which stays as-is).
//
// Every game exposes BOTH a `light` and a `dark` variant so the play
// screens follow the app's active theme exactly like the rest of the
// app. Light = the vivid kid gradient; dark = a deep, richer version
// of the SAME hue (a "night" version) — still colourful, never a flat
// black. Pick the variant with the existing hook:
//
//   const { isDark } = useTheme();
//   const t = getGameTheme(gameId, isDark);   // → { bg, accent, deco, mascot }
//
// `bg`     → 3-stop full-bleed background gradient for <GameStage>
// `accent` → candy colour for the primary action tiles / buttons
// `deco`   → tint for the floating decoration bubbles
// `mascot` → the big character emoji (theme-independent)
// ──────────────────────────────────────────────────────────────

const DECO_LIGHT = 'rgba(255,255,255,0.16)';
const DECO_DARK = 'rgba(255,255,255,0.07)';

// Keyed by game id (1-6 = GamePlay mini-games, 7/10 = dedicated screens).
export const gameThemes = {
  // Pattern Match — sunset
  1: {
    mascot: '🦋',
    light: { bg: ['#FDBA74', '#FB7185', '#F43F5E'], accent: '#F43F5E', deco: DECO_LIGHT },
    dark: { bg: ['#4A1220', '#6D1F2E', '#340C17'], accent: '#FB7185', deco: DECO_DARK },
  },
  // Memory Game — mint → ocean
  2: {
    mascot: '🐘',
    light: { bg: ['#6EE7B7', '#34D399', '#2563EB'], accent: '#10B981', deco: DECO_LIGHT },
    dark: { bg: ['#06302B', '#0A3B44', '#0A2540'], accent: '#34D399', deco: DECO_DARK },
  },
  // Odd One Out — grape
  3: {
    mascot: '🦉',
    light: { bg: ['#C4B5FD', '#A78BFA', '#7C3AED'], accent: '#7C3AED', deco: DECO_LIGHT },
    dark: { bg: ['#241A4A', '#2E1F5C', '#1B1440'], accent: '#A78BFA', deco: DECO_DARK },
  },
  // Math Race — sky
  4: {
    mascot: '🚀',
    light: { bg: ['#67E8F9', '#38BDF8', '#2563EB'], accent: '#2563EB', deco: DECO_LIGHT },
    dark: { bg: ['#082B3A', '#0B3A5A', '#0A2540'], accent: '#38BDF8', deco: DECO_DARK },
  },
  // Color Match — candy pink
  5: {
    mascot: '🌈',
    light: { bg: ['#FDA4AF', '#F472B6', '#EC4899'], accent: '#EC4899', deco: DECO_LIGHT },
    dark: { bg: ['#3E1230', '#521436', '#340E24'], accent: '#F472B6', deco: DECO_DARK },
  },
  // Shape Quiz — indigo
  6: {
    mascot: '🔷',
    light: { bg: ['#A5B4FC', '#818CF8', '#6366F1'], accent: '#6366F1', deco: DECO_LIGHT },
    dark: { bg: ['#1B1B45', '#262357', '#15122E'], accent: '#818CF8', deco: DECO_DARK },
  },
  // Tracing Worksheet — violet
  7: {
    mascot: '🐱',
    light: { bg: ['#C4B5FD', '#A78BFA', '#7C3AED'], accent: '#7C3AED', deco: DECO_LIGHT },
    dark: { bg: ['#241A4A', '#2E1F5C', '#1B1440'], accent: '#A78BFA', deco: DECO_DARK },
  },
  // Letter Puzzle — ocean (fish)
  10: {
    mascot: '🐟',
    light: { bg: ['#5EEAD4', '#22D3EE', '#0EA5E9'], accent: '#0EA5E9', deco: DECO_LIGHT },
    dark: { bg: ['#0B2A4A', '#0E3A5F', '#0A2540'], accent: '#22D3EE', deco: DECO_DARK },
  },
};

// Route → id alias so screens without a numeric gameId can look themselves up.
export const routeToGameId = {
  TracingWorksheet: 7,
  ColoringBook: 8,
  DrawingBoard: 9,
  LetterPuzzle: 10,
};

// Neutral fallback (uses the module "games" hue) if an id is missing.
const FALLBACK = {
  mascot: '🎮',
  light: { bg: ['#818CF8', '#6366F1', '#4338CA'], accent: '#6366F1', deco: DECO_LIGHT },
  dark: { bg: ['#1B1B45', '#262357', '#15122E'], accent: '#818CF8', deco: DECO_DARK },
};

// Resolve a flat theme for the active mode.
//   getGameTheme(4, isDark) → { mascot, bg, accent, deco }
export const getGameTheme = (key, isDark = false) => {
  const id = typeof key === 'number' ? key : routeToGameId[key];
  const entry = gameThemes[id] || FALLBACK;
  const variant = isDark ? entry.dark : entry.light;
  return { mascot: entry.mascot, ...variant };
};

export default gameThemes;
