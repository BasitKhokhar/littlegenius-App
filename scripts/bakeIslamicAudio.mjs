#!/usr/bin/env node
// bakeIslamicAudio.mjs — BUILD-TIME generation of Arabic audio for the fixed
// Islamic content (duas, kalmas, namaz recitations, 99 Names of Allah, 99 Names
// of the Prophet ﷺ) using a FREE text-to-speech source (no API key).
//
// Device TTS mispronounces Arabic and often gets stuck / silent, so we bake a
// clear, correctly-pronounced Arabic clip per phrase once, bundle it, and play
// it offline. The clips are named by speechKey() and written into the SAME
// assets/audio/{teacher,kid} folders the app already looks up via lookupClip(),
// so NO screen wiring is needed — after this runs, rebuild the manifest with:
//     node scripts/generateAudio.mjs --manifest-only
//
// Quran recitation is handled separately by real Qari audio
// (scripts/downloadQuranAudio.mjs) — this covers only the non-Quran Arabic.
//
// This runs on a developer machine, NOT in the app. Nothing here ships except
// the resulting MP3s + manifest.
//
// Usage:  node scripts/bakeIslamicAudio.mjs
//         node scripts/bakeIslamicAudio.mjs --check   # probe one phrase only
//
// Prereq: Node 18+ (global fetch), internet access.
import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { speechKey } from '../src/Utils/speechKey.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const AUDIO_DIR = path.join(ROOT, 'assets', 'audio');
// The app has ONE voice, so there is one clip folder. (Earlier versions wrote
// the same bytes to a second "kid" folder; that made the persona switch a no-op
// and is why the folder is gone.)
const VOICE_DIR = 'teacher';

// Only these sources, and only their Arabic (ar) lines. alphabet/numbers/urdu
// deliberately stay on device TTS.
const SOURCES = new Set(['duas', 'kalmas', 'namaz', 'namesAllah', 'namesMuhammad']);

const args = process.argv.slice(2);
const CHECK = args.includes('--check');

// Free Google Translate TTS endpoint. ~200-char limit per request, so long
// phrases are split at word boundaries and the MP3 chunks concatenated (the
// clips have no ID3 header — they start on an MPEG frame sync — so a plain byte
// concat plays cleanly).
const ttsUrl = (text) =>
  `https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=ar&client=gtx&q=${encodeURIComponent(text)}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Split into <=180-char chunks without breaking words.
function chunk(text, max = 180) {
  const words = text.split(/\s+/);
  const out = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) {
      if (cur) out.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) out.push(cur.trim());
  return out.length ? out : [text];
}

async function fetchMp3(text, tries = 4) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(ttsUrl(text), {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 256) throw new Error(`too small (${buf.length}b)`);
      return buf;
    } catch (e) {
      lastErr = e;
      await sleep(500 * (i + 1)); // back off on rate limits
    }
  }
  throw lastErr;
}

async function synthesize(text) {
  const parts = [];
  for (const c of chunk(text)) {
    parts.push(await fetchMp3(c));
    await sleep(150); // be gentle on the free endpoint
  }
  return Buffer.concat(parts);
}

async function loadPairs() {
  const outfile = path.join(os.tmpdir(), `lg-collect-${Date.now()}.mjs`);
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'collect.mjs')],
    bundle: true, format: 'esm', platform: 'node', outfile, logLevel: 'silent',
  });
  const mod = await import(pathToFileURL(outfile).href);
  fs.rmSync(outfile, { force: true });
  return mod.collectPairs();
}

async function main() {
  if (CHECK) {
    const buf = await synthesize('بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ');
    console.log(`✔ TTS reachable — sample clip ${buf.length} bytes`);
    return;
  }

  const raw = await loadPairs();
  // Keep only the Islamic sources' Arabic lines, deduped by speechKey.
  const byKey = new Map();
  for (const p of raw) {
    if (!SOURCES.has(p.source)) continue;
    if (!`${p.language}`.toLowerCase().startsWith('ar')) continue;
    const key = speechKey(p.language, p.text);
    if (!byKey.has(key)) byKey.set(key, { key, text: p.text, source: p.source });
  }
  const items = [...byKey.values()];
  console.log(`Baking ${items.length} unique Arabic clips (free Google TTS)…`);

  fs.mkdirSync(path.join(AUDIO_DIR, VOICE_DIR), { recursive: true });

  let made = 0, skipped = 0, failed = 0, bytes = 0;
  const failures = [];
  for (const it of items) {
    const outPath = path.join(AUDIO_DIR, VOICE_DIR, `${it.key}.mp3`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 256) {
      skipped++;
      continue;
    }
    try {
      const buf = await synthesize(it.text);
      fs.writeFileSync(outPath, buf);
      made++;
      bytes += buf.length;
      if (made % 20 === 0) console.log(`  …${made} baked`);
    } catch (e) {
      failed++;
      failures.push(`${it.source} "${it.text.slice(0, 20)}…": ${e.message}`);
    }
  }

  console.log(`\nDone. baked=${made} skipped=${skipped} failed=${failed}`);
  console.log(`Size: ${(bytes / 1024 / 1024).toFixed(2)} MB`);
  if (failures.length) {
    console.warn('\nFailures (re-run to retry — it skips finished clips):');
    for (const f of failures) console.warn('  ✖ ' + f);
  }
  console.log('\nNext: node scripts/generateAudio.mjs --manifest-only');
}

main().catch((e) => { console.error(e); process.exit(1); });
