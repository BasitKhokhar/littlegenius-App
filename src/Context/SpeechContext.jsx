import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SpeechEngine from '../Utils/speechEngine';

// ──────────────────────────────────────────────────────────────
// SpeechContext — owns the app-wide narration SPEED.
//
// A grown-up picks how fast the teacher speaks in Settings. The choice
// scales EVERY spoken word (pre-baked teacher clips + device-TTS fallback)
// through SpeechEngine.setGlobalSpeed(), and persists across launches.
// Younger children can slow it right down (0.5×) to copy each sound; a
// confident reader can speed it up.
//
//   const { speed, setSpeed, options } = useSpeech();
// ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'speech_speed';
const DEFAULT_SPEED = 0.75;

// The picker options a grown-up sees. `value` is the multiplier fed to the
// engine; 1× is the app's normal, kid-tuned delivery.
export const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5×', emoji: '🐢', hint: 'Slowest' },
  { value: 0.75, label: '0.75×', emoji: '🐌', hint: 'Slow' },
  { value: 1, label: '1×', emoji: '🙂', hint: 'Normal' },
  { value: 1.5, label: '1.5×', emoji: '🐇', hint: 'Fast' },
  { value: 2, label: '2×', emoji: '⚡', hint: 'Fastest' },
];

const isValidSpeed = (n) =>
  Number.isFinite(n) && SPEED_OPTIONS.some((o) => o.value === n);

const SpeechContext = createContext(null);

export const SpeechProvider = ({ children }) => {
  const [speed, setSpeedState] = useState(DEFAULT_SPEED);

  // Restore the saved speed on boot and push it into the engine BEFORE any
  // narration plays, so the first tap already respects the preference.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const saved = parseFloat(await AsyncStorage.getItem(STORAGE_KEY));
        const next = isValidSpeed(saved) ? saved : DEFAULT_SPEED;
        if (alive) {
          setSpeedState(next);
          SpeechEngine.setGlobalSpeed(next);
        }
      } catch {
        // keep the 0.75× default already applied above
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setSpeed = useCallback((next) => {
    if (!isValidSpeed(next)) return;
    setSpeedState(next);
    SpeechEngine.setGlobalSpeed(next);
    AsyncStorage.setItem(STORAGE_KEY, String(next)).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ speed, setSpeed, options: SPEED_OPTIONS }),
    [speed, setSpeed]
  );

  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
};

export const useSpeech = () => {
  const ctx = useContext(SpeechContext);
  if (!ctx) throw new Error('useSpeech must be used within a SpeechProvider');
  return ctx;
};

export default SpeechContext;
