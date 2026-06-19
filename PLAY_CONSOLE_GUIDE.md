# Little Genius — Google Play Console Submission Guide

> **Purpose of this file:** Give this document to the Claude extension (or use it yourself) to fill out **every** Google Play Console requirement needed to create and publish the **Little Genius** app. It walks through the whole flow in order — from creating the app, choosing the right category, the store listing, content rating, target audience, **Data safety**, **Families program**, ads/permissions declarations, and the production release.
>
> Everything below is derived from the actual source code, so the answers are accurate for this specific app. Where you must make a personal/business choice, it is clearly marked **⚠️ DECIDE**.

---

## 0. Key facts about this app (single source of truth)

| Field | Value |
|---|---|
| **App name (display)** | `Little Genius` |
| **Android package name / Application ID** | `com.basitkhokhar.littlegenius.app` |
| **Version name** | `1.0.0` |
| **Platform** | React Native (Expo SDK 54), Android (and iOS) |
| **App or Game?** | **App** (Education) |
| **Free or Paid?** | **Free** |
| **Contains ads?** | **No** |
| **In-app purchases?** | **No** |
| **Default language** | English (United States) – `en-US` |
| **Secondary content language** | Urdu (the app is bilingual English + Urdu) |
| **Target audience** | **Children** (ages 2–10 / pre-school to Class 1) |
| **Backend / servers** | **None** — the app is 100% offline. No network calls, no API, no cloud. |
| **Analytics / tracking SDKs** | **None** |
| **Advertising SDKs** | **None** |
| **Account / login** | Local-only account (nickname + parent email + age + 4-digit PIN). Data **never leaves the device**. |
| **Developer contact email** | basitkhokhar957@gmail.com |
| **Public support email** | support@littlegenius.app  *(⚠️ DECIDE — must be a mailbox you actually monitor; currently set in `src/Constants/legal.js`)* |

### Legal page URLs (already referenced in the app, hosted on Netlify)
> Defined in `src/Constants/legal.js`. **⚠️ Confirm these are live before submitting** — Play will reject if the Privacy Policy URL is unreachable.

| Document | URL |
|---|---|
| Home | `https://littlegenius-legal.netlify.app/` |
| **Privacy Policy** | `https://littlegenius-legal.netlify.app/privacy.html` |
| Terms of Service | `https://littlegenius-legal.netlify.app/terms.html` |
| Child Safety / Standards | `https://littlegenius-legal.netlify.app/child-safety.html` |
| Account & Data Deletion | `https://littlegenius-legal.netlify.app/data-deletion.html` |

---

## 1. What the app actually does (for descriptions & rating answers)

**Little Genius** is a bilingual (English + Urdu) Islamic & general-knowledge learning app for young children. It is fully offline and ad-free. Content modules found in the code:

**Learning modules**
- **English Alphabet** (A–Z) with sounds, examples, and quizzes
- **Urdu Alphabet (اردو حروف تہجی)**
- **Numbers / Counting**
- **Shapes & Colors**
- **My World** — animals, birds, fruits, vegetables, vehicles, body parts, colors (bilingual)
- **Good Habits** — manners, cleanliness, safety, healthy food
- **Pakistan General Knowledge** — national symbols, provinces, heroes, famous places

**Islamic learning (age-appropriate, educational)**
- **Six Kalimas (کلمے)**
- **99 Names of Allah (أسماء الله الحسنى)**
- **Stories of the Prophets**
- **Daily Duas (روزمرہ دعائیں)**
- **Wudu & Salah steps** (how to perform ablution and prayer)
- **Good manners / Islamic etiquette**

**Engagement**
- **Stories** with comprehension quizzes
- **Games** — memory cards, odd-one-out, pattern, color match, shape quiz
- **Quizzes** per module with a **star reward** system
- **Text-to-Speech** narration (on-device, via `expo-speech`) — taps read words aloud
- **Local profile** with avatar selection (emoji avatars), star progress saved on device

**Child-safety design already built in**
- **Parental Gate** (a multiplication question an adult solves) shown **before account creation** and **before destructive actions** like account deletion.
- **Parental-consent checkbox** at signup confirming the user is the parent/guardian and agrees to the Privacy Policy & Terms.
- Passwords/PINs are **salted + SHA-256 hashed**; auth token kept in the OS keystore (`expo-secure-store`); profile records stay in on-device storage (`AsyncStorage`) and never sync anywhere.

