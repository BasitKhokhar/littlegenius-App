#!/usr/bin/env node
// generateAudio.mjs — BUILD-TIME pre-baking of the app's spoken audio.
//
// Reads every fixed (language, text) pair from scripts/collect.mjs, synthesises
// each one with Azure Neural TTS in ONE consistent male teacher voice, writes
// the clips to assets/audio/teacher/<speechKey>.mp3, and regenerates
// src/Utils/audioManifest.generated.js so React Native can require() them.
//
// This runs on a developer machine, NOT in the app. Nothing here ships.
//
// Credentials come from .env (AZURE_SPEECH_KEY / AZURE_SPEECH_REGION) via
// dotenv. The key is never logged.
//
// Usage:
//   node scripts/generateAudio.mjs                   # generate (reads .env)
//   node scripts/generateAudio.mjs --report          # list coverage, no network
//   node scripts/generateAudio.mjs --emit-phrases    # write scripts/phrases.json, no network
//   node scripts/generateAudio.mjs --manifest-only   # rebuild manifest from existing files
//   node scripts/generateAudio.mjs --only=numbers,catalog   # limit sources
//   node scripts/generateAudio.mjs --limit=20        # cap clips (smoke test)
//   node scripts/generateAudio.mjs --include-arabic  # also bake Islamic Arabic (off by default)
//   node scripts/generateAudio.mjs --force           # re-synthesise even if the file exists
//
// Prereqs: an Azure "Speech" resource (free F0 works), Node 18+ (global fetch).
import 'dotenv/config';
import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { speechKey, langPrefix } from '../src/Utils/speechKey.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const AUDIO_DIR = path.join(ROOT, 'assets', 'audio');
const MANIFEST = path.join(ROOT, 'src', 'Utils', 'audioManifest.generated.js');
const PHRASES_JSON = path.join(__dirname, 'phrases.json');
const LOG_JSON = path.join(__dirname, 'audio-generation-log.json');

// Every clip lives in one folder — the app has a SINGLE voice. (The folder is
// still named "teacher" because that is what the voice is; renaming it would
// churn hundreds of committed files for nothing.)
const VOICE_DIR = 'teacher';

// ── Voice mapping ──────────────────────────────────────────────────────────
// ONE professional male teacher voice for the whole app. Both languages are
// adult male so a child hears the same "teacher" whether the phrase is English
// or Urdu. Do not add a second persona here — consistency IS the feature.
const VOICES = {
  en: { name: 'en-US-AndrewNeural', locale: 'en-US' },
  ur: { name: 'ur-PK-AsadNeural', locale: 'ur-PK' },
  // Arabic recitation is skipped by default (see ARABIC gate below) but uses
  // the same one male teacher when it IS baked.
  ar: { name: 'ar-SA-HamedNeural', locale: 'ar-SA' },
};

// ARABIC clips are held back unless --include-arabic (or an explicit --only).
// They are already baked, and the Qari recitation in assets/audio/quran/ is
// real human recitation that must never be replaced by TTS.
//
// NOTE: the gate is on the LANGUAGE, not on the source. It used to list whole
// Islamic sources ('prophets', 'manners', …) — which meant their ENGLISH and
// URDU narration was never generated either, so those cards silently fell back
// to the device (female) TTS voice. Every non-Arabic string in the Islamic
// section now bakes in the normal run, in the same male teacher voice as the
// rest of the app.
const isArabic = (prefix) => prefix === 'ar';

// Azure output: small mono MP3 is plenty for short narration and plays on both
// platforms via expo-audio.
const OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';
const EXT = 'mp3';

// ── args ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f) => {
  const a = args.find((x) => x.startsWith(`${f}=`));
  return a ? a.split('=')[1] : null;
};
const REPORT = has('--report');
const MANIFEST_ONLY = has('--manifest-only');
const EMIT_PHRASES = has('--emit-phrases');
const INCLUDE_ARABIC = has('--include-arabic');
const FORCE = has('--force');
const ONLY = val('--only') ? new Set(val('--only').split(',')) : null;
const LIMIT = val('--limit') ? parseInt(val('--limit'), 10) : Infinity;

const xmlEscape = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

