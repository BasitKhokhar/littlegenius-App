// Speech Engine — plays spoken audio for the whole app through ONE entry point.
//
// Two-tier voice strategy (best available wins):
//   1. PRE-BAKED PREMIUM AUDIO (preferred): fixed curriculum + feedback strings
//      are generated once at build time (scripts/generateAudio.mjs) with Azure
//      Neural TTS in ONE male teacher voice — en-US-AndrewNeural for English,
//      ur-PK-AsadNeural for Urdu — and bundled as clips. speak() looks the clip
//      up by speechKey() and plays it via expo-audio. Result: the SAME warm,
//      human-quality teacher on every device, fully offline, with correct Urdu
//      pronunciation. One voice everywhere is deliberate — see the manifest.
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
// When a clip exists we play a bundled, human-quality file that sounds
// identical on every device and works offline. When it doesn't (dynamic
// strings like "you earned 3 stars") we fall through to the device-TTS path
// below.
let currentPlayer = null;         // the AudioPlayer currently playing, if any
let audioModeReady = false;       // setAudioModeAsync() run once, lazily

// Delivery tuning — makes the teacher sound crisp and professional rather than
// slow/dragging. Kids stay engaged when a tap responds quickly and the word is
// said briskly but clearly.
//   • CLIP_PLAYBACK_RATE: pre-baked clips are baked at a neutral speed; we play
//     them a touch faster so a single letter/word doesn't drag. Pitch is
//     corrected so it still sounds like the same warm human teacher, not a
//     sped-up chipmunk. 1.0 = as baked; kept modest so pronunciation stays
//     perfectly intelligible for young learners.
//   • TTS_RATE: matching brisk-but-clear speed for the device-TTS fallback.
const CLIP_PLAYBACK_RATE = 1.12;
const TTS_RATE = 1.0;

// Kids often hold the phone on silent — make sure narration is still audible.
const ensureAudioMode = () => {
  if (audioModeReady) return;
  audioModeReady = true;
  setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
};

