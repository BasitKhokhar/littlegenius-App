// ──────────────────────────────────────────────────────────────
// Fonts — SINGLE SOURCE OF TRUTH for the app's typography families.
//
// Latin/UI  → Baloo 2 (rounded, friendly, professional kids font)
// Urdu      → Noto Nastaliq Urdu (proper Nastaliq script)
// Arabic    → Noto Naskh Arabic (Quran / Duas)
//
// The actual .ttf assets are registered in App.jsx via useFonts().
// Use weightToFamily() to map a numeric/string fontWeight to the
// matching Baloo 2 family — this powers the global Text interceptor
// so every existing `fontWeight` keeps its visual hierarchy.
// ──────────────────────────────────────────────────────────────

// Baloo 2 family names (must match the keys registered in useFonts).
export const Fonts = {
  // Latin / UI weights
  regular: 'Baloo2_400Regular',
  medium: 'Baloo2_500Medium',
  semiBold: 'Baloo2_600SemiBold',
  bold: 'Baloo2_700Bold',
  extraBold: 'Baloo2_800ExtraBold',

  // Urdu (Nastaliq)
  urdu: 'NotoNastaliqUrdu_400Regular',
  urduBold: 'NotoNastaliqUrdu_700Bold',

  // Arabic (Naskh) — Quran / Duas
  arabic: 'NotoNaskhArabic_400Regular',
  arabicBold: 'NotoNaskhArabic_700Bold',
};

// Map a React Native fontWeight to the nearest Baloo 2 family.
// Baloo 2 ships 400 / 500 / 600 / 700 / 800 only.
export const weightToFamily = (weight) => {
  if (weight == null) return Fonts.regular;

  // 'normal' → 400, 'bold' → 700
  if (weight === 'normal') return Fonts.regular;
  if (weight === 'bold') return Fonts.bold;

  const n = typeof weight === 'number' ? weight : parseInt(weight, 10);
  if (Number.isNaN(n)) return Fonts.regular;

  if (n >= 800) return Fonts.extraBold; // 800, 900
  if (n >= 700) return Fonts.bold;      // 700
  if (n >= 600) return Fonts.semiBold;  // 600
  if (n >= 500) return Fonts.medium;    // 500
  return Fonts.regular;                 // 100–400
};

// The asset map consumed by useFonts() in App.jsx.
// Imported lazily there to avoid require cycles in this module.
export default Fonts;