// ── Single English letters ─────────────────────────────────────────────────
// A lone letter is the hardest thing in the corpus to get right and the most
// important — it is the first thing a child taps on the Alphabet screen.
//
// It must be read as the letter NAME ("ay"), not as a word: left bare, Azure can
// speak "A" as the indefinite article (a flat schwa, "uh") and "I" as the
// pronoun. <say-as interpret-as="characters"> was tried for this and measured to
// be a NO-OP on these voices — bare and say-as renders came back the same length
// for A/E/G/I/Z. So the letter name is stated outright in IPA instead, which
// leaves Azure nothing to guess.
//
// The rate is baked in at -25% too. A letter is ~0.45s of a single diphthong, and
// slowing THAT for a young learner has to happen at synthesis (the neural voice
// really articulates the glide) — doing it at playback time-stretches half a
// second of vowel into a warble. The app plays these at ~1x; see speechEngine.js.
const LETTER_RATE = '-25%';

// General American letter names.
const LETTER_IPA = {
  A: 'eɪ',  B: 'biː', C: 'siː', D: 'diː', E: 'iː',  F: 'ɛf',
  G: 'dʒiː', H: 'eɪtʃ', I: 'aɪ', J: 'dʒeɪ', K: 'keɪ', L: 'ɛl',
  M: 'ɛm',  N: 'ɛn',  O: 'oʊ',  P: 'piː', Q: 'kjuː', R: 'ɑɹ',
  S: 'ɛs',  T: 'tiː', U: 'juː', V: 'viː', W: 'ˈdʌbəljuː',
  X: 'ɛks', Y: 'waɪ', Z: 'ziː',
};

const isSingleEnglishLetter = (text, voice) =>
  voice.locale.startsWith('en') && /^[A-Za-z]$/.test(text.trim());

// ── Letter PHONICS (the sound, not the name) ───────────────────────────────
// The AlphabetScreen hero "Hear A" button used to speak the letter NAME via
// LETTER_IPA above ("ay"), which is correct when teaching the alphabet song
// but is NOT what a child expects when a card is teaching "A for Apple" — they
// expect the phonics sound (/æ/), not "ay for Apple". This is a second, distinct
// table read through the SAME IPA-phoneme mechanism, just with the standard
// General-American phonics sound per letter instead of its name.
//
// CONSONANTS carry a light trailing schwa (b->'bə' "buh", not bare 'b'). A bare
// stop/glide consonant has NO vowel nucleus at all, and that is out-of-
// distribution for Azure's neural vocoder — measured (2026-08-01) as garbled/
// glitchy audio for exactly the consonants that were left bare, while the SAME
// sound embedded in real speech (e.g. the "B" in "B for Ball") rendered clean.
// LETTER_IPA above never hit this because every letter NAME already ends in a
// vowel ("bee", "dee", "kay", …) — the schwa release here gives phonics clips
// the same vowel-bearing-syllable shape that has always rendered reliably.
// Vowels stay bare — they ARE the nucleus, nothing to release.
//
// These clips render at NORMAL rate (0%), not LETTER_RATE — see the `phonic`
// branch of `ssml()` below for why: baking a slowdown into an isolated
// phoneme hyperarticulates it (measured 2026-08-01: B/C/D/… came back as
// "ba"/"caa"/"daa", a fuller vowel than the light schwa this table asks for).
const LETTER_PHONICS_IPA = {
  A: 'æ', B: 'bə', C: 'kə', D: 'də', E: 'ɛ', F: 'fə', G: 'gə', H: 'hə', I: 'ɪ', J: 'dʒə',
  K: 'kə', L: 'lə', M: 'mə', N: 'nə', O: 'ɑ', P: 'pə', Q: 'kwə', R: 'rə', S: 'sə', T: 'tə',
  U: 'ʌ', V: 'və', W: 'wə', X: 'ksə', Y: 'jə', Z: 'zə',
};

// Text marker for a phonics request — a real spoken phrase ("sound of B"), not
// gibberish, so a device-TTS fallback (before this is baked, or if the clip is
// ever missing) still says something sensible instead of reading a hyphenated
// key literally. Distinct from the bare letter text used by LETTER_IPA above,
// so the two get different speechKeys and can't collide.
const PHONIC_MARKER_RE = /^sound of ([A-Za-z])$/i;
const matchPhonicMarker = (text, voice) =>
  voice.locale.startsWith('en') ? text.trim().match(PHONIC_MARKER_RE) : null;