// The bundled clip for a phrase, or null when it wasn't pre-baked.
const lookupClip = (language, text) => AUDIO[speechKey(language, text)] ?? null;

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
   * @param {object} opts     Optional:
   *   { onStart, onDone, onError, pitch, rate,
   *     audioClip,           // required() MP3 module to play instead of TTS
   *     fallbackText,        // romanized text spoken in English if the
   *     fallbackLang }       //   language's device voice is missing
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

    if (!clean && !opts.audioClip) {
      // Nothing to say and no clip to play — treat as a no-op completion so
      // callers reset cleanly. (A clip with empty text is still valid: e.g. a
      // Quran ayah played purely from its bundled recitation.)
      settle(true);
      return;
    }

    // Route audio so it plays even when the phone is on silent — this must run
    // for BOTH the pre-baked-clip and device-TTS paths, otherwise a muted phone
    // stays silent when we fall back to TTS (the common case before clips are
    // generated).
    ensureAudioMode();

    try {
      await Speech.stop();
    } catch {
      // stop() can reject if nothing was playing — harmless.
    }
    // Cancel any pre-baked clip still playing from a previous call.
    if (currentPlayer) releasePlayer(currentPlayer);

    // ── Preferred path: play a bundled clip if we have one ────────────────────
    // Either an explicit clip the caller passed (opts.audioClip — e.g. real Qari
    // Quran recitation keyed by surah/ayah), or a pre-baked premium-voice clip
    // matched by speechKey. Explicit clip wins.
    // A pre-baked teacher clip (letter/word/number/feedback) may be sped up for
    // a crisper delivery. An explicit opts.audioClip — real Qari Quran
    // recitation, a surah sequence — must play EXACTLY as recorded, untouched.
    const bakedClip = lookupClip(language, clean);
    const clip = opts.audioClip ?? bakedClip;
    const isTeacherClip = !opts.audioClip && !!bakedClip;
    if (clip) {
      try {
        ensureAudioMode();
        const player = createAudioPlayer(clip);
        currentPlayer = player;

        // Snappier, professional delivery: play the pre-baked teacher clip a
        // little faster than baked with pitch correction on, so it stays the
        // same natural voice — just crisper and more responsive for kids. Only
        // teacher clips; an explicit audioClip (Qari recitation) plays at 1x.
        // Guarded because pitch-corrected rate needs a recent native build; on
        // an older one this throws and the clip simply plays at normal speed.
        if (isTeacherClip) {
          try {
            player.shouldCorrectPitch = true;
            player.setPlaybackRate(CLIP_PLAYBACK_RATE, 'high');
          } catch { /* older expo-audio native — play at 1x */ }
        }

        // Absolute cap so we never hang if BOTH didJustFinish and the duration
        // update are lost. Real recitation clips can be long (slow tajweed), so
        // this is deliberately generous and gets tightened once we know the real
        // duration below — it must never be short enough to cut a clip off.
        let armed = false;
        doneTimer = setTimeout(() => settle(true), 90000);

        const sub = player.addListener('playbackStatusUpdate', (status) => {
          // didJustFinish fires once when the clip reaches its end.
          if (status?.didJustFinish) { settle(true); return; }
          // Once the real length is known, arm a precise fallback (duration +
          // padding) in case didJustFinish is ever dropped — without risking an
          // early cutoff the way a text-length estimate would.
          const dur = Number(status?.duration);
          if (!armed && dur > 0 && Number.isFinite(dur)) {
            armed = true;
            if (doneTimer) clearTimeout(doneTimer);
            doneTimer = setTimeout(() => settle(true), Math.round(dur * 1000) + 3000);
          }
        });
        // settle() runs this to release the native player + listener exactly once.
        cleanup = () => {
          try { sub?.remove?.(); } catch { /* noop */ }
          releasePlayer(player);
        };

        opts.onStart?.();
        player.play();
        return;
      } catch (error) {
        // Clip failed to load/play — fall through to device TTS below.
        console.warn('[SpeechEngine] Bundled clip failed, using TTS:', error);
        if (currentPlayer) releasePlayer(currentPlayer);
      }
    }

    // ── Device TTS path (with graceful language fallback) ──────────────────
    // Arabic/Urdu voice data is missing on many devices, so device TTS for
    // those languages produces TOTAL SILENCE (and often no native callback).
    // When the caller supplies a romanized/English fallback we speak THAT with
    // the always-present English voice instead — so a child ALWAYS hears the
    // pronunciation, even with no Arabic/Urdu pack installed. Authentic
    // Arabic/Urdu is still used whenever the device actually has the voice.
    const fallbackText = `${opts.fallbackText ?? ''}`.trim();
    const fallbackLang = opts.fallbackLang || 'en-US';
    // Only a non-English primary can benefit from an English fallback.
    const hasFallback = !!fallbackText && langPrefix(language) !== 'en';

    // Guard so we retry the fallback at most once.
    let retried = false;
    const retryFallback = () => {
      if (settled || retried) return;
      retried = true;
      clearTimers();
      Speech.stop().catch(() => {}); // cancel a late-starting silent utterance
      runTTS(fallbackText, fallbackLang, false);
    };

    // Speak one (text, language). When canFallback is true, any failure —
    // native error, throw, or "never started" watchdog — retries the fallback
    // instead of settling as an error.
    const runTTS = async (spokenText, spokenLang, canFallback) => {
      const voice = await resolveMaleVoice(spokenLang);
      if (settled) return; // a retry/stop may have resolved us while awaiting

      // Adult male pitch. If we found a real male voice keep it near-natural;
      // otherwise deepen the default voice a little so it still reads as male.
      const pitch = opts.pitch ?? (voice ? 0.97 : 0.9);
      const rate = opts.rate ?? TTS_RATE; // brisk but clear for kids

      const utterance = {
        language: spokenLang,
        pitch,
        rate,
        onStart: () => {
          // Speech genuinely began: cancel the "never started" watchdog and
          // switch to a duration-based safety net in case onDone is lost.
          if (startTimer) { clearTimeout(startTimer); startTimer = null; }
          opts.onStart?.();
          doneTimer = setTimeout(() => settle(true), estimateDurationMs(spokenText, rate) + 4000);
        },
        onDone: () => settle(true),
        onStopped: () => settle(true),
        onError: (error) => {
          if (canFallback) { retryFallback(); return; }
          console.warn('[SpeechEngine] Error:', error);
          settle(false, error);
        },
      };
      if (voice) utterance.voice = voice;

      // Watchdog: if the engine never reports onStart (voice/language data not
      // installed → total silence, no native callback), recover — fall back to
      // English if we can, else fail so the UI never hangs on "playing…".
      // A shorter grace when a fallback is waiting keeps the delay unnoticeable.
      startTimer = setTimeout(() => {
        if (canFallback) { retryFallback(); return; }
        settle(false, new Error('speech-did-not-start'));
      }, canFallback ? 2500 : 5000);

      try {
        // NOTE: Speech.speak() returns void (not a Promise) — do not await it.
        Speech.speak(spokenText, utterance);
      } catch (error) {
        if (canFallback) { retryFallback(); return; }
        console.warn('[SpeechEngine] Failed to speak:', error);
        settle(false, error);
      }
    };

    // If we already KNOW the requested voice is unavailable, skip straight to
    // the English fallback so there's no silent 2.5s wait first.
    if (hasFallback) {
      const available = await SpeechEngine.isLanguageAvailable(language);
      if (settled) return;
      if (!available) {
        runTTS(fallbackText, fallbackLang, false);
        return;
      }
    }
    runTTS(clean, language, hasFallback);
  },

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

  /** Speak with explicit language selection */
  speakWithLanguage: async (text, language = 'en-US') => {
    await SpeechEngine.speak(text, language);
  },
};

export default SpeechEngine;
