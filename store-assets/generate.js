/**
 * Renders the HTML design templates to exact-size Play Store PNGs.
 *
 *   npm install      (one-time — downloads puppeteer + Chromium)
 *   npm run generate
 *
 * Output lands in ./out/  (7 screenshots @ 1080x1920 + feature-graphic @ 1024x500)
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { ACCENTS, screenshots, featureGraphic } = require('./config');

const ROOT = __dirname;
const RAW = path.join(ROOT, 'raw');
const OUT = path.join(ROOT, 'out');
const TPL = path.join(ROOT, 'templates');
const LOGO = path.join(ROOT, '..', 'assets', 'logo.png');

const FONT_LINK =
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap" rel="stylesheet">';

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

function dataUri(file) {
  const ext = path.extname(file).toLowerCase();
  const b64 = fs.readFileSync(file).toString('base64');
  return `data:${MIME[ext] || 'image/png'};base64,${b64}`;
}

async function waitReady(page) {
  // wait for fonts + all <img> to finish decoding
  await page.evaluate(async () => {
    await document.fonts.ready;
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = img.onerror = res;
            })
      )
    );
  });
}

async function renderScreenshot(page, cfg) {
  const imgPath = path.join(RAW, cfg.image);
  if (!fs.existsSync(imgPath)) {
    console.warn(`  ⚠  SKIP ${cfg.out}: raw/${cfg.image} not found`);
    return false;
  }
  const a = ACCENTS[cfg.color] || ACCENTS.indigo;
  let html = fs.readFileSync(path.join(TPL, 'screenshot.html'), 'utf8');
  html = html.replace('<head>', '<head>' + FONT_LINK);

  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });

  const shot = dataUri(imgPath);
  await page.evaluate(
    (cfg, a, shot) => {
      const b = document.body;
      b.style.setProperty('--accent', a.accent);
      b.style.setProperty('--glow', a.glow);
      b.style.setProperty('--glow-soft', a.glowSoft);
      document.getElementById('headline').innerHTML = cfg.headline;
      document.getElementById('subtitle').textContent = cfg.subtitle;
      const badge = document.getElementById('badge');
      if (!cfg.badge) badge.style.display = 'none';
      document.getElementById('shot').src = shot;
    },
    cfg, a, shot
  );

  await waitReady(page);
  await page.screenshot({ path: path.join(OUT, `${cfg.out}.png`), type: 'png' });
  console.log(`  ✔  ${cfg.out}.png  (1080x1920)`);
  return true;
}

async function renderFeature(page, cfg) {
  const imgPath = path.join(RAW, cfg.image);
  if (!fs.existsSync(imgPath)) {
    console.warn(`  ⚠  SKIP feature-graphic: raw/${cfg.image} not found`);
    return false;
  }
  let html = fs.readFileSync(path.join(TPL, 'feature-graphic.html'), 'utf8');
  html = html.replace('<head>', '<head>' + FONT_LINK);

  await page.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });

  const shot = dataUri(imgPath);
  const logo = dataUri(LOGO);
  await page.evaluate(
    (shot, logo) => {
      document.getElementById('shot').src = shot;
      document.getElementById('logo').src = logo;
    },
    shot, logo
  );

  await waitReady(page);
  await page.screenshot({ path: path.join(OUT, `${cfg.out}.png`), type: 'png' });
  console.log(`  ✔  ${cfg.out}.png  (1024x500)`);
  return true;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  console.log('Launching headless Chrome…');
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  console.log('\nScreenshots:');
  let ok = 0;
  for (const cfg of screenshots) if (await renderScreenshot(page, cfg)) ok++;

  console.log('\nFeature graphic:');
  const fOk = await renderFeature(page, featureGraphic);

  await browser.close();
  console.log(`\nDone — ${ok}/${screenshots.length} screenshots + ${fOk ? 1 : 0} feature graphic in ./out/`);
  if (ok < screenshots.length) {
    console.log('Add the missing files to ./raw/ (see README) and re-run `npm run generate`.');
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
