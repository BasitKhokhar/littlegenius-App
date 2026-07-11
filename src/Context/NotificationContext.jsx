import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import * as Notif from '../Utils/notifications';

// ──────────────────────────────────────────────────────────────
// NotificationContext — owns the LOCAL reminder system.
//
// On boot it configures the handler/Android channel, restores the
// saved prefs (and reschedules the daily reminder if enabled), and
// always pushes the "comeback" reminder N days forward so it only
// fires if the app isn't reopened.
//
//   const { enabled, hour, minute, setEnabled, setTime } = useNotifications();
//
// `setEnabled(true)` requests OS permission first and resolves to the
// granted boolean so the UI can leave the switch off if denied.
// ──────────────────────────────────────────────────────────────
const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [prefs, setPrefs] = useState(Notif.DEFAULT_PREFS);

  // Boot: configure, restore prefs, reschedule.
  useEffect(() => {
    let alive = true;
    (async () => {
      await Notif.configureNotifications();
      const saved = await Notif.getPrefs();
      if (!alive) return;
      setPrefs(saved);
      if (saved.enabled) {
        await Notif.scheduleDailyReminder(saved.hour, saved.minute);
      }
      // Always refresh the comeback nudge on open (only fires if not reopened).
      await Notif.scheduleComebackReminder();
    })();
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((next) => {
    setPrefs(next);
    Notif.savePrefs(next);
  }, []);

  // Turn reminders on/off. Returns whether it ended up enabled.
  const setEnabled = useCallback(
    async (value) => {
      if (value) {
        const granted = await Notif.requestPermission();
        if (!granted) {
          persist({ ...prefs, enabled: false });
          return false;
        }
        await Notif.scheduleDailyReminder(prefs.hour, prefs.minute);
        persist({ ...prefs, enabled: true });
        return true;
      }
      await Notif.cancelDailyReminder();
      persist({ ...prefs, enabled: false });
      return false;
    },
    [prefs, persist]
  );

  // Change the daily reminder time (reschedules if currently enabled).
  const setTime = useCallback(
    async (hour, minute) => {
      const next = { ...prefs, hour, minute };
      persist(next);
      if (next.enabled) await Notif.scheduleDailyReminder(hour, minute);
    },
    [prefs, persist]
  );

  const value = useMemo(
    () => ({
      enabled: prefs.enabled,
      hour: prefs.hour,
      minute: prefs.minute,
      setEnabled,
      setTime,
    }),
    [prefs, setEnabled, setTime]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
};

export default NotificationContext;
