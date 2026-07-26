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
const ssml = (text, voice) => {
  const letter = isSingleEnglishLetter(text, voice);
  const ipa = letter ? LETTER_IPA[text.trim().toUpperCase()] : null;
  const inner = ipa
    ? `<phoneme alphabet="ipa" ph="${ipa}">${xmlEscape(text.trim())}</phoneme>`
    : xmlEscape(text);
  return (
    `<speak version='1.0' xml:lang='${voice.locale}'>` +
    `<voice name='${voice.name}'>` +
    `<prosody rate="${letter ? LETTER_RATE : '0%'}" pitch="0%">${inner}</prosody>` +
    `</voice></speak>`
  );
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
async function synthesize(text, voice, key, region, attempt = 0) {
  if (isSingleEnglishLetter(text, voice) && attempt === 0) {
    let best = null;
    for (let take = 0; take < LETTER_TAKES; take++) {
      const buf = await synthesizeOnce(text, voice, key, region, 0);
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
  return synthesizeOnce(text, voice, key, region, attempt);
}

async function synthesizeOnce(text, voice, key, region, attempt = 0) {
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
      body: ssml(text, voice),
    });
  } catch (e) {
    // Network blip — treat like a 5xx.
    if (attempt >= MAX_ATTEMPTS) throw e;
    await sleep(2 ** attempt * 1000);
    return synthesizeOnce(text, voice, key, region, attempt + 1);
  }

  if (res.ok) return Buffer.from(await res.arrayBuffer());

  const retryable = res.status === 429 || res.status >= 500;
  if (retryable && attempt < MAX_ATTEMPTS) {
    const hinted = parseInt(res.headers.get('retry-after') || '', 10);
    const waitMs = Number.isFinite(hinted) ? hinted * 1000 : 2 ** attempt * 1000;
    if (res.status === 429) process.stdout.write(`\n  ⏳ rate-limited, waiting ${Math.round(waitMs / 1000)}s…`);
    await sleep(waitMs);
    return synthesizeOnce(text, voice, key, region, attempt + 1);
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
      const buf = await synthesize(it.text, voice, KEY, REGION);
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