// "A for Apple" style teaching phrases (VocabularyTile on the Alphabet screen) hit the
// SAME article-vs-letter-name ambiguity as a lone letter: left bare, Azure reads a
// leading "A" as "a" (schwa), not the letter name. Unlike a lone letter, a full phrase
// has enough syllables to survive normal-speed playback, so only the leading letter gets
// the IPA phoneme treatment — the rest of the phrase (and the overall rate) stays plain,
// same as every other baked sentence in the app.
const LETTER_FOR_RE = /^([A-Za-z])\s+for\s+/;
const matchLetterForPhrase = (text, voice) =>
  voice.locale.startsWith('en') ? text.trim().match(LETTER_FOR_RE) : null;

// Azure occasionally returns a single-letter clip with ~0.9s of trailing silence
// stapled on — the SAME request rendered 1.78s, 1.78s, then 0.98s on three
// consecutive tries. A padded clip leaves dead air after the sound and delays the
// button's finished state, so a letter render that busts this ceiling is retried
// and the tightest take wins. CBR mp3 ⇒ bytes are proportional to duration, so
// this needs no decoder. The longest legitimate letter is "double-you" (~1.1s).
const LETTER_MAX_SECONDS = 1.3;
const LETTER_TAKES = 5;
const clipSeconds = (buf) => (buf.length * 8) / 48000;

// Explicit neutral prosody on every clip. Azure's default already is rate/pitch
// 0%, but stating it means a future voice swap can't quietly change the pace of
// SOME clips and not others — every phrase in the app is spoken identically.
const ssml = (text, voice, source) => {
  const letter = isSingleEnglishLetter(text, voice);
  const phonic = !letter ? matchPhonicMarker(text, voice) : null;
  const forMatch = !letter && !phonic ? matchLetterForPhrase(text, voice) : null;
  let inner;
  if (letter) {
    const ipa = LETTER_IPA[text.trim().toUpperCase()];
    inner = ipa
      ? `<phoneme alphabet="ipa" ph="${ipa}">${xmlEscape(text.trim())}</phoneme>`
      : xmlEscape(text);
  } else if (phonic) {
    const L = phonic[1].toUpperCase();
    const ipa = LETTER_PHONICS_IPA[L];
    inner = ipa
      ? `<phoneme alphabet="ipa" ph="${ipa}">${xmlEscape(L)}</phoneme>`
      : xmlEscape(L);
  } else if (forMatch) {
    const ipa = LETTER_IPA[forMatch[1].toUpperCase()];
    const rest = text.trim().slice(forMatch[0].length);
    inner = ipa
      ? `<phoneme alphabet="ipa" ph="${ipa}">${xmlEscape(forMatch[1])}</phoneme> for ${xmlEscape(rest)}`
      : xmlEscape(text);
  } else {
    inner = xmlEscape(applyUrduHomographFix(text, voice, source));
  }
  // Only bare letter NAMES (LETTER_IPA, "ay"/"bee"/"kay") get the baked -25%
  // slowdown. `phonic` clips ("sound of B") deliberately do NOT — measured
  // 2026-08-01: at LETTER_RATE the isolated schwa/vowel hyperarticulates into
  // the wrong sound ("bə" -> "baa"), while the identical phoneme embedded in
  // the `forMatch` phrase path ("B for Ball", always 0%) renders correctly.
  // Slow-for-kids on this button still happens, just at PLAYBACK time
  // (AlphabetScreen's clipRate/minClipRate + speechEngine's globalSpeed),
  // same mechanism every other clip in the app already uses.
  //
  // Urdu standalone letter clips (source 'urduLetters') get the SAME
  // treatment for the same reason: a 1-token render ("سے", "شین", "ڑے") is
  // exactly the short-utterance case Azure clips/truncates unpredictably —
  // reported 2026-08-01 as "shen" instead of "sheen", "he" instead of "hay".
  // Urdu vocab words/phrases (multiple syllables) are left at 0% — they were
  // NOT reported as needing this.
  const urduLetter = source === 'urduLetters' && voice.locale.startsWith('ur');
  const rate = letter || urduLetter ? LETTER_RATE : '0%';
  return (
    `<speak version='1.0' xml:lang='${voice.locale}'>` +
    `<voice name='${voice.name}'>` +
    `<prosody rate="${rate}" pitch="0%">${inner}</prosody>` +
    `</voice></speak>`
  );
};

