# Little Genius — Play Store Graphics

Generates premium, branded marketing graphics from your real app screenshots:

- **7 phone screenshots** — `1080 × 1920` each
- **1 feature graphic / banner** — `1024 × 500`

All output uses the app's brand palette (deep indigo `#1E1B4B` + gold `#FCD34D`) and the
**Baloo 2** font, with each real screenshot framed inside a premium phone mockup.

## 1. Add your raw screenshots

Save your captured screenshots into [`raw/`](raw/) using these exact names:

| File | Screen to use |
|------|---------------|
| `01-home.png`       | Home / Learning Modules (light theme) |
| `02-abc.png`        | English ABC |
| `03-numbers.png`    | Numbers 1–100 (the "Twenty" + lollipops screen) |
| `04-islamic.png`    | Islamic Studies (Kalmas) |
| `05-stories.png`    | Moral Stories list |
| `06-games.png`      | Brain Games list |
| `07-onboarding.png` | Profile Setup ("Hi, Basit!") |

> Use clean portrait screenshots (no notification shade pulled down). The template trims the
> top status bar slightly, so the device clock/battery won't be prominent.

## 2. Generate

```bash
cd store-assets
npm install        # one-time: downloads Puppeteer + Chromium
npm run generate
```

PNGs are written to [`out/`](out/). Upload them to **Play Console → Store listing → Graphics**:
- `feature-graphic.png` → *Feature graphic*
- `01..07-*.png` → *Phone screenshots*

## 3. Customize

- **Copy & colors:** edit [`config.js`](config.js) — change any `headline`, `subtitle`, or per-slide
  `color` (indigo / coral / green / blue / orange / purple / gold), then re-run `npm run generate`.
- **Layout / styling:** edit [`templates/screenshot.html`](templates/screenshot.html) and
  [`templates/feature-graphic.html`](templates/feature-graphic.html).

## Notes

- Requires internet on first run (Chromium download + Baloo 2 font from Google Fonts).
- Play Store requirements met: feature graphic `1024×500`; screenshots `1080×1920` (within the
  320–3840 px limits, 16:9 portrait); PNG, no transparency issues.
- **Fallback (no Puppeteer):** open a template in Chrome, open DevTools → device toolbar, set the
  exact size, then *⋮ → Capture screenshot*. (The automated script is the recommended path.)
