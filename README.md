# NewsAtWall 📰

A professional React Native (Expo) news application built with a scalable, production-ready folder structure.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

---

## 📁 Folder Structure

```
newsatwalll/
├── App.jsx                    # Root component — providers + navigation
├── index.js                   # Expo entry point
├── babel.config.js            # Babel + module-resolver aliases
├── app.json                   # Expo config
├── eas.json                   # EAS build profiles
├── .env                       # Environment variables
│
└── src/
    ├── Assets/                # Images, icons, fonts
    │   ├── images/
    │   ├── icons/
    │   └── index.jsx          # Asset registry
    │
    ├── Components/
    │   └── Common/            # Shared UI components
    │       ├── Button.jsx
    │       ├── Input.jsx
    │       ├── Loader.jsx
    │       └── index.jsx
    │
    ├── Constants/             # App-wide constants
    │   ├── AppConstants.jsx
    │   ├── Routes.jsx
    │   └── index.jsx
    │
    ├── Context/               # React Context providers
    │   ├── AuthContext.jsx
    │   ├── ThemeContext.jsx
    │   └── index.jsx
    │
    ├── Hooks/                 # Custom hooks
    │   ├── useApi.jsx
    │   ├── useForm.jsx
    │   ├── useKeyboard.jsx
    │   └── index.jsx
    │
    ├── Navigation/            # React Navigation setup
    │   ├── RootNavigator.jsx  # Auth vs App switcher
    │   ├── AuthNavigator.jsx  # Auth stack
    │   ├── AppNavigator.jsx   # Bottom tab navigator
    │   └── index.jsx
    │
    ├── Screens/               # All screen components
    │   ├── SplashScreens/
    │   │   └── LogoSplash.jsx
    │   ├── Onboarding/
    │   │   └── Onboarding.jsx
    │   ├── Auth/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   └── ForgotPassword.jsx
    │   ├── Home/
    │   │   └── HomeScreen.jsx
    │   ├── Profile/
    │   │   └── ProfileScreen.jsx
    │   └── Settings/
    │       └── SettingsScreen.jsx
    │
    ├── Services/              # API service layer
    │   ├── ApiClient.jsx      # Axios instance + interceptors
    │   ├── AuthService.jsx
    │   ├── NewsService.jsx
    │   └── index.jsx
    │
    ├── Store/                 # Global state (useReducer)
    │   └── index.jsx
    │
    ├── Theme/                 # Design tokens
    │   └── index.jsx          # Colors, Typography, Spacing, Radius, Shadow
    │
    └── Utils/                 # Helper utilities
        ├── helpers.jsx        # String, date, number, validation helpers
        ├── storage.jsx        # AsyncStorage wrapper
        └── index.jsx
```

---

## 🎯 Path Aliases

Configured in `babel.config.js` via `babel-plugin-module-resolver`:

| Alias          | Path                  |
|----------------|-----------------------|
| `@components`  | `./src/Components`    |
| `@screens`     | `./src/Screens`       |
| `@navigation`  | `./src/Navigation`    |
| `@context`     | `./src/Context`       |
| `@hooks`       | `./src/Hooks`         |
| `@store`       | `./src/Store`         |
| `@services`    | `./src/Services`      |
| `@utils`       | `./src/Utils`         |
| `@constants`   | `./src/Constants`     |
| `@theme`       | `./src/Theme`         |
| `@assets`      | `./src/Assets`        |

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `expo ~54` | Expo SDK |
| `@react-navigation/native` | Navigation container |
| `@react-navigation/native-stack` | Stack navigator |
| `@react-navigation/bottom-tabs` | Tab navigator |
| `react-native-screens` | Native screen optimisation |
| `react-native-safe-area-context` | Safe area handling |
| `axios` | HTTP client |
| `babel-plugin-module-resolver` | Path alias support |

---

## ✏️ Environment Variables

Copy `.env` and fill in your values:

```bash
EXPO_PUBLIC_API_URL=https://api.yourapp.com/v1
EXPO_PUBLIC_APP_ENV=development
```
