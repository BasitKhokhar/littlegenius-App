// Speech Engine — plays spoken audio for the whole app through ONE entry point.
//
// Two-tier voice strategy (best available wins):
//   1. PRE-BAKED PREMIUM AUDIO (preferred): fixed curriculum + feedback strings
//      are generated once at build time with a neural TTS in two personas
//      ("teacher" / "kid") and bundled as clips. speak() looks the clip up by
//      speechKey() for the active persona and plays it via expo-audio. Result:
//      the SAME warm, human-quality voice on every device, fully offline, with
//      correct Urdu/Arabic pronunciation. The persona is set by VoiceContext
//      through setPersona().
//   2. DEVICE TTS FALLBACK: dynamic strings (star counts, generated numbers)
//      have no pre-baked clip, so they use expo-speech — the device's built-in
//      voice, tuned toward an adult narrator (male voice selection + adult
//      pitch + slightly slow rate).
//
// Reliability contract: every speak() call settles EXACTLY ONCE — it always
// calls either opts.onDone or opts.onError, for BOTH the audio and TTS paths,
// even when a clip fails to load or the device TTS produces total silence
// (e.g. Arabic/Urdu voice data not installed) and fires no native callback.
// This guarantees callers (buttons, recitation chains) can never get stuck in
// a "playing…" state.
import * as Speech from 'expo-speech';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { speechKey } from './speechKey';
import { AUDIO } from './audioManifest.generated';

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

let cachedVoices = null;          // Voice[] once a NON-EMPTY list is obtained
const resolvedByLang = {};        // langPrefix -> identifier|null (cached only once voices are known)

// ── Pre-baked audio (premium neural voice) ────────────────────────────────
// When a clip exists for the active persona we play a bundled, human-quality
// file that sounds identical on every device and works offline. When it
// doesn't (dynamic strings, or before the pipeline has been run) we fall
// through to the device-TTS path below. VoiceContext keeps `activePersona`
// in sync via setPersona().
let activePersona = 'teacher';    // 'teacher' | 'kid'
let currentPlayer = null;         // the AudioPlayer currently playing, if any
let audioModeReady = false;       // setAudioModeAsync() run once, lazily

// Kids often hold the phone on silent — make sure narration is still audible.
const ensureAudioMode = () => {
  if (audioModeReady) return;
  audioModeReady = true;
  setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
};

// The bundled clip for a phrase in the active persona, or null.
const lookupClip = (language, text) => {
  const pack = AUDIO[activePersona];
  if (!pack) return null;
  return pack[speechKey(language, text)] ?? null;
};

const releasePlayer = (player) => {
  try { player?.remove?.(); } catch { /* already gone */ }
  if (currentPlayer === player) currentPlayer = null;
};

const langPrefix = (language) => (language || 'en').toLowerCase().split(/[-_]/)[0];

