# Play Store Readiness Audit — Little Genius (Kids App)

_Generated alongside the premium theme redesign. Scope: a **fully offline children's education app** (no login, no ads, no analytics). Aligned to Google Play policy as of **mid-2026**. Builds on `PLAY_CONSOLE_GUIDE.md` / `PLAY_COMPLIANCE_CHECKLIST.md`._

Legend: **[code]** I can change in the repo · **[console]** you do in Play Console · **[host]** content/website · **[verify]** confirm before release.

---

## 🔴 Must-fix before upload

### 1. Strip sensitive Android permissions — ✅ **APPLIED**
> **Done:** `app.config.js` now sets `android.permissions` + `blockedPermissions`, and `android/app/src/main/AndroidManifest.xml` marks the three permissions `tools:node="remove"` (with the `xmlns:tools` namespace added). **Re-verify the merged manifest after your next release build** (`./gradlew :app:assembleRelease` → check the merged manifest, or run `npx expo prebuild --clean`).

Original finding — `AndroidManifest.xml` had declared:

| Permission | Needed? | Action |
|---|---|---|
| `INTERNET` | Borderline (only for opening legal links via browser) | Keep — low risk, but Data Safety must still say "no data collected". |
| `VIBRATE` | ✅ yes (`expo-haptics`) | Keep. |
| `SYSTEM_ALERT_WINDOW` | ❌ **No** | **Remove.** "Draw over other apps" is high-risk and a common **Families-policy rejection** trigger. |
| `READ_EXTERNAL_STORAGE` | ❌ **No** | **Remove.** App stores only local key-value data (AsyncStorage/SecureStore). |
| `WRITE_EXTERNAL_STORAGE` | ❌ **No** | **Remove.** Deprecated on API 33+, heavily scrutinized for kids apps. |

These appear auto-injected by prebuild, not by intent. Recommended fix in `app.config.js`:
```js
android: {
  // …existing…
  permissions: [],                                  // request none beyond defaults
  blockedPermissions: [
    'android.permission.SYSTEM_ALERT_WINDOW',
    'android.permission.READ_EXTERNAL_STORAGE',
    'android.permission.WRITE_EXTERNAL_STORAGE',
  ],
}
```
This was applied as described above.

### 2. Privacy Policy URL — ✅ **RESOLVED**
`src/Constants/legal.js` now points at the **live** domain `https://litlegeniuslegalpages.netlify.app` with clean paths. All four pages were fetched and verified valid (not 404):
- `/privacy` — "Privacy Policy — Little Genius" (effective 15 June 2026, COPPA/GDPR, "100% offline, data stays on device") ✓
- `/terms` — "Terms & Conditions" ✓
- `/data-deletion` — "Account & Data Deletion" (in-app + uninstall instructions, no server-side data) ✓
- `/child-safety` — "Child Safety Standards" (zero-tolerance CSAE, no chat/UGC, reporting) ✓

For Play Console, paste **`https://litlegeniuslegalpages.netlify.app/privacy`** as the Privacy Policy URL, and use `/child-safety` for the child-safety standards field.

### 3. Target API level — **[verify]**
- New apps & updates must **target Android 15 (API 35)**.
- Project is Expo SDK 54 / RN 0.81 (defaults to 35). `android/build.gradle` resolves `targetSdkVersion` from `rootProject.ext`. **Confirm the resolved value is ≥ 35** in your EAS build output. Bump via `expo-build-properties` if needed.

---

## 🟢 Already in good shape

- **Edge-to-edge:** `android/gradle.properties` has `edgeToEdgeEnabled=true` ✓ (Android 15 enforces edge-to-edge). The redesign's `Screen` wrapper + `useSafeAreaInsets()` in `Header`/`BottomSheet` keep content clear of system bars.
- **No ads / no IAP / offline:** no ad SDK, no billing, no network data calls → simplest Families-policy posture. Keep it ad-free, or only ever use Google's **Families-self-certified** ad SDKs.
- **Parental gate:** `ParentalGate` (math challenge) protects external links **and** destructive actions (profile reset) — required pattern for kids apps. ✓
- **No login / no account:** nothing to declare for "App access"; note "no login required" for reviewers. No account-deletion endpoint needed (data is local; in-app "Reset Profile & Data" covers local deletion).
- **Local-only storage:** AsyncStorage + `expo-secure-store` + `expo-crypto` — no off-device transmission.

---

## 🟡 Play Console tasks — **[console]**

- [ ] **Target audience & content** → select **Children** (triggers **Designed for Families / Families policy** compliance).
- [ ] **Content rating** → complete the **IARC questionnaire** (declare educational, no violence/ads).
- [ ] **Data safety form** → declare **no data collected / no data shared** (local-only). Match this to the stripped permissions above.
- [ ] **App category** → Education (consider "Designed for Families" program enrolment).
- [ ] **Store listing assets** → app icon (have `assets/logo.png`), **feature graphic** (1024×500), ≥2 phone **screenshots** (use the redesigned Splash/Onboarding/Home/Module screens), short + full description.
- [ ] **Privacy Policy URL** field → paste the live URL from item 2.
- [ ] **Child-safety standards** section (Play now surfaces this for child-audience apps) → point to the child-safety page + `SUPPORT_EMAIL`.

---

## Config notes — **[code, optional]**

- `app.config.js` `userInterfaceStyle: 'light'` — **keep `light`** until the dark theme is fully QA'd (the redesign ships light-first; dark is wired but staged). Switch to `'automatic'` only after dark passes a full visual pass.
- `SUPPORT_EMAIL` (`support@littlegenius.app`) — **[verify]** it routes to a monitored mailbox (used for support + child-safety reports).
- Splash `backgroundColor` (`#1E1B4B`) matches the in-app `brandSurface` token ✓.

---

## Quick pre-submit checklist

- [ ] Permissions stripped & manifest re-verified (item 1)
- [x] Privacy Policy + 3 legal pages live and reachable (item 2) — verified
- [ ] Paste `…/privacy` into the Play Console Privacy Policy field
- [ ] Build confirmed targeting API 35 (item 3)
- [ ] Data Safety = "no data collected", consistent with permissions
- [ ] Target audience = Children, IARC rating done
- [ ] Screenshots/feature graphic from redesigned UI uploaded
- [ ] Support email monitored
