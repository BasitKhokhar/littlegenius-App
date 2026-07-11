// collect.mjs — the SINGLE source of truth for "every fixed string the app can
// speak, and the language it's spoken in". The audio generator bundles this
// (via esbuild, so the ESM data files load under Node) and calls collectPairs().
//
// ⚠️  Each extractor below MUST mirror the matching screen's SpeechEngine.speak()
//     / <SpeakButton> call — same field, same language code. If you change what
//     a screen speaks, update the extractor here and re-run the generator.
//     (A miss is not fatal: an un-generated string simply falls back to device
//     TTS at runtime — but you lose the premium voice for it.)

import * as numbersMod from '../src/Data/numbersData.js';
import * as alphabetMod from '../src/Data/alphabetData.js';
import * as urduMod from '../src/Data/urduData.js';
import * as duasMod from '../src/Data/duasData.js';
import * as kalmasMod from '../src/Data/kalmasData.js';
import * as namesAllahMod from '../src/Data/namesOfAllahData.js';
import * as namesMuhammadMod from '../src/Data/namesOfMuhammadData.js';
import * as prophetsMod from '../src/Data/prophetsData.js';
import * as mannersMod from '../src/Data/mannersData.js';
import * as namazMod from '../src/Data/namazGuideData.js';
import * as juzAmmaMod from '../src/Data/juzAmmaData.js';
import * as pakistanMod from '../src/Data/pakistanData.js';
import * as learnMod from '../src/Data/learnModulesData.js';
import * as storiesMod from '../src/Data/storiesData.js';
import * as islamicStoriesMod from '../src/Data/islamicStoriesData.js';
import { SPEECH_PHRASE_LIST } from '../src/Data/speechCatalog.js';

// Resolve a dataset whether it's a named or default export.
const pick = (mod, name) => mod[name] ?? mod.default;

export function collectPairs() {
  const out = [];
  const add = (language, text, source) => {
    const t = `${text ?? ''}`.trim();
    if (t) out.push({ language, text: t, source });
  };

  // Numbers 1–100 — NumbersScreen speaks item.speak (en). numbersData.js:32
  for (const n of pick(numbersMod, 'numbersData') || []) add('en-US', n.speak, 'numbers');

  // English alphabet vocabulary — VocabularyCard speaks word (en). VocabularyCard.jsx:51
  for (const l of pick(alphabetMod, 'alphabetData') || [])
    for (const v of l.vocabulary || []) add('en-US', v.word, 'alphabet');

  // Urdu haroof vocabulary — UrduScreen speaks the romanized `speak` under ur. UrduScreen.jsx:62
  for (const l of pick(urduMod, 'urduData') || [])
    for (const v of l.vocabulary || []) add('ur-PK', v.speak, 'urdu');

  // Duas / Kalmas — IslamicScreen speaks the Arabic. IslamicScreen.jsx:61,112
  for (const d of pick(duasMod, 'duasData') || []) add('ar-SA', d.arabic, 'duas');
  for (const k of pick(kalmasMod, 'kalmasData') || []) add('ar-SA', k.arabic, 'kalmas');

  // 99 Names / Names of Muhammad — spoken via transliteration (en). IslamicScreen.jsx:148,165
  for (const n of pick(namesAllahMod, 'namesOfAllahData') || []) add('en-US', n.transliteration, 'namesAllah');
  for (const n of pick(namesMuhammadMod, 'namesOfMuhammadData') || []) add('en-US', n.transliteration, 'namesMuhammad');

  // Prophets / Manners — spoken via `speak` (en). IslamicScreen.jsx:183,199
  for (const p of pick(prophetsMod, 'prophetsData') || []) add('en-US', p.speak, 'prophets');
  for (const m of pick(mannersMod, 'mannersData') || []) add('en-US', m.speak, 'manners');

  // Namaz guide — Arabic recitation (ar) + Urdu instruction (ur). NamazGuideScreen.jsx:82,91
  for (const s of pick(namazMod, 'namazGuideData') || []) {
    add('ar-SA', s.arabic, 'namaz');
    add('ur-PK', s.urduInstruction, 'namaz');
  }

  // Juz Amma — each ayah's Arabic (ar). SurahScreen.jsx:48
  for (const surah of pick(juzAmmaMod, 'juzAmmaData') || [])
    for (const a of surah.ayahs || []) add('ar-SA', a.arabic, 'juzAmma');

  // Pakistan GK — every section's item.speak (en). PakistanScreen.jsx:71-118
  const pk = pick(pakistanMod, 'pakistanData') || {};
  for (const section of Object.values(pk))
    for (const item of section || []) add('en-US', item.speak, 'pakistan');

  // Learn modules — LearnScreen speaks item.speak || `${en}. ${fact}` (en). LearnScreen.jsx:89
  const learn = pick(learnMod, 'learnModules') || pick(learnMod, 'default') || {};
  for (const mod of Object.values(learn))
    for (const tab of mod.tabs || [])
      for (const item of tab.items || [])
        add('en-US', item.speak || `${item.en}. ${item.fact}`, 'learn');

  // Stories (moral + Islamic) — "Read Aloud" speaks page.text (en). StoriesScreen.jsx:68
  for (const story of pick(storiesMod, 'storiesData') || [])
    for (const page of story.pages || []) add('en-US', page.text, 'stories');
  for (const story of pick(islamicStoriesMod, 'islamicStoriesData') || [])
    for (const page of story.pages || []) add('en-US', page.text, 'islamicStories');

  // Fixed UI / feedback phrases (game intros, praise, voice previews) — all en.
  for (const p of SPEECH_PHRASE_LIST) add(p.language, p.text, 'catalog');

  return out;
}

export default collectPairs;
