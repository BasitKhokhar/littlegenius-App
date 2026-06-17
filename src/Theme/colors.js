
const littleGenius = {
  bodyBackground: '#F4F0FF',       // Soft violet-white — main screen bg
  cardBackground: '#FFFFFF',       // Pure white cards
  headerBackground: '#1E1B4B',     // Deep indigo — header & tab bar
  headerSurface: '#312E81',        // Slightly lighter indigo — icons/badges
  primary: '#6366F1',              // Indigo — primary actions
  primaryDark: '#4338CA',          // Darker indigo
  primaryLight: '#EDE9FE',         // Very light indigo — badge backgrounds
  accent: '#FCD34D',               // Gold — stars, highlights
  secondary: '#A5B4FC',            // Soft periwinkle
  textPrimary: '#1E1B4B',          // Deep indigo text
  textSecondary: '#374151',
  textMuted: '#6B7280',
  textInverse: '#FFFFFF',
  border: '#EDE9FE',
  divider: '#F3F4F6',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  gradients: {
    header: ['#1E1B4B', '#312E81'],
    hero: ['#1E1B4B', '#4338CA'],
    splash: ['#1E1B4B', '#6366F1'],
  },
};


// ── Active Theme ──────────────────────────────────────────────
const activeTheme = 'littleGenius';
const themes = { littleGenius };
export const colors = themes[activeTheme];
export default colors;