---

## 2. Create the app (Play Console → All apps → Create app)

| Field | What to enter |
|---|---|
| **App name** | `Little Genius` |
| **Default language** | English (United States) – en-US |
| **App or game** | **App** |
| **Free or paid** | **Free** |
| **Declarations** | ✅ Tick *Developer Program Policies* and ✅ *US export laws*. |

After creating, you'll land on the **Dashboard** with a setup checklist. Work through it in the order below.

---

## 3. Store settings → App category

**Set up your store listing → App category:**

| Field | Value |
|---|---|
| **App category** | **Education** *(best fit — this is a learning app. Alternative acceptable: "Educational" under the kids/family experience.)* |
| **Tags** | Choose up to 5 relevant tags, e.g. *Education, Pretend Play, Creativity, Brain Games, Books & Reference.* |
| **Email address** | basitkhokhar957@gmail.com (or support@littlegenius.app) |
| **Phone / website** | Website: `https://littlegenius-legal.netlify.app/` (phone optional) |

> Note: because the target audience includes children, this app must join the **Designed for Families / Families** program (see §7). Education is the standard category for such apps.

---

## 4. Main store listing (text + graphics)

### 4.1 App name (30 chars max)
```
Little Genius
```

### 4.2 Short description (80 chars max)
```
Fun bilingual learning for kids: alphabet, numbers, Islamic basics & games.
```
*(74 chars — within limit.)*

### 4.3 Full description (4000 chars max)
```
Little Genius is a fun, safe, and ad-free learning app made for young children
(ages 2–10). With colorful cards, friendly voices, and rewarding quizzes, kids
learn in both English and Urdu — at home, offline, and at their own pace.

🌟 WHAT YOUR CHILD WILL LEARN
• English Alphabet (A–Z) with sounds and examples
• Urdu Alphabet (اردو حروف تہجی)
• Numbers and counting
• Shapes and colors
• My World: animals, birds, fruits, vegetables, vehicles, body parts
• Good Habits: manners, cleanliness, safety and healthy food
• Pakistan General Knowledge: national symbols, provinces, heroes and places

🕌 ISLAMIC LEARNING (age-appropriate)
• Six Kalimas
• 99 Names of Allah
• Stories of the Prophets
• Daily Duas
• How to perform Wudu and Salah, step by step
• Beautiful manners and good character

📚 STORIES & 🧠 GAMES
• Short stories with simple comprehension quizzes
• Memory cards, odd-one-out, pattern, color match and shape games
• Fun quizzes for every topic with a star reward system to keep kids motivated

🔊 LISTEN & LEARN
• Tap to hear words read aloud with built-in text-to-speech
• Perfect for early readers and pre-readers

👨‍👩‍👧 SAFE FOR KIDS, MADE FOR PARENTS
• No ads, no in-app purchases, no third-party tracking
• Works fully offline — no internet required to learn
• A parental gate protects account creation and settings
• Profiles and progress are stored only on your device

Little Genius helps children build a strong foundation of knowledge, faith and
good character — the fun way. Download today and watch your little genius grow!
```
*(⚠️ DECIDE — edit the “Islamic” framing/wording to taste; this is a faithful summary of the in-app content.)*

### 4.4 Graphic assets (you must create these images)
| Asset | Spec | Notes |
|---|---|---|
| **App icon** | 512 × 512 PNG, 32-bit | Use `assets/logo.png` styled to 512px. |
| **Feature graphic** | 1024 × 500 PNG/JPG | Required. App name + tagline on brand color `#1E1B4B`. |
| **Phone screenshots** | 2–8 images, min 320px, 16:9 or 9:16 | Capture Home, Alphabet, Islamic module, Stories, Games, a quiz with stars. |
| **7-inch tablet** | optional but recommended | |
| **10-inch tablet** | optional but recommended | |

> Brand colors from the app: primary `#1E1B4B` (indigo), accent `#FCD34D` (gold).

---

## 5. Content rating (Questionnaire)

Go to **Policy → App content → Content rating**. Email: basitkhokhar957@gmail.com. **Category: Education / Reference.**

Answer the IARC questionnaire as follows (all **No** for mature content — this is a clean kids app):

