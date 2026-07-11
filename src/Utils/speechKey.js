// speechKey — the ONE place that turns a (language, text) pair into the stable
// key used to name / look up a pre-baked audio clip.
//
// CRITICAL: this exact file is imported by BOTH
//   • the runtime engine (src/Utils/speechEngine.js), and
//   • the build-time generator (scripts/generateAudio.mjs).
// The key MUST be identical in both, or a clip generated at build time will
// never be found at runtime and the app silently falls back to device TTS.
// That is why the hash is a small PURE-JS function (no crypto, no Buffer) —
// it produces the same result under Node and React Native's Hermes engine.
//
// Keep normalize() minimal and deterministic. Anything you add here you must
// re-generate all audio for.

// Collapse a language code to its base ("en-US" -> "en", "ur-PK" -> "ur").
export const langPrefix = (language) =>
  `${language || 'en'}`.toLowerCase().split(/[-_]/)[0];

// Normalize the spoken text so incidental whitespace / casing differences
// between a data file and a call site don't produce two different keys.
//  - trim ends
//  - collapse any run of whitespace (incl. newlines) to a single space
//  - lowercase (harmless for Urdu/Arabic script; dedupes English casing)
export const normalize = (text) =>
  `${text ?? ''}`.replace(/\s+/g, ' ').trim().toLowerCase();

// One 32-bit FNV-1a lane. Math.imul gives exact 32-bit multiply that is
// bit-identical under Node and React Native (Hermes/JSC), which is what makes
// the key stable across build time and runtime. Each UTF-16 unit is folded in
// as its low + high byte so non-Latin (Urdu/Arabic) text hashes fully.
const fnv1a32 = (str, seed) => {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h = Math.imul(h ^ (c & 0xff), 0x01000193);
    h = Math.imul(h ^ ((c >>> 8) & 0xff), 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
};

// 64-bit-wide key = two independent 32-bit FNV-1a lanes (different seeds),
// concatenated to 16 lowercase hex chars. Collisions across a few thousand
// clips are negligible (~n²/2⁶⁴).
const hash64Hex = (str) =>
  fnv1a32(str, 0x811c9dc5) + fnv1a32(str, 0x1b873593);

// Public: stable clip key for a spoken string in a language.
// Same input -> same 16-char hex under Node and React Native.
export const speechKey = (language, text) =>
  hash64Hex(`${langPrefix(language)}|${normalize(text)}`);

export default speechKey;
