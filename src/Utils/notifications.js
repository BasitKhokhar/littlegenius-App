// ─────────────────────────────────────────────────────────────────────────────
// Local notifications (no FCM / no server).
//
// Everything here is scheduled ON-DEVICE via expo-notifications:
//   • Daily learning reminder — a friendly nudge once a day at a parent-set time.
//   • Comeback reminder — a one-off "we miss you" that only fires if the child
//     doesn't reopen the app for a few days (it is pushed forward on every open).
//
// Prefs live in AsyncStorage (via the Storage JSON wrapper). We intentionally
// use DAILY (inexact) scheduling so we don't need the exact-alarm permissions
// that are blocked in app.config.js for Families-policy cleanliness.
// ─────────────────────────────────────────────────────────────────────────────
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Storage from './storage';

// Local prefs key — matches the app's convention of literal storage keys
// (see ThemeContext / RootNavigator) rather than the legacy AppConstants map.
export const NOTIF_PREFS_KEY = '@littlegenius/notifications';

const DAILY_CHANNEL_ID = 'daily-reminder';
const COMEBACK_DAYS = 3;

// Stable identifiers so re-scheduling replaces (not duplicates) each reminder.
const DAILY_ID = 'lg-daily-reminder';
const COMEBACK_ID = 'lg-comeback-reminder';

export const DEFAULT_PREFS = { enabled: false, hour: 8, minute: 0 };

// Kid-friendly rotating copy (a grown-up-safe, ad-free nudge).
const DAILY_MESSAGES = [
  { title: 'Time to learn! 🦁', body: "Let's play and learn something new today!" },
  { title: 'Little Genius is waiting ⭐', body: 'Your next fun lesson is ready!' },
  { title: 'Learning time! 📚', body: 'Come practice your letters, numbers and more!' },
];

const COMEBACK_MESSAGE = {
  title: 'We miss you! 🧸',
  body: "Come back and keep your learning streak going!",
};

const pickDaily = () =>
  DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)];

// ── Prefs ────────────────────────────────────────────────────────────────────
export const getPrefs = async () => {
  const saved = await Storage.get(NOTIF_PREFS_KEY);
  return { ...DEFAULT_PREFS, ...(saved || {}) };
};

export const savePrefs = (prefs) => Storage.set(NOTIF_PREFS_KEY, prefs);

// ── Setup ──────────────────────────────────────────────────────────────────
// Foreground handler + Android channel. Safe to call on every app start.
export const configureNotifications = async () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(DAILY_CHANNEL_ID, {
      name: 'Learning Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
};

// ── Permission ───────────────────────────────────────────────────────────────
// Returns true if we can post notifications. Handles Android 13+ + iOS.
export const requestPermission = async () => {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
};

// ── Scheduling ───────────────────────────────────────────────────────────────
export const scheduleDailyReminder = async (hour, minute) => {
  await Notifications.cancelScheduledNotificationAsync(DAILY_ID).catch(() => {});
  const msg = pickDaily();
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_ID,
    content: { title: msg.title, body: msg.body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: DAILY_CHANNEL_ID,
    },
  });
};

// One-off nudge `days` in the future. Called on every app open so it always
// sits N days out — it only actually fires if the app isn't reopened.
export const scheduleComebackReminder = async (days = COMEBACK_DAYS) => {
  await Notifications.cancelScheduledNotificationAsync(COMEBACK_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: COMEBACK_ID,
    content: { title: COMEBACK_MESSAGE.title, body: COMEBACK_MESSAGE.body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: days * 24 * 60 * 60,
      repeats: false,
      channelId: DAILY_CHANNEL_ID,
    },
  });
};

export const cancelDailyReminder = () =>
  Notifications.cancelScheduledNotificationAsync(DAILY_ID).catch(() => {});

export const cancelAll = () =>
  Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