| Question | Answer |
|---|---|
| Violence (cartoon/fantasy/realistic) | **No** |
| Blood / gore | **No** |
| Sexual content / nudity | **No** |
| Profanity / crude humor | **No** |
| Drugs, alcohol, tobacco references | **No** |
| Gambling (real or simulated) | **No** |
| Scary / disturbing content | **No** |
| User-generated content / chat / social features | **No** |
| Does the app share the user's physical location? | **No** |
| Does the app collect/share personal info? | **No** (data stays on device — see §6) |
| Does the app contain ads? | **No** |
| In-app purchases? | **No** |
| **Religious reference** | If asked, you may note the app contains **religious/educational content** (Islamic learning). This does not raise the rating. |

**Expected result:** rated suitable for **Everyone / All ages / PEGI 3 / ESRB Everyone.**

---

## 6. Data safety (Policy → App content → Data safety)

> **This is the most important section to get right.** Because Little Genius is 100% offline and **transmits no data off the device**, under Google's definitions you are **not "collecting" or "sharing"** data (collection = data sent off the device to you or a third party). All account info (nickname, parent email, age, hashed PIN, avatar, stars) is stored **only in local device storage** and never uploaded.

### 6.1 Overview answers
| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Is all of the user data collected by your app encrypted in transit? | **Not applicable / Yes** — no data is transmitted; data at rest uses OS keystore for the token + hashing for the PIN. |
| Do you provide a way for users to request that their data is deleted? | **Yes** — in-app account deletion (removes all on-device data) **and** a public data-deletion page: `https://littlegenius-legal.netlify.app/data-deletion.html` |

> **Why "No data collected":** Google's Data Safety form treats data as *collected* only when it leaves the device. This app keeps everything local (`AsyncStorage` + `expo-secure-store`). Confirm in `src/Utils/secureAuth.js` — there are zero network calls.

### 6.2 If the form still requires you to list local data
Some reviewers expect transparency even for on-device data. If you choose to disclose (safer/clearer), declare:

| Data type | Collected? | Shared? | Processed ephemerally? | Required/Optional | Purpose |
|---|---|---|---|---|---|
| Name (child nickname) | Stored on device only | No | — | Optional | App functionality (profile) |
| Email address (parent) | Stored on device only | No | — | Optional | Account / app functionality |
| Age | Stored on device only | No | — | Optional | App functionality |
| PIN (hashed) | Stored on device only | No | — | Required for account | Account security |

But the **technically correct** answer for the Data safety **"collection"** question remains **No**, because nothing is sent to a server. Pair this with a clear Privacy Policy explaining local-only storage.

### 6.3 Privacy Policy URL (required)
```
https://littlegenius-legal.netlify.app/privacy.html
```
**⚠️ Verify it loads** and that it states: no data leaves the device, what is stored locally, that it's a children's app, parental-consent model, and how to delete data.

---

## 7. Target audience & content + Families program (CRITICAL)

Go to **Policy → App content → Target audience and content**. Because children are a target audience, you **must** comply with the **Google Play Families Policy** and **COPPA**.

