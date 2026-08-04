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
import { Asset } from 'expo-asset';
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

// The active call's own settle() function, so a NEW speak()/stop() can force-finish
// it immediately instead of leaving its listener + watchdog timers dangling until
// its own timers eventually fire (up to 90s later — see the top of speak() and
// stop() below). Superseding a clip used to only kill the player object; the old
// call's closure (sub/loadTimer/doneTimer) survived until its own watchdog ran,
// which piles up fast under rapid tapping and was the cause of audio getting
// permanently "stuck" after ~15-20 quick taps.
let currentSettle = null;

// ── Cross-component "only one speaker at a time" UI sync ──────────────────
// The audio itself never overlaps (currentPlayer above is a single module-level
// slot), but every SpeakButton/useSpeak instance owns its OWN "isSpeaking" React
// state. Without this registry, tapping word B's sound icon silences word A's
// audio (via currentPlayer) but leaves word A's icon stuck showing the "playing"
// wave bars forever, since A never gets its own onDone/onError — B's tap wasn't
// A's stop(). Every speaker registers a reset callback keyed by its own instance
// id; claim() is called synchronously the instant a NEW speaker starts, and resets
// every OTHER registered speaker's local UI state back to idle.
const activeSpeakers = new Map(); // ownerId -> reset()

const claimSpeaker = (ownerId) => {
  activeSpeakers.forEach((reset, id) => {
    if (id !== ownerId) reset();
  });
};

// Bumped by every speak() and by stop(). A speak() call that recovers from a
// dead clip does so on a timer, so by the time it wants to fall back to the
// device voice the child may already have tapped stop or moved to another
// card. Comparing generations stops a superseded call from blurting out.
let speakGeneration = 0;

// ── Clip-failure diagnostics ──────────────────────────────────────────────
// A bundled clip can load fine in development and still fail in a release/Play
// build: development serves clips over HTTP from the Metro dev server, while a
// release build resolves them from Android res/raw. createAudioPlayer() is
// SYNCHRONOUS and does not throw on a load failure — the error arrives later as
// a playback state change — so a broken clip used to produce pure silence with
// no fallback and no signal (console output is invisible in a store build).
// These counters are surfaced in Settings so a Play-installed build can report
// what actually went wrong. See SpeechEngine.getDiagnostics().
const diagnostics = {
  clipAttempts: 0,
  clipFailures: 0,
  ttsFallbacks: 0,
  lastClipError: null,
  lastResolvedUri: null,
};

// How long a bundled clip may take to reach a loaded state before we abandon it
// and speak with the device voice instead. Clips are local files, so this is
// generous on purpose — it exists to catch total load failure, not slowness.
const CLIP_LOAD_TIMEOUT_MS = 2000;

// Resolve one clip's on-device URI, once, purely for diagnostics. In a release
// Android build this should be a res/raw resource name like
// "assets_audio_teacher_<hash>". An EMPTY string means expo-asset resolved
// through the expo-updates path and the file cannot be opened — the signature
// of a store build that plays nothing.
const recordResolvedUri = (clip) => {
  if (diagnostics.lastResolvedUri !== null) return;
  try {
    diagnostics.lastResolvedUri = `${Asset.fromModule(clip)?.uri ?? ''}`;
  } catch (error) {
    diagnostics.lastResolvedUri = `<unresolvable: ${error?.message ?? error}>`;
  }
};

// Delivery tuning — makes the teacher sound crisp and professional rather than
// slow/dragging. Kids stay engaged when a tap responds quickly and the word is
// said briskly but clearly.
//   • CLIP_PLAYBACK_RATE: pre-baked clips are baked at a neutral speed; we play
//     them slightly SLOWER than baked so young learners can hear each word
//     clearly. Pitch is corrected so it still sounds like the same warm human
//     teacher, not a slowed-down drone. 1.0 = as baked. Callers can override
//     per-phrase via opts.clipRate (e.g. single letters/words are played even
//     slower ~0.7 so a child can copy the pronunciation).
//   • TTS_RATE: matching calm-but-clear speed for the device-TTS fallback.
//   • opts.minClipRate: a FLOOR on the stretch for very short clips. Slowing a
//     word works because there are several syllables to spread out; slowing a
//     single letter does not — "A" is ~0.45s of one diphthong, and pitch-
//     corrected stretching that far warbles it into "aaiii" instead of a clean
//     teacher's "ay". Those clips are baked already-enunciated (generateAudio.mjs
//     LETTER_RATE) and pass a floor so no global speed setting can mangle them.
const CLIP_PLAYBACK_RATE = 0.9;
const TTS_RATE = 0.9;

