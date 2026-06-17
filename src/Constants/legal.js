// ──────────────────────────────────────────────────────────────
// Legal / Compliance configuration — SINGLE SOURCE OF TRUTH
//
// After you deploy the "littlegenius-legalpages" website to Netlify,
// replace LEGAL_BASE_URL below with your live Netlify URL.
// Everything else (in-app links, Play Console, store listing) reads
// from this file, so you only change it in ONE place.
// ──────────────────────────────────────────────────────────────

// 👉 CHANGE THIS to your real Netlify URL after deploying.
export const LEGAL_BASE_URL = 'https://littlegenius-legal.netlify.app';

// Public contact shown for support + child-safety reports.
// 👉 CHANGE THIS to a mailbox you actually monitor.
export const SUPPORT_EMAIL = 'support@littlegenius.app';

export const LEGAL_URLS = {
  HOME:           `${LEGAL_BASE_URL}/`,
  PRIVACY:        `${LEGAL_BASE_URL}/privacy.html`,
  TERMS:          `${LEGAL_BASE_URL}/terms.html`,
  CHILD_SAFETY:   `${LEGAL_BASE_URL}/child-safety.html`,
  DATA_DELETION:  `${LEGAL_BASE_URL}/data-deletion.html`,
};

export default LEGAL_URLS;
