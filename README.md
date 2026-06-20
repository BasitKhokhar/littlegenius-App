# Little Genius 🧠✨

**An offline, ad-free early-learning app for kids.** Little Genius helps young children learn
the alphabet, numbers, Urdu, Islamic basics, facts about Pakistan, stories and fun games —
with friendly voice narration, star rewards, and a parents-only gate. Everything runs on the
device; **no internet account, no ads, and no data collection.**

Built with Expo (React Native).

---

## ✨ Features

- **Learning modules** — Alphabet, Numbers, Urdu, Islamic, Pakistan, Stories, and Games.
- **Voice narration (Text-to-Speech)** — letters, words and stories are read aloud via
  `expo-speech`.
- **Star rewards** — children earn stars for completing activities and quizzes (stored on-device).
- **Quizzes** — per-module quizzes reinforce learning.
- **Parental gate** — a simple grown-ups-only math challenge guards external links and
  destructive actions, in line with Google Play's Families policy.
- **Kid-friendly UI** — bright light theme, large tap targets, haptic feedback, and Lottie
  animations.
- **Fully offline** — no sign-up, no server, no ads, no tracking.

---

## 🧱 Tech Stack

| Area | Technology |
|------|------------|
| Framework | Expo SDK 54, React Native 0.81, React 19 |
| Navigation | React Navigation 7 (native-stack + bottom-tabs) |
| Animation | react-native-reanimated 4, lottie-react-native, expo-linear-gradient |
| Speech / haptics | expo-speech, expo-haptics |
| Local storage | @react-native-async-storage/async-storage, expo-secure-store |
| Fonts | @expo-google-fonts (Baloo 2, Noto Naskh Arabic, Noto Nastaliq Urdu) |
| Build / release | EAS Build |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the Expo dev server
npm start

# Run on a connected Android device / emulator
npm run android

# Run on iOS (macOS only)
npm run ios

# Run in the browser
npm run web

# Lint
npm run lint
```

### Environment variables

The app reads configuration from a `.env` file via `dotenv` (loaded in `app.config.js`):

```bash
EXPO_ID=your-eas-project-id   # used for extra.eas.projectId
```

Production builds (Android App Bundle / iOS) are produced with **EAS Build** — see
[eas.json](eas.json).

---

## 📁 Project Structure

```
LittleGenius App/
├── App.jsx                 # Root component — providers + navigation
├── index.js                # Expo entry point
├── app.config.js           # Expo app config (name, package, permissions)
├── eas.json                # EAS build profiles
├── babel.config.js         # Babel + module-resolver aliases
├── .env                    # Environment variables (EXPO_ID)
│
├── assets/                 # App icon, splash, favicon
│
└── src/
    ├── Assets/             # In-app images / icon registry
    ├── Components/
    │   ├── Common/         # Shared UI (Button, Card, Input, Screen, SpeakButton, …)
    │   ├── UI/             # Header, BottomTabBar, ParentalGate, StarReward, CustomDialog
    │   └── Educational/    # AlphabetCard, VocabularyCard
    ├── Constants/          # App constants + route names
    ├── Context/            # AuthContext, ThemeContext, DialogContext
    ├── Hooks/              # useApi, useForm, useKeyboard
    ├── Navigation/         # RootNavigator, AuthNavigator, AppNavigator
    ├── Screens/
    │   ├── Onboarding/     # Onboarding
    │   ├── Auth/           # ProfileSetup
    │   ├── Home/           # HomeScreen
    │   ├── Learn/          # LearnScreen (module hub)
    │   ├── Alphabet/       # AlphabetScreen + AlphabetQuizScreen
    │   ├── Numbers/        # NumbersScreen
    │   ├── Urdu/           # UrduScreen
    │   ├── Islamic/        # IslamicScreen
    │   ├── Pakistan/       # PakistanScreen
    │   ├── Stories/        # StoriesScreen + StoryQuizScreen
    │   ├── Games/          # GamesScreen + GamePlayScreen
    │   ├── Common/         # QuizListScreen, ModuleQuizScreen
    │   └── Settings/       # SettingsScreen
    ├── Store/              # Global state
    ├── Theme/              # Colors, typography, spacing, elevation tokens
    └── Utils/              # helpers, storage, secureAuth
