// ──────────────────────────────────────────────────────────────
// colorsTheme — THIN ALIAS. The real palette now lives in one place:
//   src/Theme/colors.js  (single source of truth, light + dark ready)
//
// This file is kept only so existing `import { Colors } from
// '../../Data/colorsTheme'` call-sites keep working. It re-exports the
// light palette (which carries all the legacy keys: bgCard, textLight,
// borderLight, amber, purple, blue, pink, primary, primaryDark, …).
// Do NOT add new colours here — add them to src/Theme/colors.js.
// ──────────────────────────────────────────────────────────────
import { lightColors, moduleColors } from '../Theme/colors';

export const Colors = lightColors;
export { moduleColors };
export default Colors;
