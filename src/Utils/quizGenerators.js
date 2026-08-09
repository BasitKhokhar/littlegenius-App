import { alphabetData } from '../Data/alphabetData';
import { urduData } from '../Data/urduData';
import { numbersData } from '../Data/numbersData';
import { duasData, kalmasData, pillarsData, namesOfAllahData, nationalSymbols, provinces } from '../Data';
import { numberToEnglish, shuffleArray } from './dataHelpers';

const pickWrong = (pool, correct, count = 3) =>
  shuffleArray(pool.filter((item) => item !== correct)).slice(0, count);

// ── Spoken question text ────────────────────────────────────────────────────
// Every question carries `speech: { text, language }` next to its displayed `q`.
//
// WHY a separate field instead of stripping emoji at speak time: the spoken
// string is hashed by speechKey() BOTH here (when scripts/collect.mjs bakes the
// clip) and in the app (when it looks the clip up). If the two ever transform
// the text differently the clip is generated but never found, and the app
// silently drops to robotic device TTS. Storing the final spoken string in the
// data layer means there is exactly one string and no transform to get wrong.
//
// The emoji is dropped because Azure can't pronounce it — and it loses nothing:
// the child SEES the emoji on screen while hearing "Which word matches this
// emoji?". A pleasant side effect is that questions differing only by emoji
// collapse to one clip.
const EMOJI = /[\p{Extended_Pictographic}\p{Emoji_Presentation}\u{FE0F}\u{200D}]/gu;

const speech = (text, language) => ({
  text: `${text}`.replace(EMOJI, '').replace(/\s+/g, ' ').trim(),
  language,
});
const speakEn = (text) => speech(text, 'en-US');
const speakUr = (text) => speech(text, 'ur-PK');

const allAlphabetLetters = () => alphabetData.map((d) => d.letter);
const allAlphabetWords = () => alphabetData.flatMap((d) => d.vocabulary.map((v) => v.word));

export const generateAlphabetLetterMatchBank = () => {
  const letters = allAlphabetLetters();
  const questions = [];
  alphabetData.forEach(({ letter, vocabulary }) => {
    vocabulary.forEach(({ word, emoji }) => {
      questions.push({
        q: `Which letter is for ${word}? ${emoji}`,
        speech: speakEn(`Which letter is for ${word}?`),
        options: [letter, ...pickWrong(letters, letter)],
        answer: letter,
      });
    });
  });
  return questions;
};

export const generateAlphabetWordMatchBank = () => {
  const words = allAlphabetWords();
  const questions = [];
  alphabetData.forEach(({ letter, vocabulary }) => {
    vocabulary.forEach(({ word, emoji }) => {
      questions.push({
        q: `What word starts with the letter ${letter}? ${emoji}`,
        speech: speakEn(`What word starts with the letter ${letter}?`),
        options: [word, ...pickWrong(words, word)],
        answer: word,
      });
    });
  });
  return questions;
};

export const generateAlphabetEmojiBank = () => {
  const words = allAlphabetWords();
  const questions = [];
  alphabetData.forEach(({ letter, vocabulary }) => {
    vocabulary.forEach(({ word, emoji }) => {
      questions.push({
        q: `Which word matches this emoji? ${emoji}`,
        speech: speakEn('Which word matches this emoji?'),
        options: [word, ...pickWrong(words, word)],
        answer: word,
      });
      questions.push({
        q: `Which letter goes with ${emoji}?`,
        speech: speakEn('Which letter goes with this emoji?'),
        options: [letter, ...pickWrong(allAlphabetLetters(), letter)],
        answer: letter,
      });
    });
  });
  return questions;
};

export const generateAlphabetCategoryBank = () => {
  const categories = [...new Set(alphabetData.flatMap((d) => d.vocabulary.map((v) => v.category)))];
  const questions = [];
  alphabetData.forEach(({ vocabulary }) => {
    vocabulary.forEach(({ word, category, emoji }) => {
      questions.push({
        q: `What category is ${word}? ${emoji}`,
        speech: speakEn(`What category is ${word}?`),
        options: [category, ...pickWrong(categories, category)],
        answer: category,
      });
    });
  });
  return questions;
};

export const generateAlphabetMixedBank = () => [
  ...generateAlphabetLetterMatchBank(),
  ...generateAlphabetWordMatchBank(),
  ...generateAlphabetEmojiBank(),
];

const allUrduLetters = () => urduData.map((d) => d.letter);
const allUrduNames = () => urduData.map((d) => d.name);
const allUrduWords = () => urduData.flatMap((d) => d.vocabulary.map((v) => v.word));
const allUrduMeanings = () => urduData.flatMap((d) => d.vocabulary.map((v) => v.meaning));

