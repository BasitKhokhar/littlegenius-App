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
// VoiceContext — owns the ACTIVE voice persona for spoken audio.
//
//   'teacher' → warm adult narrator (default)
//   'kid'     → playful child voice
//
// The persona picks which pre-baked audio pack SpeechEngine plays. Because
// SpeechEngine is a plain module (not a React tree), the provider PUSHES the
// persona into it via SpeechEngine.setPersona() on boot and on every change,
// so non-React callers stay in sync. Choice persists across launches.
//
//   const { persona, isKid, setPersona, toggle } = useVoice();
// ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'voice_persona';
const VALID = ['teacher', 'kid'];
const DEFAULT_PERSONA = 'teacher';

const VoiceContext = createContext(null);

export const VoiceProvider = ({ children }) => {
  const [persona, setPersonaState] = useState(DEFAULT_PERSONA);

  // Restore persisted choice on boot and hand it to the engine.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const next = VALID.includes(saved) ? saved : DEFAULT_PERSONA;
        if (alive) setPersonaState(next);
        SpeechEngine.setPersona(next);
      } catch (e) {
        SpeechEngine.setPersona(DEFAULT_PERSONA);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setPersona = useCallback((next) => {
    if (!VALID.includes(next)) return;
    setPersonaState(next);
    SpeechEngine.setPersona(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setPersonaState((prev) => {
      const next = prev === 'kid' ? 'teacher' : 'kid';
      SpeechEngine.setPersona(next);
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ persona, isKid: persona === 'kid', setPersona, toggle }),
    [persona, setPersona, toggle],
  );

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
};

export const useVoice = () => {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error('useVoice must be used within a VoiceProvider');
  return ctx;
};

export default VoiceContext;
