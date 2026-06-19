// ──────────────────────────────────────────────────────────────
// Elevation — a 5-level soft-shadow system (replaces ad-hoc shadows).
// Cross-platform: iOS shadow* props + Android elevation.
// Use `coloredShadow(hex, level)` for premium tinted shadows on hero
// cards / CTAs.
// ──────────────────────────────────────────────────────────────

export const Elevation = {
  flat: {},
  sm: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  lg: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 10,
  },
  xl: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 18,
  },
};

// Tinted shadow that picks up a brand/module colour for a richer,
// "expensive" depth on coloured cards & primary CTAs.
export const coloredShadow = (hex, level = 'md') => {
  const base = Elevation[level] || Elevation.md;
  return { ...base, shadowColor: hex, shadowOpacity: Math.min(base.shadowOpacity + 0.18, 0.4) };
};

// Back-compat alias for the old `Shadow` token (sm/md/lg).
export const Shadow = { sm: Elevation.sm, md: Elevation.md, lg: Elevation.lg };

export default Elevation;
