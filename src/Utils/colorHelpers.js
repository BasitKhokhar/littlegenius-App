// ──────────────────────────────────────────────────────────────
// colorHelpers — tiny hex-colour math for building gradients out of
// the single accent colour most data files already carry (module
// colours, quiz pack colours, story colours). Lets quiz/game screens
// share the "cartoon premium" gradient-stage look without every data
// file having to hand-author a matching gradient pair.
// ──────────────────────────────────────────────────────────────

const clamp255 = (v) => Math.max(0, Math.min(255, Math.round(v)));

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};

const rgbToHex = ({ r, g, b }) =>
  '#' + [r, g, b].map((v) => clamp255(v).toString(16).padStart(2, '0')).join('');

// Blend a hex colour toward white (amt < 0) or black (amt > 0).
// amt is a 0–1 mix fraction, e.g. shadeColor('#F43F5E', 0.3) is 30% darker.
export const shadeColor = (hex, amt) => {
  const { r, g, b } = hexToRgb(hex);
  const target = amt < 0 ? 255 : 0;
  const p = Math.min(1, Math.abs(amt));
  return rgbToHex({
    r: r + (target - r) * p,
    g: g + (target - g) * p,
    b: b + (target - b) * p,
  });
};

// Build a 3-stop light→base→deep gradient from a single accent hex — the
// same shape GameStage/gameThemes expect for `bg`, so any screen with just
// one brand colour (quiz packs, stories) can drop into the same full-bleed
// gradient-stage treatment used by the mini-games. `isDark` swaps in a
// deep, desaturated-toward-black trio (mirrors gameThemes' hand-authored
// dark variants) instead of the vivid light-mode trio.
export const gradientStageFromAccent = (hex, isDark = false) =>
  isDark
    ? [shadeColor(hex, 0.8), shadeColor(hex, 0.7), shadeColor(hex, 0.88)]
    : [shadeColor(hex, -0.32), hex, shadeColor(hex, 0.34)];

export default { shadeColor, gradientStageFromAccent };
