// ──────────────────────────────────────────────────────────────
// Theme Colors for Little Genius — the INDIGO system.
//
// Values are derived from the single source of truth in
// src/Theme/colors.js so the login flow and the learning screens
// can never drift apart again. Key names are kept identical to the
// original palette so every screen consuming `Colors` adopts indigo
// automatically. Vibrant `secondary/amber/purple/blue/pink` remain as
// per-module accent colours (harmonised to sit on the indigo shell).
// ──────────────────────────────────────────────────────────────
import { colors } from '../Theme/colors';

export const Colors = {
  // Brand (indigo)
  primary: colors.primary,          // #6366F1
  primaryDark: colors.primaryDark,  // #4338CA

  // Positive / "correct" accent (used by quiz + game screens)
  secondary: colors.success,        // #10B981 emerald
  secondaryDark: '#059669',

  // Vibrant module accents (cards/badges stay colourful for kids)
  amber: colors.warning,            // #F59E0B
  purple: '#8B5CF6',                // violet
  blue: '#3B82F6',                  // sky
  pink: '#EC4899',                  // rose

  // Surfaces & text (indigo shell)
  bgMain: colors.bodyBackground,    // #F4F0FF soft violet-white
  bgCard: colors.cardBackground,    // #FFFFFF
  borderLight: colors.border,       // #EDE9FE
  textDark: colors.textPrimary,     // #1E1B4B deep indigo
  textLight: colors.textMuted,      // #6B7280

  // Indigo-anchored gradients for the learning modules
  gradAlphabet: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
  gradUrdu: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
  gradNumbers: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
  gradIslamic: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
  gradGames: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
  gradStories: 'linear-gradient(135deg, #F59E0B 0%, #6366F1 100%)',
};

export default Colors;
