# Little Genius — SVG UI/UX Migration & OTA Plan

> Status: infrastructure landed, chrome migration pending.
> Owner: engineering. Last updated: 2026-07-05.

## 1. Goal

Give the app a premium, cohesive, hand-crafted feel by replacing **structural
emoji** (navigation, tiles, hero art, rewards, states, buttons) with flat SVG
illustrations — **without** bloating the bundle or the effort budget, and in a
way that lets every future conversion ship **over-the-air (no new build)**.

The app currently has ~1121 emoji usages across ~61 files. The overwhelming
majority are **long-tail educational content** (hundreds of unique animals,
fruits, letters living in `src/Data/*`). Those are *not* in scope — see §3.

## 2. What's already in place

| Piece | Where | Native? | Notes |
|-------|-------|---------|-------|
| SVG renderer | `react-native-svg 15.12.1` (dependency) | **Yes — must be in the build** | Autolinks into the binary even if no JS imports it yet |
| OTA updates | `expo-updates ~29.0.18` | **Yes** | `updates.url` → `u.expo.dev/8a38e79f…`, `fallbackToCacheTimeout: 0` |
| Animations | `lottie-react-native 7.3.1` | **Yes** | Lottie art is OTA-able too |
| SVG transformer | `react-native-svg-transformer` (**dependency**) | No — build-time only | Runs at every bundle/export incl. `eas update` |
| Metro wiring | `metro.config.js` | No — build-time only | `.svg` moved from `assetExts` → `sourceExts` |
| runtimeVersion | `app.config.js` → `policy: 'appVersion'` (pinned to `version: 1.1.0`) | — | Controls which builds an OTA update reaches |
| OTA channels | `eas.json` (development / preview / production) | — | Target with `eas update --channel …` |
| Asset folder | `src/Assets/svg/` (`apple`, `star`, `cat`) | — | Flat POC art |
| Registry | `src/Assets/svg/index.js` | — | `name → component` map; `SVGS`, `hasSvg()` |
| Component | `src/Components/Common/Illustration.jsx` | — | Renders registered SVG or emoji fallback |

## 3. Scope: chrome, not content

**In scope (≈30–50 icons) — hand-author as SVG:** `PremiumTabBar` icons,
category/module tiles (`src/Data/learnModulesData.js`), home hero + section
headers, rewards (stars/streaks/badges/celebration), empty/success/error states,
primary action buttons.

**Out of scope — keep as emoji:** per-item educational content in `src/Data/*`.
Converting it would balloon the bundle for near-zero UX gain. It still flows
through `<Illustration>`, so any single item can be promoted later with no code
change. **Skia and any other native lib are out** — `react-native-svg` +
`lottie-react-native` cover every need.

## 4. Migration pattern (incremental, non-breaking)

`Illustration` renders a registered SVG **or** falls back to the original emoji,
so we migrate one icon at a time; anything not yet drawn keeps its emoji.

```jsx
// Before
<Text style={{ fontSize: 64 }}>🍎</Text>

// After — SVG once "apple" is registered, else the emoji fallback
<Illustration name="apple" size={64} fallback="🍎" />
```

Per icon: author a **flat** SVG (few paths, no filters/masks/gradients where
avoidable, square `viewBox`, a few KB) → add one import + one line to
`src/Assets/svg/index.js` → swap the emoji `<Text>` for `<Illustration>` → drop
`fallback` once every use is migrated.

### Art style
Flat, rounded, friendly; consistent stroke weight/corner radius; 2–5 fills, one
accent highlight max; on-brand palette (indigo `#1E1B4B` base, warm accents); no
external fonts/filters so it renders identically offline.

## 5. OTA readiness — the one rule that keeps conversions build-free

This build already contains every **native** piece (`react-native-svg`,
`expo-updates`, `lottie-react-native`). Therefore a future emoji→SVG conversion
is **pure JS/asset** — a new `.svg`, a registry line, a `<Text>`→`<Illustration>`
swap — and ships with `eas update`, **no rebuild**.

**The rule:** **do not change `version` in `app.config.js` for JS-only changes.**
`runtimeVersion.policy: 'appVersion'` pins updates to builds whose `version`
matches (currently `1.1.0`). Bump `version` **and rebuild** only when native code
/ native modules change. `production.autoIncrement` in `eas.json` bumps only the
store build number / `versionCode`, **not** `version`, so it does not break OTA
targeting.

Why the transformer is a **dependency** (not devDependency): `eas update` runs a
Metro export to build the OTA bundle. If that export ever runs with production
installs (`npm install --omit=dev`), a devDep transformer would be missing and
the SVG export would fail. As a regular dependency it is always present. It still
costs nothing at runtime — used only at bundle time.

## 6. Phased rollout

- **Phase 1 — Infra (done):** packages, metro, OTA, scaffold, transformer as dep.
- **Phase 2 — Chrome migration** in impact order: tab bar → category tiles →
  home hero → rewards → empty/success states → buttons. All OTA-shippable.
- **Phase 3 — Docs (this file).**
- **Phase 4 — Build & validate** (see §7).

## 7. Verification checklist

Before cutting the store build:
- [ ] `npx expo-doctor` / `npx expo install --check` — deps match SDK 54.
- [ ] `npx expo export --platform android` — `.svg` imports bundle with no
      Metro/transformer error (same bundling `eas update` performs).
- [ ] `npx expo start` — a registered `<Illustration>` renders as SVG; an
      unregistered name falls back to emoji.

Then:
- [ ] `eas build --profile production` (or `preview` to test on device first).
- [ ] OTA smoke test: convert one emoji→SVG, `eas update --channel preview`,
      confirm the installed build picks it up on next launch — proving future
      conversions need no rebuild.

## 8. Adding new art (quick reference)

1. Drop `foo.svg` in `src/Assets/svg/`.
2. In `src/Assets/svg/index.js`: `import Foo from './foo.svg';` and add
   `foo: Foo` to `SVGS`.
3. Use `<Illustration name="foo" size={64} />` anywhere.
4. `eas update --channel <channel>` — done, no rebuild.