// ── Urdu homograph disambiguation ──────────────────────────────────────────
// Urdu script normally omits short-vowel diacritics (اعراب), which a fluent
// reader fills in from context but leaves Azure's ur-PK voice to guess — and
// for a few words in the Haroof vocabulary it guesses the WRONG common word:
//   بکری bare -> "bikri" (sale), not "bakri" (goat), the word being taught.
//   شکر  bare -> "shukr" (thanks/gratitude — very common across the app's
//                Islamic content), not "shakar" (sugar), the word being taught.
// The fix is a diacritized form used ONLY for synthesis; urduData.js, the
// display, and the pre-baked-clip lookup key all keep using the bare word
// (mirrors LETTER_IPA above: phoneme/diacritic overrides never change what's
// displayed or how the clip is looked up, only what gets sent to Azure).
//
// Scoped to sources where the word is unambiguously this alphabet-vocabulary
// entry (see scripts/collect.mjs: 'urdu', 'urduVocabPhrase', and the 'quiz'
// questions ModuleQuizScreen generates directly from urduData word/letter, per
// quizGenerators.js generateUrduHarfMatchBank/WordMatchBank/MeaningBank). Other
// sources (duas, prophets, pillars, kalmas, …) use شکر correctly to mean
// "thanks" in free-form sentences and must NOT be rewritten.
const URDU_HOMOGRAPH_FIX = {
  'بکری': 'بَکری',
  'شکر': 'شَکَر',
  // Jeem — vowel homograph (بغیر اعراب "جگ" easily reads as "jag", not "jug")
  'جگ': 'جُگ',
  // Chhoti Hay — vowel homograph (ہوا bare -> "hua" [happened], not "hawa" [air])
  'ہوا': 'ہَوا',
  // Say (ث) — light vowel diacritics
  'ثعلب': 'ثَعْلَب', 'ثمر': 'ثَمَر', 'ثواب': 'ثَواب',
  'ثقیل': 'ثَقِیل', 'ثقافت': 'ثَقافَت', 'ثابت': 'ثابِت',
  // Chay (چ) — light vowel diacritics
  'چائے': 'چَائے', 'چمچہ': 'چَمچَہ', 'چڑیا': 'چِڑیا', 'چہل پہل': 'چَہَل پَہَل',
  // Hay (ح) — light vowel diacritics
  'حلوا': 'حَلوا', 'حجام': 'حَجّام', 'حل': 'حَل',
  'حوصلہ': 'حَوصَلہ', 'حلقہ': 'حَلقَہ', 'حرف': 'حَرف',
  // Daal (د) — light vowel diacritics
  'درخت': 'دَرَخت', 'دل': 'دِل', 'دستک': 'دَستَک', 'دروازہ': 'دَروازَہ',
};
const URDU_HOMOGRAPH_SOURCES = new Set(['urdu', 'urduVocabPhrase', 'quiz']);

// Bare isolated Urdu letter glyphs (e.g. a lone 'ث') have no vowel to voice,
// so Azure's ur-PK guesses — and often lands on a different letter entirely
// (ث/چ/ح collapsing to a plain س sound, ژ reading as ی, ء reading as the
// generic word "ishariya" instead of "hamza"). Substitute the standard,
// already-correct spelled-out Urdu-script letter name (matches the `name`
// field in urduData.js) for SYNTHESIS ONLY — display, emoji, and speechKey
// are untouched (mirrors URDU_HOMOGRAPH_FIX above).
// ث/س and ح/ہ are pronounced IDENTICALLY in standard Urdu (no audible "th" or
// pharyngeal-h distinction) — so for those two, substitute the far MORE COMMON
// letter's spelling rather than the rarer one; Azure renders common graphemes
// (سے "from", ہے "is") far more reliably than rare artificial letter-name
// tokens like ثے/حے. Confirmed empirically 2026-08-01: سے fixed Say; ثے did not.
const URDU_LETTER_NAME_FIX = {
  'ث': 'سے', 'چ': 'چے', 'ح': 'ہے', 'د': 'دال', 'ڑ': 'ڑے',
  'ژ': 'ژے', 'ش': 'شین', 'گ': 'گاف', 'و': 'واؤ', 'ء': 'ہمزہ',
};
const URDU_LETTER_NAME_SOURCES = new Set(['urduLetters', 'urduVocabPhrase']);