| Field | Answer |
|---|---|
| **Target age groups** | Select the child brackets — **Ages 5 and under**, **Ages 6–8**, **Ages 9–12** (matches the app's 2–10 range). |
| Is your app designed for children / appealing to children? | **Yes** |
| **Will the store listing target children?** | **Yes** → app enters the **Designed for Families** program. |
| Do you want the app to be included in "Designed for Families"? | **Yes** *(recommended for a kids education app — adds the badge and visibility, requires policy compliance you already meet).* |

### 7.1 Families program requirements — checklist (all already satisfied by the code)
- ✅ **No behavioral advertising / no ad SDKs** — app has none.
- ✅ **No third-party analytics that collect from children** — none present.
- ✅ **No data collection from children sent off-device** — fully local.
- ✅ **Privacy Policy** that addresses children — provided.
- ✅ **Parental gate** for account creation, settings, and external links — implemented (`src/Components/UI/ParentalGate.jsx`).
- ✅ **Content age-appropriate** — educational only, no mature themes.
- ✅ **No social features / no UGC / no chat.**
- ⚠️ **APIs/SDKs must be on the approved list** — you use only Expo/React Native core libs with no ads/analytics, so this is fine. Do **not** add AdMob, Facebook SDK, or analytics later without re-checking Families compliance.

### 7.2 App access (review credentials)
The app has a **login screen**. Google's reviewers need a way in. In **App access**, either:
- Choose **"All functionality is available without special access"** *if* a child/parent can create a local account during review (it's all on-device, so a reviewer can self-register — pick this and add a note), **or**
- Provide **demo instructions**: "Tap Sign Up → enter any nickname, any email (e.g. test@test.com), age, and a 4-digit PIN → solve the parental-gate math question → account is created locally. No server account needed."

> **⚠️ Recommended:** Add the demo instructions note even if you select "no special access," so reviewers aren't blocked by the parental gate.

---

## 8. Other "App content" declarations

| Section | Answer |
|---|---|
| **Ads** | **No, my app does not contain ads.** |
| **Government apps** | No (not a government app). |
| **Financial features** | None. |
| **Health apps** | No. |
| **News app** | No. |
| **COVID-19 contact tracing/status** | No. |
| **Data safety** | Completed in §6. |
| **App access** | Completed in §7.2. |
| **Content rating** | Completed in §5. |

---

## 9. Permissions

This app declares **no dangerous runtime permissions**. Expo SDK 54 may add a few normal-level permissions automatically. Review the final AAB's manifest; expected permissions are minimal:
- `INTERNET` (Expo default — used only for OTA/dev; the app's content is offline). Normal permission, no disclosure needed.
- No camera, location, contacts, microphone, storage-media, or phone permissions are used by the features.

> If Play asks for a **Permissions declaration** (e.g., for sensitive permissions), you should have **nothing to declare**. If `INTERNET` is the only one, no declaration form is needed.

---

## 10. Store presence → Countries & pricing
| Field | Value |
|---|---|
| Pricing | **Free** |
| Countries | **All countries** (or at minimum Pakistan, India, UK, US, Gulf states given the bilingual + Islamic audience). |

---

## 11. Production release (Release → Production)

| Step | Detail |
|---|---|
| **Build format** | **AAB** (Android App Bundle). Build with EAS: `eas build -p android --profile production`. |
| **Application ID** | `com.basitkhokhar.littlegenius.app` (must match `app.config.js`). |
| **App signing** | Use **Play App Signing** (recommended). If EAS manages your keystore, upload the AAB and let Google re-sign, or upload your upload key. |
| **Version name** | `1.0.0` |
| **Version code** | `1` (⚠️ set `android.versionCode` — increment on every upload). |
| **Release name** | `1.0.0 (1)` |
| **Release notes** | e.g. *"First release of Little Genius — bilingual offline learning for kids: alphabet, numbers, Islamic basics, stories, games and quizzes."* |

### 11.1 Pre-launch checklist before "Send for review"
- [ ] Privacy Policy URL loads (`privacy.html`).
- [ ] Data-deletion URL loads (`data-deletion.html`).
- [ ] `SUPPORT_EMAIL` in `src/Constants/legal.js` is a real, monitored mailbox.
- [ ] Content rating completed → Everyone.
- [ ] Target audience set to children + Families program opted in.
- [ ] Data safety = no data collected/shared, deletion method provided.
- [ ] App access demo instructions added (parental gate / login).
- [ ] Ads = No. IAP = No.
- [ ] Store listing text + icon + feature graphic + ≥2 screenshots uploaded.
- [ ] AAB uploaded with versionCode set.

---

## 12. Quick copy-paste answer sheet (TL;DR for the reviewer-facing fields)

```
App name:           Little Genius
Package:            com.basitkhokhar.littlegenius.app
Category:           Education
Type:               App (Free)
Contains ads:       No
In-app purchases:   No
Target audience:    Children (ages 2–10) — Designed for Families: YES
Content rating:     Everyone / PEGI 3
Data collected:     None (100% offline; all data stored on-device only)
Data shared:        None
Data deletion:      In-app account deletion + https://littlegenius-legal.netlify.app/data-deletion.html
Privacy Policy:     https://littlegenius-legal.netlify.app/privacy.html
Support email:      support@littlegenius.app
Login for review:   Sign Up → any nickname/email/age + 4-digit PIN → solve parental-gate math → local account (no server)
```

---

### ⚠️ Things YOU must finalize before publishing
1. **Confirm the Netlify legal pages are live** (privacy, terms, child-safety, data-deletion).
2. **Set `SUPPORT_EMAIL`** to a real inbox you monitor (currently `support@littlegenius.app` in `src/Constants/legal.js`).
3. **Create the graphic assets** (icon 512×512, feature graphic 1024×500, screenshots).
4. **Set `versionCode`** in the Android config and build the production **AAB** via EAS.
5. **Do not add** AdMob/analytics/social SDKs later without re-checking Families-policy compliance.
```
