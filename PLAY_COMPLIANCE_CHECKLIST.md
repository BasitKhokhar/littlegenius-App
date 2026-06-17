# Little Genius — Play Store Compliance Checklist

This file documents the critical compliance fixes applied in code and the exact
Google Play Console answers to use at submission.

---

## ✅ Critical fixes applied (in code)

| Fix | Where |
|-----|-------|
| PINs no longer stored in plaintext — salted SHA-256 hash + secure keystore token | `src/Utils/secureAuth.js`, `src/Context/AuthContext.jsx` |
| Login/Signup migrated to secure auth (auto-migrates legacy plaintext records) | `src/Screens/Auth/Login.jsx`, `src/Screens/Auth/Signup.jsx` |
| Account & data deletion (in-app, parental-gated + confirm) | `src/Context/AuthContext.jsx` (`deleteAccount`), `src/Screens/Settings/SettingsScreen.jsx` |
| Parental gate before account creation & deletion | `src/Components/UI/ParentalGate.jsx` |
| Parental consent + Privacy/Terms links on signup | `src/Screens/Auth/Signup.jsx` |
| In-app legal links (Privacy, Terms, Child Safety, Data Deletion) + Support email | `src/Screens/Settings/SettingsScreen.jsx` |
| Single source of truth for legal URLs / support email | `src/Constants/legal.js` |
| New deps: `expo-crypto`, `expo-secure-store` | `package.json` |

### ✅ Additional hardening (font/theme/content update)

| Change | Where |
|--------|-------|
| **External links now behind the parental gate** (Privacy/Terms/Child-Safety/Data-Deletion/Support) — required by Families policy for links that leave the app | `src/Screens/Settings/SettingsScreen.jsx` |
| Professional bundled fonts (Baloo 2 + Noto Nastaliq Urdu + Noto Naskh Arabic) — no network/font CDN calls, keeps the app fully offline | `App.jsx`, `src/Theme/fonts.js`, `src/Theme/applyGlobalFont.js` |
| Single indigo theme app-wide (login → all screens) | `src/Theme/colors.js`, `src/Data/colorsTheme.js` |
| Age-appropriate educational content expanded: 30 Duas, 99 Names of Allah, 11 Prophet stories, Islamic manners, Wudu & Salah steps, Pakistan GK, extra moral stories & quizzes | `src/Data/*` |

> All added content is original/educational text (no third-party copyrighted media, no user-generated content, no chat) — consistent with Designed-for-Families requirements.

### ⚠️ Before building, run:
```bash
npx expo install expo-crypto expo-secure-store expo-font
```
(Confirms versions match Expo SDK 54. `expo-font` is now used to bundle the app fonts.)

### 👉 After deploying the legal website, set in `src/Constants/legal.js`:
```js
export const LEGAL_BASE_URL = 'https://YOUR-SITE.netlify.app';
export const SUPPORT_EMAIL  = 'your-real-support@email.com';
```

---

## 📋 Google Play Console — Data Safety form answers

Little Genius is **fully offline** and never transmits data off the device. Under Google's
definition, "collection" = transmitted off device; on-device-only processing is **not** collection.

| Question | Answer |
|----------|--------|
| Does your app collect or share any of the required user data types? | **No** |
| Is all of the user data encrypted in transit? | N/A (no data leaves the device) |
| Do you provide a way for users to request data deletion? | **Yes** — in-app `Settings → Delete Account & Data`, plus the Data Deletion web page |

> ⚠️ This "No collection" answer is **only valid while the app stays offline with no analytics/ads/crash SDK**. If you ever add Firebase, AdMob, analytics, or `expo-updates`, you MUST re-do this form.

---

## 📋 Google Play Console — other required sections

- **Privacy policy URL:** `https://YOUR-SITE.netlify.app/privacy.html`
- **App content → Data deletion:** `https://YOUR-SITE.netlify.app/data-deletion.html`
- **Target audience & content:** include children age bands → enroll in **Designed for Families**.
- **Content rating (IARC):** complete the questionnaire honestly (educational, no violence/ads).
- **Child safety standards (CSAE):** publish `https://YOUR-SITE.netlify.app/child-safety.html` and provide your support email as the reporting contact.
- **Ads declaration:** "No, my app does not contain ads."

---

## 🟡 Recommended (not blockers)

- In `app.config.js`, optionally strip the auto-added INTERNET permission to back the
  "100% offline" claim:
  ```js
  android: {
    package: 'com.littlegenius.app',
    permissions: [],
    // blockedPermissions: ['android.permission.INTERNET'],
  }
  ```
- Remove dead `src/Screens/Profile/ProfileScreen.jsx` (unused news-app template).
- Verify the build targets a current Android API level (Expo SDK 54 → API 35).