const applyUrduHomographFix = (text, voice, source) => {
  if (!voice.locale.startsWith('ur')) return text;
  let out = text;
  if (URDU_HOMOGRAPH_SOURCES.has(source)) {
    for (const [bare, fixed] of Object.entries(URDU_HOMOGRAPH_FIX)) {
      // Urdu has no case; match the bare word flanked by non-letter boundaries
      // (start/end of string or whitespace) so it isn't rewritten as a substring
      // inside a longer, unrelated word.
      out = out.replace(new RegExp(`(^|\\s)${bare}(?=$|\\s)`, 'g'), `$1${fixed}`);
    }
  }
  if (URDU_LETTER_NAME_SOURCES.has(source)) {
    for (const [bare, fixed] of Object.entries(URDU_LETTER_NAME_FIX)) {
      out = out.replace(new RegExp(`(^|\\s)${bare}(?=$|\\s)`, 'g'), `$1${fixed}`);
    }
  }
  return out;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Load collect.mjs by bundling it (esbuild resolves the ESM data files for Node).
async function loadPairs() {
  const outfile = path.join(os.tmpdir(), `lg-collect-${Date.now()}.mjs`);
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'collect.mjs')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile,
    logLevel: 'silent',
  });
  const mod = await import(pathToFileURL(outfile).href);
  fs.rmSync(outfile, { force: true });
  return mod.collectPairs();
}

// Azure REST synthesis -> Buffer of MP3 bytes.
//
// The free F0 tier throttles hard (~20 requests/min). A 2000-clip run WILL hit
// 429 repeatedly, so retry with exponential backoff, honouring Retry-After when
// Azure sends it. 5xx is retried too (transient); 4xx other than 429 is a real
// error (bad SSML / bad voice name) and fails fast.
//
// Single letters get an extra pass on top: see LETTER_MAX_SECONDS — Azure pads
// these tiny renders with trailing silence at random, so a busted clip is
// re-requested and the shortest take is kept (padding only ever ADDS).
async function synthesize(text, voice, key, region, source, attempt = 0) {
  // NOTE: Urdu 'urduLetters' clips deliberately do NOT get this retry — unlike
  // an English letter name ("ay", "bee"), the Urdu substitutes are short WORDS
  // (سے, شین, ہمزہ, 2-4 chars) that legitimately run 1.6-2.2s at LETTER_RATE.
  // Tried 2026-08-01: all 38 letters "failed" LETTER_MAX_SECONDS every time
  // (5x Azure calls each, zero benefit) because the ceiling is English-tuned.
  const isLoneLetter = isSingleEnglishLetter(text, voice) || matchPhonicMarker(text, voice);
  if (isLoneLetter && attempt === 0) {
    let best = null;
    for (let take = 0; take < LETTER_TAKES; take++) {
      const buf = await synthesizeOnce(text, voice, key, region, source, 0);
      if (!best || buf.length < best.length) best = buf;
      if (clipSeconds(best) <= LETTER_MAX_SECONDS) break;
      await sleep(600);
    }
    if (clipSeconds(best) > LETTER_MAX_SECONDS) {
      // Say so rather than shipping dead air nobody notices until a child taps it.
      process.stdout.write(
        `\n  ⚠ letter "${text}" still ${clipSeconds(best).toFixed(2)}s after ` +
        `${LETTER_TAKES} takes (padded) — re-run to re-roll it`
      );
    }
    return best;
  }
  return synthesizeOnce(text, voice, key, region, source, attempt);
}