// Global speed multiplier a grown-up can set in Settings (0.5× … 2×). It scales
// EVERY spoken word — pre-baked teacher clips and the device-TTS fallback alike —
// on top of the per-call tuning above, so one control slows or speeds all of the
// app's narration at once. 1.0 = the app's normal delivery (unchanged). Real Qari
// Quran recitation (opts.audioClip) is deliberately NOT scaled — it always plays
// exactly as recorded. Defaults to 0.75× (the gentle pace most kids start on) and
// is set at boot from the saved preference via setGlobalSpeed().
let globalSpeed = 0.75;
const clampRate = (r, lo, hi) => Math.min(hi, Math.max(lo, r));

// Kids often hold the phone on silent — make sure narration is still audible.
const ensureAudioMode = () => {
  if (audioModeReady) return;
  audioModeReady = true;
  setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
};

// The bundled clip for a phrase, or null when it wasn't pre-baked.
const lookupClip = (language, text) => AUDIO[speechKey(language, text)] ?? null;

const releasePlayer = (player) => {
  // Pause BEFORE remove so playback is silenced instantly. remove()/release on
  // its own can let a clip's tail keep sounding for a beat while native teardown
  // happens — long enough for a freshly-tapped clip to overlap the previous one.
  // Pausing first guarantees the old sound is gone before the new one starts, so
  // rapidly tapping between Islamic recitations never double-voices.
  try { player?.pause?.(); } catch { /* already gone */ }
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
   * Set the global speech-speed multiplier (persisted grown-up preference).
   * Scales every spoken word app-wide; 1.0 = the app's normal delivery.
   * Ignored values that aren't a positive finite number.
   */
  setGlobalSpeed: (mult) => {
    const n = Number(mult);
    if (Number.isFinite(n) && n > 0) globalSpeed = n;
  },

  /** The current global speech-speed multiplier. */
  getGlobalSpeed: () => globalSpeed,

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

    // True while this is still the call the user is waiting on — see speakGeneration.
    const generation = ++speakGeneration;
    const isCurrent = () => generation === speakGeneration;

    // A single-settle guard so onDone/onError fire exactly once, no matter
    // which of {native callback, start-watchdog, done-watchdog} wins.
    let settled = false;
    let startTimer = null;
    let doneTimer = null;
    let loadTimer = null;            // watchdog: bundled clip never reached "loaded"
    let cleanup = null;              // releases native resources (audio player)
    const clearTimers = () => {
      if (startTimer) { clearTimeout(startTimer); startTimer = null; }
      if (doneTimer) { clearTimeout(doneTimer); doneTimer = null; }
      if (loadTimer) { clearTimeout(loadTimer); loadTimer = null; }
    };
    const settle = (ok, err) => {
      if (settled) return;
      settled = true;
      clearTimers();
      if (cleanup) { try { cleanup(); } catch { /* noop */ } cleanup = null; }
      if (currentSettle === settle) currentSettle = null;
      if (ok) opts.onDone?.();
      else opts.onError?.(err || new Error('speech-failed'));
    };

    // Force-finish whatever call was previously active RIGHT NOW instead of
    // waiting for its own watchdogs — see currentSettle above.
    if (currentSettle) {
      const prevSettle = currentSettle;
      currentSettle = null;
      prevSettle(true);
    }
    currentSettle = settle;

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
    // A newer speak()/stop() call may have superseded us while we were
    // awaiting Speech.stop() above — its currentSettle hand-off already ran
    // OUR settle() (settled is now true). Bail out now instead of falling
    // through: settle() is a one-shot no-op once settled, so a native
    // AudioPlayer created past this point would never get onDone/onError,
    // permanently stranding its button's icon in the "speaking" state, AND
    // it would never be tracked/released (only whatever ends up in
    // currentPlayer last gets cleaned up). Under rapid tapping this leaks one
    // orphaned native player per superseded call — enough of them exhausts
    // the OS's concurrent-decoder limit, after which even fresh taps show
    // "speaking" with no sound until the app is fully restarted.
    if (settled) return;
    // Cancel any pre-baked clip still playing from a previous call.
    if (currentPlayer) releasePlayer(currentPlayer);

    // Callers use onStart to flip a button into its "playing" state. A clip that
    // fails to load hands over to TTS after it has already fired, so notify once.
    let startedNotified = false;
    const notifyStart = () => {
      if (startedNotified) return;
      startedNotified = true;
      opts.onStart?.();
    };

    // ── Device TTS path (with graceful language fallback) ──────────────────
    // Defined BEFORE the clip path on purpose: a bundled clip that fails to load
    // does so ASYNCHRONOUSLY, long after createAudioPlayer() has returned, so the
    // recovery path has to be callable from the playback listener — not just from
    // a synchronous catch. Without this a broken clip is silent, never spoken.
    //
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
      // Stopped or superseded while we were resolving a voice — go quiet and
      // let the caller reset rather than speaking over whatever is playing now.
      if (!isCurrent()) { settle(true); return; }

      // Adult male pitch. If we found a real male voice keep it near-natural;
      // otherwise deepen the default voice a little so it still reads as male.
      const pitch = opts.pitch ?? (voice ? 0.97 : 0.9);
      // Brisk but clear for kids, scaled by the user's global speed setting.
      const rate = clampRate((opts.rate ?? TTS_RATE) * globalSpeed, 0.3, 2.0);

      const utterance = {
        language: spokenLang,
        pitch,
        rate,
        onStart: () => {
          // Speech genuinely began: cancel the "never started" watchdog and
          // switch to a duration-based safety net in case onDone is lost.
          if (startTimer) { clearTimeout(startTimer); startTimer = null; }
          notifyStart();
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

    // Entry point for the TTS tier. Runs at most once per speak() call, whether
    // it is reached because no clip exists or because a clip failed to play.
    let ttsStarted = false;
    const startTTS = async () => {
      if (settled || ttsStarted) return;
      ttsStarted = true;
      if (!isCurrent()) { settle(true); return; }
      // A clip can be the ONLY content — e.g. an ayah played purely from its
      // bundled recitation, with no text passed. If that clip dies there is
      // nothing to say, so settle cleanly instead of asking the engine to speak
      // an empty string and waiting out the "never started" watchdog.
      if (!clean && !fallbackText) { settle(true); return; }
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
    };

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
      diagnostics.clipAttempts += 1;
      recordResolvedUri(clip);
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
            // Per-call tuning × the user's global speed, clamped so an extreme
            // setting can't distort the voice into a chipmunk/drone.
            const floor = Number.isFinite(opts.minClipRate) ? opts.minClipRate : 0.4;
            const clipRate = clampRate((opts.clipRate ?? CLIP_PLAYBACK_RATE) * globalSpeed, floor, 3.0);
            player.shouldCorrectPitch = true;
            player.setPlaybackRate(clipRate, 'high');
          } catch { /* older expo-audio native — play at 1x */ }
        }

        let armed = false;       // precise duration-based done timer is set
        let loaded = false;      // the clip actually reached a playable state
        let sawActivity = false; // the player did something other than sit idle
        let abandoned = false;

        // Hand a dead clip over to the device voice instead of going silent.
        // This is the recovery path the synchronous catch below CANNOT provide:
        // createAudioPlayer() never throws when the media can't be opened, so a
        // clip that is present in the bundle but unplayable on the device (the
        // classic release-build-only failure) would otherwise play nothing at
        // all, report success, and leave no trace.
        const abandonClip = (reason) => {
          if (settled || abandoned) return;
          abandoned = true;
          clearTimers();
          diagnostics.clipFailures += 1;
          diagnostics.ttsFallbacks += 1;
          diagnostics.lastClipError = `${reason?.message ?? reason}`;
          console.warn('[SpeechEngine] Bundled clip did not play, using TTS:', reason);
          if (cleanup) { try { cleanup(); } catch { /* noop */ } cleanup = null; }
          // Stopped or superseded while the clip was loading — stay silent.
          if (!isCurrent()) { settle(true); return; }
          startTTS();
        };

        const sub = player.addListener('playbackStatusUpdate', (status) => {
          if (settled || abandoned) return;
          const state = `${status?.playbackState ?? ''}`;
          const dur = Number(status?.duration);
          if (state && state !== 'idle') sawActivity = true;

          // The clip is genuinely alive. Only NOW arm the absolute cap, so a
          // clip that never loads can no longer time out as a success.
          if (!loaded && (status?.isLoaded === true || status?.playing === true
            || state === 'ready' || state === 'ended' || (dur > 0 && Number.isFinite(dur)))) {
            loaded = true;
            if (loadTimer) { clearTimeout(loadTimer); loadTimer = null; }
            // Generous on purpose: real Qari recitation can be long (slow
            // tajweed) and this must never be short enough to cut a clip off.
            // It is tightened below as soon as the true duration is known.
            doneTimer = setTimeout(() => settle(true), 90000);
          }

          // didJustFinish fires once when the clip reaches its end.
          if (status?.didJustFinish) { settle(true); return; }

          // ExoPlayer drops back to "idle" when it fails to open the media. If
          // the player was doing something and still never loaded, the clip is
          // broken — recover immediately instead of waiting out the watchdog.
          if (!loaded && sawActivity && state === 'idle') {
            abandonClip(new Error('clip-load-failed'));
            return;
          }

          // Once the real length is known, arm a precise fallback (duration +
          // padding) in case didJustFinish is ever dropped — without risking an
          // early cutoff the way a text-length estimate would.
          if (loaded && !armed && dur > 0 && Number.isFinite(dur)) {
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

        // Watchdog: clips are local files, so one that hasn't reached a playable
        // state by now never will. Speak with the device voice rather than
        // leaving the child in silence.
        loadTimer = setTimeout(() => {
          if (!loaded) abandonClip(new Error('clip-load-timeout'));
        }, CLIP_LOAD_TIMEOUT_MS);

        notifyStart();
        player.play();
        return;
      } catch (error) {
        // Clip failed synchronously — fall through to device TTS below.
        diagnostics.clipFailures += 1;
        diagnostics.ttsFallbacks += 1;
        diagnostics.lastClipError = `${error?.message ?? error}`;
        console.warn('[SpeechEngine] Bundled clip failed, using TTS:', error);
        if (currentPlayer) releasePlayer(currentPlayer);
        cleanup = null;
      }
    }

    await startTTS();
  },

  /**
   * Snapshot of how the bundled-clip tier is behaving on THIS device.
   * Surfaced in Settings because a store build has no console: if clips are
   * failing, `clipFailures` climbs, `lastClipError` says why, and
   * `lastResolvedUri` shows what the clip resolved to (on a release Android
   * build it should look like "assets_audio_teacher_<hash>" — an empty string
   * means the asset could not be located and nothing can play).
   */
  getDiagnostics: () => ({ ...diagnostics, manifestSize: Object.keys(AUDIO).length }),

  /**
   * Register a speak-owning UI instance (a SpeakButton / useSpeak caller) so it
   * can be told to reset its "playing" state when a DIFFERENT instance starts
   * speaking. Returns an unregister function — call it on unmount.
   * @param {*} ownerId  Any stable per-instance value (e.g. a useRef(Symbol())).
   * @param {Function} reset  Resets this instance's local isSpeaking to false.
   */
  registerSpeaker: (ownerId, reset) => {
    activeSpeakers.set(ownerId, reset);
    return () => {
      if (activeSpeakers.get(ownerId) === reset) activeSpeakers.delete(ownerId);
    };
  },

  /**
   * Claim exclusive "speaking" UI ownership for `ownerId`. Call this the instant
   * a speaker starts (before/alongside SpeechEngine.speak()) — it resets every
   * OTHER registered speaker's local state so only one sound icon ever shows
   * the "playing" animation at a time, matching the single currentPlayer.
   */
  claimSpeaker,

  /** Stop currently playing speech (both pre-baked audio and device TTS). */
  stop: async () => {
    // Retire any in-flight speak() so a clip still waiting on its load watchdog
    // can't fall back to the device voice a moment after the child hit stop.
    speakGeneration += 1;
    // Force-finish the active call's own closure (listener + timers) right away
    // instead of leaving it to its own watchdog — see currentSettle above.
    if (currentSettle) {
      const prevSettle = currentSettle;
      currentSettle = null;
      prevSettle(true);
    }
    // releasePlayer() pauses before removing, so the clip is silenced at once.
    if (currentPlayer) releasePlayer(currentPlayer);
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
