import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palettes } from '../Theme/colors';

// ──────────────────────────────────────────────────────────────
// ThemeContext — owns the ACTIVE colour palette.
//
// Light ships as default; dark is fully wired (palette + persistence)
// so flipping `mode` recolours every component that reads `useTheme()`
// / `useThemeColors()`. Choice persists across launches.
//
//   const { colors, isDark, mode, toggle, setMode } = useTheme();
//   const colors = useThemeColors();
// ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'theme_mode';
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [mode, setModeState] = useState('light');

  // Restore persisted choice on boot.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (alive && (saved === 'light' || saved === 'dark')) setModeState(saved);
      } catch (e) {
        // keep default light
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setMode = useCallback((next) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(() => {
    const colors = palettes[mode] || palettes.light;
    return { colors, mode, isDark: mode === 'dark', toggle, setMode };
  }, [mode, toggle, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};

// Convenience hook for components that only need the colour palette.
export const useThemeColors = () => useTheme().colors;

export default ThemeContext;