async function synthesizeOnce(text, voice, key, region, source, attempt = 0) {
  const MAX_ATTEMPTS = 6;
  let res;
  try {
    res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': OUTPUT_FORMAT,
        'User-Agent': 'littlegenius-audiogen',
      },
      body: ssml(text, voice, source),
    });
  } catch (e) {
    // Network blip — treat like a 5xx.
    if (attempt >= MAX_ATTEMPTS) throw e;
    await sleep(2 ** attempt * 1000);
    return synthesizeOnce(text, voice, key, region, source, attempt + 1);
  }

  if (res.ok) return Buffer.from(await res.arrayBuffer());

  const retryable = res.status === 429 || res.status >= 500;
  if (retryable && attempt < MAX_ATTEMPTS) {
    const hinted = parseInt(res.headers.get('retry-after') || '', 10);
    const waitMs = Number.isFinite(hinted) ? hinted * 1000 : 2 ** attempt * 1000;
    if (res.status === 429) process.stdout.write(`\n  ⏳ rate-limited, waiting ${Math.round(waitMs / 1000)}s…`);
    await sleep(waitMs);
    return synthesizeOnce(text, voice, key, region, source, attempt + 1);
  }

  // NOTE: never include `key` in this message.
  throw new Error(`Azure TTS ${res.status} ${res.statusText}: ${await res.text().catch(() => '')}`);
}

// Rebuild the RN manifest from whatever clips currently exist on disk.
function writeManifest() {
  const dir = path.join(AUDIO_DIR, VOICE_DIR);
  const entries = !fs.existsSync(dir)
    ? ''
    : fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(`.${EXT}`))
        .sort()
        .map((f) => {
          const key = f.slice(0, -(EXT.length + 1));
          return `  '${key}': require('../../assets/audio/${VOICE_DIR}/${f}'),`;
        })
        .join('\n');

  const body =
    `// ⚠️  AUTO-GENERATED by scripts/generateAudio.mjs — DO NOT EDIT BY HAND.\n` +
    `// Maps speechKey() -> the bundled audio clip for that phrase.\n` +
    `// The app has one voice, so this is a flat map (no persona dimension).\n\n` +
    `export const AUDIO = {\n${entries}\n};\n\nexport default AUDIO;\n`;
  fs.writeFileSync(MANIFEST, body);
  console.log(`✔ Wrote manifest ${path.relative(ROOT, MANIFEST)} (${entries ? entries.split('\n').length : 0} clips)`);
}

// scripts/audio-generation-log.json — what each clip on disk actually says and
// which voice said it. Merged, not overwritten: a run that skips existing files
// must not erase their history, so previous entries are preserved and only the
// clips synthesised this run get a fresh `generatedAt`.
function writeLog(freshEntries) {
  let previous = [];
  try {
    previous = JSON.parse(fs.readFileSync(LOG_JSON, 'utf8'));
    if (!Array.isArray(previous)) previous = [];
  } catch {
    previous = []; // no log yet, or it's corrupt — start clean
  }

  const byFile = new Map(previous.map((e) => [e.file, e]));
  for (const e of freshEntries) byFile.set(e.file, e); // fresh wins

  // Drop entries whose clip no longer exists (e.g. after a manual delete).
  const dir = path.join(AUDIO_DIR, VOICE_DIR);
  const rows = [...byFile.values()]
    .filter((e) => fs.existsSync(path.join(dir, e.file)))
    .sort((a, b) => a.file.localeCompare(b.file));

  fs.writeFileSync(LOG_JSON, `${JSON.stringify(rows, null, 2)}\n`);
  console.log(`✔ Wrote ${path.relative(ROOT, LOG_JSON)} (${rows.length} clips tracked)`);
}

// scripts/phrases.json — the human-readable inventory of everything the app
// speaks. Generated (never hand-edited) so it cannot drift from collect.mjs.
function writePhrases(items) {
  const rows = items.map((it) => ({
    id: it.key,
    text: it.text,
    lang: it.language,
    category: it.source,
  }));
  fs.writeFileSync(PHRASES_JSON, `${JSON.stringify(rows, null, 2)}\n`);
  console.log(`✔ Wrote ${path.relative(ROOT, PHRASES_JSON)} (${rows.length} phrases)`);
}