// Load the device voice list. We deliberately DO NOT cache an empty result:
// on a cold start the TTS engine may not be ready and returns [], and caching
// that would permanently disable male-voice selection for the whole session.
const loadVoices = async () => {
  if (cachedVoices && cachedVoices.length) return cachedVoices;
  try {
    const v = await Speech.getAvailableVoicesAsync();
    const list = Array.isArray(v) ? v : [];
    if (list.length) cachedVoices = list;
    return list;
  } catch {
    return [];
  }
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
  const voices = await loadVoices();
  // No voices known yet — don't cache a decision; retry on the next call.
  if (!voices.length) return null;
  if (resolvedByLang[prefix] !== undefined) return resolvedByLang[prefix];

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

// How long we allow speech to run before assuming the callbacks were lost.
// Rough estimate from text length, generously padded, hard-capped.
const estimateDurationMs = (text, rate) => {
  const perChar = 95 / Math.max(0.5, rate || 0.9); // ~ms per character
  return Math.min(60000, Math.max(4000, Math.round(text.length * perChar)));
};

export const SpeechEngine = {
  /**
   * True if the device has at least one installed voice for `language`.
   * Returns true when the voice list is unknown (don't block on uncertainty).
   */
  isLanguageAvailable: async (language) => {
    const prefix = langPrefix(language);
    const voices = await loadVoices();
    if (!voices.length) return true; // unknown — assume available
    return voices.some((v) => `${v.language || ''}`.toLowerCase().startsWith(prefix));
  },

  /**
   * Speak text in a clear, professional male voice.
   * Always settles exactly once via onDone or onError.
   * @param {string} text     Text to speak
   * @param {string} language Language code (en-US, ur-PK, ar, …)
   * @param {object} opts     Optional: { onDone, onError, pitch, rate }
   */
  speak: async (text, language = 'en-US', opts = {}) => {
    const clean = `${text ?? ''}`.trim();

    // A single-settle guard so onDone/onError fire exactly once, no matter
    // which of {native callback, start-watchdog, done-watchdog} wins.
    let settled = false;
    let startTimer = null;
    let doneTimer = null;
    let cleanup = null;              // releases native resources (audio player)
    const clearTimers = () => {
      if (startTimer) { clearTimeout(startTimer); startTimer = null; }
      if (doneTimer) { clearTimeout(doneTimer); doneTimer = null; }
    };
    const settle = (ok, err) => {
      if (settled) return;
      settled = true;
      clearTimers();
      if (cleanup) { try { cleanup(); } catch { /* noop */ } cleanup = null; }
      if (ok) opts.onDone?.();
      else opts.onError?.(err || new Error('speech-failed'));
    };

    if (!clean) {
      // Nothing to say — treat as a no-op completion so callers reset cleanly.
      settle(true);
      return;
    }

    try {
      await Speech.stop();
    } catch {
      // stop() can reject if nothing was playing — harmless.
    }
    // Cancel any pre-baked clip still playing from a previous call.
    if (currentPlayer) releasePlayer(currentPlayer);

    // ── Preferred path: play the pre-baked premium-voice clip if we have one ──
    const clip = lookupClip(language, clean);
    if (clip) {
      try {
        ensureAudioMode();
        const player = createAudioPlayer(clip);
        currentPlayer = player;

        const sub = player.addListener('playbackStatusUpdate', (status) => {
          // didJustFinish fires once when the clip reaches its end.
          if (status?.didJustFinish) settle(true);
        });
        // settle() runs this to release the native player + listener exactly once.
        cleanup = () => {
          try { sub?.remove?.(); } catch { /* noop */ }
          releasePlayer(player);
        };

        opts.onStart?.();
        player.play();

        // Safety net: if didJustFinish is ever lost, settle by estimated length.
        doneTimer = setTimeout(() => settle(true), estimateDurationMs(clean, 1) + 4000);
        return;
      } catch (error) {
        // Clip failed to load/play — fall through to device TTS below.
        console.warn('[SpeechEngine] Pre-baked clip failed, using TTS:', error);
        if (currentPlayer) releasePlayer(currentPlayer);
      }
    }

    const voice = await resolveMaleVoice(language);

    // Adult male pitch. If we found a real male voice, keep it near-natural;
    // otherwise deepen the default voice a little so it still reads as male.
    const pitch = opts.pitch ?? (voice ? 0.97 : 0.9);
    const rate = opts.rate ?? 0.9; // slightly slow = clearer for kids

    const utterance = {
      language,
      pitch,
      rate,
      onStart: () => {
        // Speech genuinely began: cancel the "never started" watchdog and
        // switch to a duration-based safety net in case onDone is lost.
        if (startTimer) { clearTimeout(startTimer); startTimer = null; }
        opts.onStart?.();
        doneTimer = setTimeout(() => settle(true), estimateDurationMs(clean, rate) + 4000);
      },
      onDone: () => settle(true),
      onStopped: () => settle(true),
      onError: (error) => {
        console.warn('[SpeechEngine] Error:', error);
        settle(false, error);
      },
    };
    if (voice) utterance.voice = voice;

    // Watchdog: if the engine never reports onStart (voice/language data not
    // installed → total silence, no native callback), fail after a grace
    // period so the UI recovers instead of hanging on "playing…".
    startTimer = setTimeout(() => settle(false, new Error('speech-did-not-start')), 5000);

    try {
      // NOTE: Speech.speak() returns void (not a Promise) — do not await it.
      Speech.speak(clean, utterance);
    } catch (error) {
      console.warn('[SpeechEngine] Failed to speak:', error);
      settle(false, error);
    }
  },

  /**
   * Select the voice persona used for pre-baked audio.
   * Called by VoiceContext on boot and whenever the grown-up changes it.
   * @param {'teacher'|'kid'} persona
   */
  setPersona: (persona) => {
    if (persona === 'teacher' || persona === 'kid') activePersona = persona;
  },

  /** The current voice persona. */
  getPersona: () => activePersona,

  /** Stop currently playing speech (both pre-baked audio and device TTS). */
  stop: async () => {
    if (currentPlayer) {
      try { currentPlayer.pause(); } catch { /* noop */ }
      releasePlayer(currentPlayer);
    }
    try {
      await Speech.stop();
    } catch (error) {
      console.warn('[SpeechEngine] Failed to stop:', error);
    }
  },

  /** Check if speech is currently playing */
  isSpeaking: async () => {
    try {
      if (currentPlayer?.playing) return true;
      return await Speech.isSpeakingAsync();
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