export const generateUrduHarfMatchBank = () => {
  const letters = allUrduLetters();
  const questions = [];
  urduData.forEach(({ letter, vocabulary }) => {
    vocabulary.forEach(({ word, emoji }) => {
      questions.push({
        q: `کس حرف سے ${word} شروع ہوتا ہے؟ ${emoji}`,
        speech: speakUr(`کس حرف سے ${word} شروع ہوتا ہے؟`),
        options: [letter, ...pickWrong(letters, letter)],
        answer: letter,
        answerLanguage: 'ur-PK',
      });
    });
  });
  return questions;
};

export const generateUrduWordMatchBank = () => {
  const words = allUrduWords();
  const questions = [];
  urduData.forEach(({ letter, vocabulary }) => {
    vocabulary.forEach(({ word, emoji }) => {
      questions.push({
        q: `حرف ${letter} سے کون سا لفظ شروع ہوتا ہے؟ ${emoji}`,
        speech: speakUr(`حرف ${letter} سے کون سا لفظ شروع ہوتا ہے؟`),
        options: [word, ...pickWrong(words, word)],
        answer: word,
        answerLanguage: 'ur-PK',
      });
    });
  });
  return questions;
};

export const generateUrduMeaningBank = () => {
  const meanings = allUrduMeanings();
  const questions = [];
  urduData.forEach(({ vocabulary }) => {
    vocabulary.forEach(({ word, meaning, emoji }) => {
      questions.push({
        q: `${word} کا مطلب کیا ہے؟ ${emoji}`,
        speech: speakUr(`${word} کا مطلب کیا ہے؟`),
        options: [meaning, ...pickWrong(meanings, meaning)],
        answer: meaning,
      });
    });
  });
  return questions;
};

export const generateUrduNameBank = () => {
  const names = allUrduNames();
  const questions = [];
  urduData.forEach(({ letter, name }) => {
    questions.push({
      q: `حرف ${letter} کا نام کیا ہے؟`,
      speech: speakUr(`حرف ${letter} کا نام کیا ہے؟`),
      options: [name, ...pickWrong(names, name)],
      answer: name,
    });
  });
  return questions;
};

export const generateUrduMixedBank = () => [
  ...generateUrduHarfMatchBank(),
  ...generateUrduWordMatchBank(),
  ...generateUrduMeaningBank(),
  ...generateUrduNameBank(),
];

export const generateNumbersDigitToEnglishBank = () => {
  const englishNames = numbersData.map((n) => n.english);
  return numbersData.map((item) => ({
    q: `What is the number ${item.number} in English? ${item.emoji}`,
    speech: speakEn(`What is the number ${item.number} in English?`),
    options: [item.english, ...pickWrong(englishNames, item.english)],
    answer: item.english,
  }));
};

export const generateNumbersDigitToUrduBank = () => {
  const urduNames = numbersData.map((n) => n.urdu);
  return numbersData.map((item) => ({
    q: `نمبر ${item.number} اردو میں کیا ہے؟ ${item.emoji}`,
    speech: speakUr(`نمبر ${item.number} اردو میں کیا ہے؟`),
    options: [item.urdu, ...pickWrong(urduNames, item.urdu)],
    answer: item.urdu,
  }));
};

export const generateNumbersEnglishToDigitBank = () => {
  const digits = numbersData.map((n) => String(n.number));
  return numbersData.map((item) => ({
    q: `Which number is "${item.english}"?`,
    speech: speakEn(`Which number is ${item.english}?`),
    options: [String(item.number), ...pickWrong(digits, String(item.number))],
    answer: String(item.number),
  }));
};

export const generateNumbersUrduToDigitBank = () => {
  const digits = numbersData.map((n) => String(n.number));
  return numbersData.map((item) => ({
    q: `"${item.urdu}" کون سا نمبر ہے؟`,
    speech: speakUr(`${item.urdu} کون سا نمبر ہے؟`),
    options: [String(item.number), ...pickWrong(digits, String(item.number))],
    answer: String(item.number),
  }));
};

export const generateNumbersCountingBank = () =>
  numbersData
    .filter((item) => item.number <= 20)
    .map((item) => ({
      q: `How many ${item.objects[0] || item.emoji} are shown for number ${item.number}?`,
      // The emoji IS the subject here ("How many 🍎 are shown…"), so spoken
      // aloud it has to become a generic noun rather than vanish.
      speech: speakEn(`How many objects are shown for number ${item.number}?`),
      options: [
        String(item.number),
        ...pickWrong(
          numbersData.filter((n) => n.number <= 20).map((n) => String(n.number)),
          String(item.number)
        ),
      ],
      answer: String(item.number),
    }));