async function main() {
  if (MANIFEST_ONLY) {
    writeManifest();
    return;
  }

  const raw = await loadPairs();

  // Dedupe by speechKey; keep first text seen per key.
  const byKey = new Map();
  for (const p of raw) {
    const prefix = langPrefix(p.language);
    // --only names sources explicitly, so honour it even for Arabic ones;
    // otherwise Arabic recitation is left alone unless --include-arabic.
    if (ONLY) {
      if (!ONLY.has(p.source)) continue;
    } else if (!INCLUDE_ARABIC && isArabic(prefix)) {
      continue;
    }
    const key = speechKey(p.language, p.text);
    if (!byKey.has(key)) byKey.set(key, { ...p, key, prefix });
  }
  const items = [...byKey.values()];

  // Coverage report grouped by source + language, with the character counts
  // that decide whether a run fits the Azure free tier.
  const bySource = {};
  let totalChars = 0;
  for (const it of items) {
    const s = (bySource[it.source] ||= { langs: {}, chars: 0 });
    s.langs[it.prefix] = (s.langs[it.prefix] || 0) + 1;
    s.chars += it.text.length;
    totalChars += it.text.length;
  }
  console.log(`\nCollected ${raw.length} pairs -> ${items.length} unique clips:`);
  for (const [src, s] of Object.entries(bySource)) {
    const langs = Object.entries(s.langs).map(([l, c]) => `${l}:${c}`).join('  ');
    console.log(`  ${src.padEnd(16)} ${langs.padEnd(18)} ${String(s.chars).padStart(6)} chars`);
  }
  console.log(`  ${''.padEnd(16)} ${'TOTAL'.padEnd(18)} ${String(totalChars).padStart(6)} chars ` +
    `(${((totalChars / 500000) * 100).toFixed(1)}% of the 500K free F0 tier)`);
  if (!INCLUDE_ARABIC && !ONLY) console.log('  (Arabic clips excluded — pass --include-arabic to bake them)');

  if (EMIT_PHRASES) writePhrases(items);
  if (REPORT || EMIT_PHRASES) {
    console.log('\nNo audio generated (report/emit only).');
    return;
  }

  // Prefer the .env names; accept the older AZURE_TTS_* so an existing shell
  // export keeps working. Never print these values.
  const KEY = process.env.AZURE_SPEECH_KEY || process.env.AZURE_TTS_KEY;
  const REGION = process.env.AZURE_SPEECH_REGION || process.env.AZURE_TTS_REGION;
  if (!KEY || !REGION) {
    console.error('\n✖ AZURE_SPEECH_KEY and AZURE_SPEECH_REGION must be set (in .env or the shell).');
    console.error('  Pass --report or --emit-phrases to inspect the corpus without credentials.');
    process.exit(1);
  }

  const outDir = path.join(AUDIO_DIR, VOICE_DIR);
  fs.mkdirSync(outDir, { recursive: true });

  const log = [];
  let made = 0, skipped = 0, failed = 0, done = 0;
  for (const it of items) {
    if (done >= LIMIT) break;
    done++;
    const voice = VOICES[it.prefix];
    if (!voice) {
      failed++;
      console.warn(`  ✖ ${it.key} (${it.source}): no voice mapped for "${it.prefix}"`);
      continue;
    }
    const file = `${it.key}.${EXT}`;
    const outPath = path.join(outDir, file);
    if (fs.existsSync(outPath) && !FORCE) { skipped++; continue; }
    try {
      const buf = await synthesize(it.text, voice, KEY, REGION, it.source);
      fs.writeFileSync(outPath, buf);
      made++;
      log.push({
        file, text: it.text, lang: it.language, voice: voice.name,
        source: it.source, chars: it.text.length, generatedAt: new Date().toISOString(),
      });
      if (made % 25 === 0) console.log(`  …${made} clips generated`);
    } catch (e) {
      failed++;
      console.warn(`  ✖ ${it.key} (${it.source}): ${e.message}`);
    }
  }

  console.log(`\nDone. made=${made} skipped=${skipped} failed=${failed}`);
  writeLog(log);
  writeManifest();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
