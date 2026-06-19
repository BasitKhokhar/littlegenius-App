// Speech Engine — Text to Speech using Expo Speech.
//
// Goal: a clear, PROFESSIONAL MALE narrator (not the childlike/high female
// tone the old pitch:1.35 produced). We do two things:
//   1. Query the device's installed voices and pick a male one for the
//      target language (cached per language).
//   2. Use an adult pitch + a slightly slower rate for crisp pronunciation.
//      If no clearly-male voice exists on the device, we deepen the pitch
//      further so the default voice still reads as male.
import * as Speech from 'expo-speech';

// Name/identifier hints used to score a voice's gender. expo-speech does
// not expose gender directly, so we infer it from the platform voice ids.
const MALE_HINTS = [
  'male', '#male', 'man',
  // iOS male voices
  'aaron', 'daniel', 'fred', 'alex', 'arthur', 'oliver', 'tom', 'thomas',
  'rishi', 'gordon', 'george', 'reed', 'eddy', 'rocko', 'junior',
  // Android Google male voice id fragments
  '-x-iol', '-x-iom', '-x-iog', '-x-sfg', '-x-tpd', '#male_',
];
const FEMALE_HINTS = [
  'female', '#female', 'woman',
  'samantha', 'karen', 'victoria', 'tessa', 'moira', 'fiona', 'zira',
  'allison', 'ava', 'susan', 'nicky', 'serena', 'kate', 'martha', 'catherine',
  '-x-iob', '-x-tpc', '-x-iod', '#female_',
];

let voicesPromise = null;
const resolvedByLang = {}; // langPrefix -> identifier|null (cached)

const langPrefix = (language) => (language || 'en').toLowerCase().split(/[-_]/)[0];

const loadVoices = () => {
  if (!voicesPromise) {
    voicesPromise = Speech.getAvailableVoicesAsync()
      .then((v) => v || [])
      .catch(() => []);
  }
  return voicesPromise;
};

const scoreVoice = (v) => {
  const s = `${v.identifier || ''} ${v.name || ''}`.toLowerCase();
  let pts = 0;
  if (MALE_HINTS.some((h) => s.includes(h))) pts += 10;
  if (FEMALE_HINTS.some((h) => s.includes(h))) pts -= 10;
  // Prefer higher-quality (enhanced/premium) voices when available.
  const q = `${v.quality || ''}`.toLowerCase();
  if (q.includes('enhanced') || q.includes('premium')) pts += 2;
  return pts;
};

// Returns a male voice identifier for the language, or null if none found.
const resolveMaleVoice = async (language) => {
  const prefix = langPrefix(language);
  if (resolvedByLang[prefix] !== undefined) return resolvedByLang[prefix];

  const voices = await loadVoices();
  const inLang = voices.filter((v) => `${v.language || ''}`.toLowerCase().startsWith(prefix));

  let best = null;
  let bestPts = 0; // require a positive (i.e. male-leaning) score
  for (const v of inLang) {
    const p = scoreVoice(v);
    if (p > bestPts) {
      bestPts = p;
      best = v;
    }
  }
  const chosen = best ? best.identifier : null;
  resolvedByLang[prefix] = chosen;
  return chosen;
};

export const SpeechEngine = {
  /**
   * Speak text in a clear, professional male voice.
   * @param {string} text     Text to speak
   * @param {string} language Language code (en-US, ur-PK, ar, …)
   * @param {object} opts     Optional: { onDone, onError, pitch, rate }
   */
  speak: async (text, language = 'en-US', opts = {}) => {
    try {
      await Speech.stop();

      const voice = await resolveMaleVoice(language);

      // Adult male pitch. If we found a real male voice, keep it near-natural;
      // otherwise deepen the default voice so it still reads as male.
      const pitch = opts.pitch ?? (voice ? 0.97 : 0.85);
      const rate = opts.rate ?? 0.9; // slightly slow = clearer for kids

      const utterance = {
        language,
        pitch,
        rate,
        onDone: opts.onDone,
        onError: (error) => {
          console.warn('[SpeechEngine] Error:', error);
          opts.onError?.(error);
        },
      };
      if (voice) utterance.voice = voice;

      await Speech.speak(text, utterance);
    } catch (error) {
      console.warn('[SpeechEngine] Failed to speak:', error);
      opts.onError?.(error);
    }
  },

  /** Stop currently playing speech */
  stop: async () => {
    try {
      await Speech.stop();
    } catch (error) {
      console.warn('[SpeechEngine] Failed to stop:', error);
    }
  },

  /** Check if speech is currently playing */
  isSpeaking: async () => {
    try {
      return await Speech.isSpeaking();
    } catch (error) {
      console.warn('[SpeechEngine] Error checking if speaking:', error);
      return false;
    }
  },

  /** Speak a number with English + Urdu names */
  speakNumber: async (number, englishName, urduName) => {
    const text = `${number}. In English ${englishName}. In Urdu ${urduName}`;
    await SpeechEngine.speak(text, 'en-US');
  },

  /** Speak with explicit language selection */
  speakWithLanguage: async (text, language = 'en-US') => {
    await SpeechEngine.speak(text, language);
  },
};

export default SpeechEngine;