export const generateNumbersMixedBank = () => [
  ...generateNumbersDigitToEnglishBank(),
  ...generateNumbersDigitToUrduBank(),
  ...generateNumbersEnglishToDigitBank(),
  ...generateNumbersUrduToDigitBank(),
];

export const generateIslamicDuaBank = () => {
  const titles = duasData.map((d) => d.title);
  const english = duasData.map((d) => d.english);
  const urdu = duasData.map((d) => d.urdu);
  const transliteration = duasData.map((d) => d.transliteration);
  const questions = [];

  duasData.forEach((dua) => {
    questions.push({
      q: `When do we say this dua? ${dua.emoji}`,
      speech: speakEn('When do we say this dua?'),
      options: [dua.title, ...pickWrong(titles, dua.title)],
      answer: dua.title,
    });
    questions.push({
      q: `What does "${dua.title}" mean? ${dua.emoji}`,
      speech: speakEn(`What does ${dua.title} mean?`),
      options: [dua.english, ...pickWrong(english, dua.english)],
      answer: dua.english,
    });
    questions.push({
      q: `What is the Urdu meaning of "${dua.title}"? ${dua.emoji}`,
      speech: speakEn(`What is the Urdu meaning of ${dua.title}?`),
      options: [dua.urdu, ...pickWrong(urdu, dua.urdu)],
      answer: dua.urdu,
      answerLanguage: 'ur-PK',
    });
    questions.push({
      q: `Which dua starts with "${dua.transliteration.split(' ').slice(0, 2).join(' ')}"...? ${dua.emoji}`,
      speech: speakEn(`Which dua starts with ${dua.transliteration.split(' ').slice(0, 2).join(' ')}?`),
      options: [dua.title, ...pickWrong(titles, dua.title)],
      answer: dua.title,
    });
  });
  return questions;
};

export const generateIslamicKalmaBank = () => {
  const titles = kalmasData.map((k) => k.title);
  const numbers = kalmasData.map((k) => String(k.number));
  const questions = [];

  kalmasData.forEach((kalma) => {
    questions.push({
      q: `Which Kalma is number ${kalma.number}?`,
      speech: speakEn(`Which Kalma is number ${kalma.number}?`),
      options: [kalma.title, ...pickWrong(titles, kalma.title)],
      answer: kalma.title,
    });
    questions.push({
      q: `What is Kalma ${kalma.number}?`,
      speech: speakEn(`What is Kalma ${kalma.number}?`),
      options: [String(kalma.number), ...pickWrong(numbers, String(kalma.number))],
      answer: String(kalma.number),
    });
  });
  return questions;
};

export const generateIslamicPillarBank = () => {
  const titles = pillarsData.map((p) => p.title);
  const urdu = pillarsData.map((p) => p.urdu);
  const desc = pillarsData.map((p) => p.desc);
  const numbers = pillarsData.map((p) => String(p.number));
  const questions = [];

  pillarsData.forEach((pillar) => {
    questions.push({
      q: `Which pillar is "${pillar.urdu}"? ${pillar.emoji}`,
      speech: speakEn(`Which pillar is ${pillar.urdu}?`),
      options: [pillar.title, ...pickWrong(titles, pillar.title)],
      answer: pillar.title,
    });
    questions.push({
      q: `What is ${pillar.title} in Urdu? ${pillar.emoji}`,
      speech: speakEn(`What is ${pillar.title} in Urdu?`),
      options: [pillar.urdu, ...pickWrong(urdu, pillar.urdu)],
      answer: pillar.urdu,
      answerLanguage: 'ur-PK',
    });
    questions.push({
      q: `What does ${pillar.title} mean? ${pillar.emoji}`,
      speech: speakEn(`What does ${pillar.title} mean?`),
      options: [pillar.desc, ...pickWrong(desc, pillar.desc)],
      answer: pillar.desc,
    });
    questions.push({
      q: `Which number is the pillar "${pillar.title}"? ${pillar.emoji}`,
      speech: speakEn(`Which number is the pillar ${pillar.title}?`),
      options: [String(pillar.number), ...pickWrong(numbers, String(pillar.number))],
      answer: String(pillar.number),
    });
  });
  return questions;
};