```

---

## 🛡️ Google Play Submission & Policy Compliance

Little Genius is designed for children, so it must comply with the **Google Play Families /
Designed for Families** program. This section maps the app to the Play Console requirements so
the listing can be filled out quickly and accurately.

### App identity

| Field | Value |
|-------|-------|
| App name | **Little Genius** |
| Android package name | `com.basitkhokhar.littlegenius.app` |
| iOS bundle identifier | `com.littlegenius.app` |
| Version | `1.0.0` |
| Suggested category | **Education** |
| Default language | English |

### Target audience & content (Families policy)

- **Target age group:** children (early learners). In the *Target audience and content*
  section, select the child age bands and confirm the app is **intended for children**.
- Because the app appeals to children, **Families self-certification** applies: the app must
  use only families-compliant SDKs, must not collect personal data from children, and must
  present a **parental gate** before any action that leaves the kids' experience.
- **Parental gate:** implemented as a grown-ups-only multiplication challenge
  (see [src/Components/UI/ParentalGate.jsx](src/Components/UI/ParentalGate.jsx)). It is shown
  before opening external links and before destructive actions.
- **COPPA / GDPR-K:** the app does not knowingly collect personal information from children;
  all data stays on the device (see Data Safety below).

### Data Safety form

> **Summary: No data collected. No data shared. Nothing leaves the device.**

| Question | Answer |
|----------|--------|
| Does your app collect or share any of the required user data types? | **No** |
| Is all data encrypted in transit? | N/A — no data is transmitted |
| Do you provide a way to request data deletion? | **Yes** — on-device deletion + deletion URL |

- The app stores a child's profile, progress and star count **locally only**, using
  AsyncStorage and the device secure store
  (see [src/Context/AuthContext.jsx](src/Context/AuthContext.jsx)). This data is never sent to
  a server.
- Users can permanently erase all on-device data in-app via the **Delete Account** action
  (`deleteAccount` in [src/Context/AuthContext.jsx](src/Context/AuthContext.jsx)), and a public
  data-deletion page is provided (see links below).

### Permissions

The Android manifest requests only the minimum required permissions, and explicitly **blocks**
sensitive permissions that libraries might otherwise inject (a common Families-policy rejection
cause). Configured in [app.config.js](app.config.js).

| Permission | Why it's needed |
|------------|-----------------|
| `INTERNET` | Open the privacy policy / terms / data-deletion pages in the browser |
| `VIBRATE` | Haptic feedback for taps and rewards (via `expo-haptics`) |

**Blocked:** `SYSTEM_ALERT_WINDOW`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`.

### Content rating (IARC questionnaire)

- No violence, no mature content, no user-to-user communication, no ads, no purchases.
- Educational content only → expected rating **Everyone / PEGI 3**.

### Ads & monetization

- **No ads. No in-app purchases. No paid content.** The app is fully free.

### Required store URLs

| Purpose | URL |
|---------|-----|
| Privacy Policy | https://litlegeniuslegalpages.netlify.app/privacy |
| Terms & Conditions | https://litlegeniuslegalpages.netlify.app/terms |
| Data / Account Deletion | https://litlegeniuslegalpages.netlify.app/data-deletion |

> The Privacy Policy URL and the Data Deletion URL are **required** for the Play Console listing.

### Pre-submission checklist

- [ ] App icon (512×512) and feature graphic (1024×500)
- [ ] Phone screenshots (and tablet, since `supportsTablet` is enabled)
- [ ] Short description + full description
- [ ] Content rating questionnaire (IARC) completed
- [ ] **Data Safety** form completed (no data collected/shared)
- [ ] **Target audience & content** set to children + parental gate confirmed
- [ ] Privacy Policy URL added
- [ ] Account/Data deletion URL added
- [ ] Signed Android App Bundle (`.aab`) built with EAS
- [ ] App content / ads declaration set to "No ads"

---

## 📄 Legal

- **Privacy Policy:** https://litlegeniuslegalpages.netlify.app/privacy
- **Terms & Conditions:** https://litlegeniuslegalpages.netlify.app/terms
- **Data / Account Deletion:** https://litlegeniuslegalpages.netlify.app/data-deletion

---

## 👤 Author

**Muhammad Talha Basit** — Little Genius. Private project (all rights reserved).
