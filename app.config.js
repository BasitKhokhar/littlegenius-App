import 'dotenv/config';

// The EAS project id. NOT a secret — it is already baked into the built
// AndroidManifest — so it must have a literal default: `.env` is gitignored, and
// on an EAS cloud build (or any clone) `process.env.EXPO_ID` is undefined, which
// silently produced `https://u.expo.dev/undefined` and broke OTA updates.
const projectId = process.env.EXPO_ID || '8a38e79f-271e-42be-8650-c6d4e92e626b';

export default () => ({
  expo: {
    name: 'Little Genius',
    slug: 'little-genius',
    // Bumped for the native change that adds expo-notifications (local daily/
    // comeback reminders). A new native module cannot ship over OTA — it needs
    // a fresh build + store release, and the appVersion runtime policy ties this
    // build's OTA channel to this version. (1.3.0 added expo-audio.)
    // 1.4.2: audio-recovery + OTA-channel fix. Bumped so this build's OTA
    // runtime version is distinct from the silent 1.4.1 release on Play.
    // 1.4.3: fixes the "stuck speaking icon" bug (native AudioPlayer churn
    // exhausting Android's decoder pool after ~40-55 rapid sound-button taps —
    // see speechEngine.js getClipPlayer()/replace()), plus corrected legal
    // pages. versionCode 10 (Play Console's last published build is 9/1.4.2).
    // KEEP IN SYNC BY HAND — this project does not run `expo prebuild`, so
    // android/app/build.gradle (versionName) and
    // android/app/src/main/res/values/strings.xml (expo_runtime_version)
    // must be edited to match, or the binary reports the wrong runtime version
    // and no OTA update can ever target it.
    version: '1.4.3',
    icon: './assets/logo.png',
    owner: 'talhabasit7016',
    userInterfaceStyle: 'light',
    // ── OTA (Over-The-Air) updates via EAS Update ──────────────────────────
    // JS/asset changes ship instantly without a new store build.
    // runtimeVersion "appVersion" policy => an update only lands on a build
    // whose `version` matches. Bump `version` above ONLY when you change
    // native code / add native modules, then rebuild. Pure JS/UI changes keep
    // the same version and are delivered with `eas update`.
    runtimeVersion: { policy: 'appVersion' },
    updates: {
      url: `https://u.expo.dev/${projectId}`,
      enabled: true,
      // 0 = launch instantly from cache, fetch the new bundle in the
      // background and apply it on next app open (best UX for kids app).
      fallbackToCacheTimeout: 0,
      // The channel has to be declared HERE for locally-built binaries: the
      // `channel` key in eas.json is injected by EAS Build only. Store AABs for
      // this app are built locally with `gradlew bundleRelease`, which produced
      // a binary carrying NO channel — so EAS Update could never resolve a
      // branch and every published update silently failed to reach a single
      // store user. Skipped on EAS, where the eas.json profile owns the channel
      // and setting both would conflict. Override locally with UPDATE_CHANNEL
      // when building for the preview/development track.
      ...(process.env.EAS_BUILD === 'true'
        ? {}
        : { requestHeaders: { 'expo-channel-name': process.env.UPDATE_CHANNEL || 'production' } }),
    },
    splash: {
      image: './assets/logo.png',
      resizeMode: 'contain',
      backgroundColor: '#1E1B4B'
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.littlegenius.app'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/logo.png',
        backgroundColor: '#1E1B4B'
      },
      package: 'com.basitkhokhar.littlegenius.app',
      edgeToEdgeEnabled: true,
      // Off — Android's Auto Backup was restoring AsyncStorage (onboarding_complete,
      // registeredUsers) from Google Drive on reinstall, making a fresh install look
      // like a returning user and skipping straight to ProfileSetup instead of
      // Onboarding. This must stay false, and be mirrored into
      // android/app/src/main/AndroidManifest.xml (that project is hand-maintained).
      allowBackup: false,
      // Offline kids app — request only what's used (VIBRATE via expo-haptics,
      // INTERNET for opening legal links, POST_NOTIFICATIONS for the local
      // daily/comeback reminders, RECEIVE_BOOT_COMPLETED so scheduled reminders
      // survive a reboot). Block sensitive permissions that libraries may
      // inject; they are a Families-policy rejection risk. We deliberately block
      // the exact-alarm permissions because reminders use daily INEXACT
      // scheduling and don't need them, and RECORD_AUDIO because expo-audio
      // injects it for its recording API which we never use — we only PLAY
      // audio. Removing it keeps the manifest matching the privacy policy's
      // "no microphone" statement (a hard requirement for a children's app).
      permissions: [
        'android.permission.INTERNET',
        'android.permission.VIBRATE',
        'android.permission.POST_NOTIFICATIONS',
        'android.permission.RECEIVE_BOOT_COMPLETED'
      ],
      blockedPermissions: [
        'android.permission.SYSTEM_ALERT_WINDOW',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.SCHEDULE_EXACT_ALARM',
        'android.permission.USE_EXACT_ALARM',
        'android.permission.RECORD_AUDIO',
        // expo-audio injects these for background/locked-screen media playback,
        // which we never do (narration only plays while the child is on-screen).
        // Blocking them removes the Play Console FOREGROUND_SERVICE_MEDIA_PLAYBACK
        // declaration requirement and keeps the manifest minimal for Families policy.
        'android.permission.FOREGROUND_SERVICE',
        'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK'
      ]
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: [
      './plugins/withAndroidLargeScreenSupport',
      [
        '@sentry/react-native/expo',
        {
          organization: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
        },
      ],
      'expo-font',
      'expo-asset',
      'expo-audio',
      [
        'expo-notifications',
        {
          icon: './assets/logo.png',
          color: '#1E1B4B',
        },
      ],
      // Pin Android target/compile API level to 36 (Play Store policy). Already
      // the Expo 54 default, set explicitly so it can never silently regress.
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            enableMinifyInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
          },
        },
      ],
    ],
    extra: {
      // The DSN is a public client identifier and is safe to include in the
      // application bundle. Keep the old spelling working during migration.
      SENTRY_DSN: process.env.SENTRY_DSN || process.env.SNETRY_DSN,
      eas: {
        projectId: process.env.EXPO_ID
      }
    }
  }
});
