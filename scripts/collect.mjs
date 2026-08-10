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
import * as pillarsMod from '../src/Data/pillarsData.js';
import * as wuduSalahMod from '../src/Data/wuduSalahData.js';
import * as tasbeehMod from '../src/Data/tasbeehData.js';
import * as namazMod from '../src/Data/namazGuideData.js';
import * as juzAmmaMod from '../src/Data/juzAmmaData.js';
import * as pakistanMod from '../src/Data/pakistanData.js';
import * as learnMod from '../src/Data/learnModulesData.js';
import * as storiesMod from '../src/Data/storiesData.js';
import * as islamicStoriesMod from '../src/Data/islamicStoriesData.js';
import * as gamesMod from '../src/Data/gamesData.js';
import { SPEECH_PHRASE_LIST } from '../src/Data/speechCatalog.js';
import { getQuizBank, BASE_BANKS } from '../src/Utils/quizGenerators.js';

// Resolve a dataset whether it's a named or default export.
const pick = (mod, name) => mod[name] ?? mod.default;

export function collectPairs() {
  const out = [];
  const add = (language, text, source) => {
    const t = `${text ?? ''}`.trim();
    if (t) out.push({ language, text: t, source });
  };

  // Numbers 1–100 — NumbersScreen plays item.speech as a two-step sequence:
  // the English name, then the Urdu one, each in its own voice. NumbersScreen.jsx:114
  for (const n of pick(numbersMod, 'numbersData') || [])
    for (const s of n.speech || []) add(s.language, s.text, 'numbers');

  // English alphabet vocabulary — VocabularyCard speaks word (en). VocabularyCard.jsx:51
  for (const l of pick(alphabetMod, 'alphabetData') || [])
    for (const v of l.vocabulary || []) add('en-US', v.word, 'alphabet');

  // English alphabet LETTERS — AlphabetScreen hero speaks letter.letter (en).
  // AlphabetScreen.jsx (hero SpeakButton).
  for (const l of pick(alphabetMod, 'alphabetData') || []) add('en-US', l.letter, 'alphabetLetters');

  // English alphabet vocabulary PHRASES — VocabularyTile speaks "{Letter} for {Word}" on
  // the Alphabet screen word grid (teaches the letter-sound link, not just the bare word).
  // AlphabetScreen.jsx wordRows -> VocabularyTile speakText.
  for (const l of pick(alphabetMod, 'alphabetData') || [])
    for (const v of l.vocabulary || []) add('en-US', `${l.letter} for ${v.word}`, 'alphabetVocabPhrase');

  // Urdu haroof vocabulary — UrduScreen speaks the Urdu word itself under ur.
  // (NOT v.speak: that romanization is only the no-voice-pack fallback, and an
  // Urdu neural voice mispronounces Latin text.) UrduScreen.jsx:66
  for (const l of pick(urduMod, 'urduData') || [])
    for (const v of l.vocabulary || []) add('ur-PK', v.word, 'urdu');

  // Urdu LETTERS — UrduScreen letter card speaks the letter glyph under ur.
  // (romanized name is only the no-voice-pack fallbackText.) UrduScreen.jsx.
  for (const l of pick(urduMod, 'urduData') || []) add('ur-PK', l.letter, 'urduLetters');

  // Urdu haroof vocabulary PHRASES — UrduScreen speaks "{letter} سے {word}" on the word
  // grid, the qaida-style "Alif se Anaar" pattern (teaches the letter-sound link).
  // UrduScreen.jsx wordRows -> VocabularyTile speakText.
  for (const l of pick(urduMod, 'urduData') || [])
    for (const v of l.vocabulary || []) add('ur-PK', `${l.letter} سے ${v.word}`, 'urduVocabPhrase');

  // Duas / Kalmas — IslamicCard now carries TWO speakers per card: the Arabic
  // panel (ar) and the Urdu translation block (ur). IslamicScreen.jsx duas/kalmas tabs.
  // A few duas carry `arabicSpeak`: the same text spelled with a wasla (ٱ) so
  // the voice elides across the word break ("yarhamukallah", not "yarhamuka
  // Allah"). The card displays `arabic` but speaks this — mirror that here.
  for (const d of pick(duasMod, 'duasData') || []) {
    add('ar-SA', d.arabicSpeak || d.arabic, 'duas');
    add('ur-PK', d.urdu, 'duas');
  }
  for (const k of pick(kalmasMod, 'kalmasData') || []) {
    add('ar-SA', k.arabic, 'kalmas');
    add('ur-PK', k.urdu, 'kalmas');
  }

  // 99 Names / Names of Muhammad — Arabic name (ar) on the scripture panel,
  // Urdu meaning (ur) on the translation block. IslamicScreen.jsx names tabs.
  for (const n of pick(namesAllahMod, 'namesOfAllahData') || []) {
    add('ar-SA', n.arabic, 'namesAllah');
    add('ur-PK', n.urdu, 'namesAllah');
  }
  for (const n of pick(namesMuhammadMod, 'namesOfMuhammadData') || []) {
    add('ar-SA', n.arabic, 'namesMuhammad');
    add('ur-PK', n.urdu, 'namesMuhammad');
  }

  // Five Pillars — English detail on the foot pill, Urdu detail on the Urdu
  // block. IslamicScreen.jsx pillars tab.
  for (const p of pick(pillarsMod, 'pillarsData') || []) {
    add('en-US', p.detailedDesc, 'pillars');
    add('ur-PK', p.urduDetail, 'pillars');
  }

  // Prophets / Manners — English `speak` on the foot pill, Urdu story/tip on
  // the Urdu block. IslamicScreen.jsx prophets/manners tabs.
  for (const p of pick(prophetsMod, 'prophetsData') || []) {
    add('en-US', p.speak, 'prophets');
    add('ur-PK', p.urduStory, 'prophets');
  }
  for (const m of pick(mannersMod, 'mannersData') || []) {
    add('en-US', m.speak, 'manners');
    add('ur-PK', m.urduTip, 'manners');
  }

  // Tasbeeh dhikr — the counter card speaks the Arabic dhikr (ar) and its Urdu
  // meaning (ur). TasbeehScreen.jsx dhikr card.
  for (const d of pick(tasbeehMod, 'tasbeehData') || []) {
    add('ar-SA', d.arabic, 'tasbeeh');
    add('ur-PK', d.urdu, 'tasbeeh');
  }

  // Wudu & Salah steps — the card speaks step.detail (en) and step.urduDetail
  // (ur). IslamicScreen.jsx salah tab.
  for (const list of ['wuduSteps', 'salahSteps'])
    for (const s of wuduSalahMod[list] || []) {
      add('en-US', s.detail, 'wuduSalah');
      add('ur-PK', s.urduDetail, 'wuduSalah');
    }

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
  // StoryQuizScreen speaks each comprehension question verbatim (en).
  // StoryQuizScreen.jsx:39 — these are plain prose with no emoji, so the text is
  // taken as-is and needs no transform.
  for (const story of pick(storiesMod, 'storiesData') || []) {
    for (const page of story.pages || []) add('en-US', page.text, 'stories');
    for (const q of story.quiz || []) add('en-US', q.q, 'storyQuiz');
  }
  for (const story of pick(islamicStoriesMod, 'islamicStoriesData') || []) {
    for (const page of story.pages || []) add('en-US', page.text, 'islamicStories');
    for (const q of story.quiz || []) add('en-US', q.q, 'islamicStories');
  }

  // Story-quiz ANSWERS — on a wrong answer StoryQuizScreen speaks the correct
  // option text as its own clip (after the "Not quite!" lead-in). Bake every
  // correct option so it stays in the teacher voice. StoryQuizScreen.jsx.
  for (const story of pick(storiesMod, 'storiesData') || [])
    for (const q of story.quiz || []) add('en-US', (q.options || [])[q.answer], 'storyQuizAnswers');
  for (const story of pick(islamicStoriesMod, 'islamicStoriesData') || [])
    for (const q of story.quiz || []) add('en-US', (q.options || [])[q.answer], 'storyQuizAnswers');

  // Odd-One-Out explanations — GamePlayScreen speaks `Excellent! ${explain}`
  // verbatim on a correct pick. Mirror the composed string EXACTLY so the key
  // matches. GamePlayScreen.jsx:316.
  for (const o of pick(gamesMod, 'oddOneOutData') || []) add('en-US', `Excellent! ${o.explain}`, 'games');

  // Fixed UI / feedback phrases (game intros, praise, voice previews) — all en.
  for (const p of SPEECH_PHRASE_LIST) add(p.language, p.text, 'catalog');

  // Quiz questions — ModuleQuizScreen speaks question.speech when the question
  // changes. The banks are generated from the curriculum data, so the QUESTION
  // text is deterministic (only the wrong options are shuffled) and can be
  // enumerated here. BASE_BANKS now includes the Islamic quiz banks too.
  //
  // `speech.text` is taken verbatim — quizGenerators.js has already stripped the
  // emoji. Do not transform it here or the key won't match what the app asks for.
  for (const bank of BASE_BANKS)
    for (const q of getQuizBank(bank))
      if (q.speech) add(q.speech.language, q.speech.text, 'quiz');

  // Quiz ANSWERS — on a wrong answer ModuleQuizScreen speaks the correct answer
  // word as its own clip (after the "Not quite!" lead-in), so bake every answer.
  // ModuleQuizScreen.jsx handleAnswer.
  for (const bank of BASE_BANKS)
    for (const q of getQuizBank(bank))
      add(q.answerLanguage || 'en-US', `${q.answer ?? ''}`, 'quizAnswers');

  return out;
}

export default collectPairs;