export const generateIslamicNamesBank = () => {
  const english = namesOfAllahData.map((n) => n.english);
  const translit = namesOfAllahData.map((n) => n.transliteration);
  const questions = [];

  namesOfAllahData.forEach((name) => {
    questions.push({
      q: `What does "${name.transliteration}" mean?`,
      speech: speakEn(`What does ${name.transliteration} mean?`),
      options: [name.english, ...pickWrong(english, name.english)],
      answer: name.english,
    });
    questions.push({
      q: `Which name of Allah means "${name.english}"?`,
      speech: speakEn(`Which name of Allah means ${name.english}?`),
      options: [name.transliteration, ...pickWrong(translit, name.transliteration)],
      answer: name.transliteration,
    });
  });
  return questions;
};

export const generateIslamicMixedBank = () => [
  ...generateIslamicDuaBank(),
  ...generateIslamicKalmaBank(),
  ...generateIslamicPillarBank(),
  ...generateIslamicNamesBank(),
];

export const generatePakistanSymbolsBank = () => {
  const values = nationalSymbols.map((s) => s.value);
  return nationalSymbols.map((item) => ({
    q: `What is the ${item.title.replace(/\s*\(.*\)/, '')} of Pakistan? ${item.emoji}`,
    speech: speakEn(`What is the ${item.title.replace(/\s*\(.*\)/, '')} of Pakistan?`),
    options: [item.value, ...pickWrong(values, item.value)],
    answer: item.value,
  }));
};

export const generatePakistanProvinceBank = () => {
  const capitals = provinces.map((p) => p.capital);
  const names = provinces.map((p) => p.name);
  const questions = [];
  provinces.forEach((p) => {
    questions.push({
      q: `What is the capital of ${p.name}? ${p.emoji}`,
      speech: speakEn(`What is the capital of ${p.name}?`),
      options: [p.capital, ...pickWrong(capitals, p.capital)],
      answer: p.capital,
    });
    questions.push({
      q: `Which province has the capital ${p.capital}? ${p.emoji}`,
      speech: speakEn(`Which province has the capital ${p.capital}?`),
      options: [p.name, ...pickWrong(names, p.name)],
      answer: p.name,
    });
  });
  return questions;
};

export const generatePakistanMixedBank = () => [
  ...generatePakistanSymbolsBank(),
  ...generatePakistanProvinceBank(),
];

const bankGenerators = {
  alphabetLetterMatch: generateAlphabetLetterMatchBank,
  alphabetWordMatch: generateAlphabetWordMatchBank,
  alphabetEmoji: generateAlphabetEmojiBank,
  alphabetCategory: generateAlphabetCategoryBank,
  alphabetMixed: generateAlphabetMixedBank,
  urduHarfMatch: generateUrduHarfMatchBank,
  urduWordMatch: generateUrduWordMatchBank,
  urduMeaning: generateUrduMeaningBank,
  urduName: generateUrduNameBank,
  urduMixed: generateUrduMixedBank,
  numbersDigitEnglish: generateNumbersDigitToEnglishBank,
  numbersDigitUrdu: generateNumbersDigitToUrduBank,
  numbersEnglishDigit: generateNumbersEnglishToDigitBank,
  numbersUrduDigit: generateNumbersUrduToDigitBank,
  numbersCounting: generateNumbersCountingBank,
  numbersMixed: generateNumbersMixedBank,
  islamicDua: generateIslamicDuaBank,
  islamicKalma: generateIslamicKalmaBank,
  islamicPillar: generateIslamicPillarBank,
  islamicNames: generateIslamicNamesBank,
  islamicMixed: generateIslamicMixedBank,
  pakistanSymbols: generatePakistanSymbolsBank,
  pakistanProvince: generatePakistanProvinceBank,
  pakistanMixed: generatePakistanMixedBank,
};

export const getQuizBank = (bankKey) => {
  const generator = bankGenerators[bankKey];
  return generator ? generator() : [];
};

// Which banks are Islamic. scripts/collect.mjs reads this so the audio pipeline
// can leave Islamic content alone without hard-coding a second copy of the list
// that would silently rot as banks are added.
export const ISLAMIC_BANKS = [
  'islamicDua', 'islamicKalma', 'islamicPillar', 'islamicNames', 'islamicMixed',
];

// The "*Mixed" banks are just concatenations of the others, so collecting them
// would re-walk questions we already have. Enumerating the base banks alone
// covers every distinct question the app can ask.
export const BASE_BANKS = Object.keys(bankGenerators).filter(
  (k) => !k.endsWith('Mixed') && !ISLAMIC_BANKS.includes(k),
);

export default {
  getQuizBank,
  bankGenerators,
  ISLAMIC_BANKS,
  BASE_BANKS,
};
