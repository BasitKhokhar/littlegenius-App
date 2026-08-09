// Numbers 1-100 Data with Urdu translations
import { numberToEnglish } from '../Utils/dataHelpers';

// Urdu numerals 1-100, in order. These are irregular (they are not composed
// from "twenty" + "one" the way English is — 21 is اکیس, not بیس ایک), so every
// one is spelled out rather than generated.
//
// ⚠️  NEEDS NATIVE-SPEAKER REVIEW — this is teaching content that children hear
//     and repeat. 1-20 are the original hand-checked values; 21-100 were added
//     with the audio pipeline and have not yet been verified by a native
//     speaker. Fixing a word here means re-running scripts/generateAudio.mjs
//     (the text change gives the clip a new speechKey).
const URDU_NUMBERS = [
  'ایک', 'دو', 'تین', 'چار', 'پانچ', 'چھ', 'سات', 'آٹھ', 'نو', 'دس',
  'گیارہ', 'بارہ', 'تیرہ', 'چودہ', 'پندرہ', 'سولہ', 'سترہ', 'اٹھارہ', 'انیس', 'بیس',
  'اکیس', 'بائیس', 'تئیس', 'چوبیس', 'پچیس', 'چھبیس', 'ستائیس', 'اٹھائیس', 'انتیس', 'تیس',
  'اکتیس', 'بتیس', 'تینتیس', 'چونتیس', 'پینتیس', 'چھتیس', 'سینتیس', 'اڑتیس', 'انتالیس', 'چالیس',
  'اکتالیس', 'بیالیس', 'تینتالیس', 'چوالیس', 'پینتالیس', 'چھیالیس', 'سینتالیس', 'اڑتالیس', 'انچاس', 'پچاس',
  'اکاون', 'باون', 'ترپن', 'چون', 'پچپن', 'چھپن', 'ستاون', 'اٹھاون', 'انسٹھ', 'ساٹھ',
  'اکسٹھ', 'باسٹھ', 'ترسٹھ', 'چونسٹھ', 'پینسٹھ', 'چھیاسٹھ', 'سڑسٹھ', 'اڑسٹھ', 'انہتر', 'ستر',
  'اکہتر', 'بہتر', 'تہتر', 'چوہتر', 'پچہتر', 'چھہتر', 'ستتر', 'اٹھہتر', 'اناسی', 'اسی',
  'اکیاسی', 'بیاسی', 'تراسی', 'چوراسی', 'پچاسی', 'چھیاسی', 'ستاسی', 'اٹھاسی', 'نواسی', 'نوے',
  'اکانوے', 'بانوے', 'ترانوے', 'چورانوے', 'پچانوے', 'چھیانوے', 'ستانوے', 'اٹھانوے', 'ننانوے', 'سو',
];

export const generateNumbersData = () => {
  const fruitEmojis = ['🍎', '⭐', '🍓', '🍉', '🎈', '🍩', '🍪', '🍭', '🧩', '🍊', '🍒', '🧸'];
  const colors = ['#F85A9B', '#FFAF3A', '#3EC38B', '#3C97F9', '#8A6FF0', '#FF6B5A', '#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B'];

  return Array.from({ length: 100 }, (_, i) => {
    const n = i + 1;
    const selectedFruit = fruitEmojis[i % fruitEmojis.length];
    const english = numberToEnglish(n);
    const urduNum = URDU_NUMBERS[i];

    return {
      number: n,
      english,
      urdu: urduNum,
      emoji: n <= 10 ? '⭐'.repeat(n) : `${selectedFruit} x${n}`,
      color: colors[i % colors.length],
      // Two clips played back-to-back, each in its own language, so the English
      // voice never has to read Urdu script (and vice versa). Keep these strings
      // EXACTLY in sync with scripts/collect.mjs — the text is the audio key.
      // Speak ONLY the English word (not "5. Five"): a leading numeral was voiced
      // as the number too, so the child heard the English number twice.
      speech: [
        { text: english, language: 'en-US' },
        { text: urduNum, language: 'ur-PK' },
      ],
      // One emoji per unit, all the way up to 100 — NumbersScreen shrinks the
      // glyph size as this array grows so the count section keeps fitting.
      objects: Array.from({ length: n }, () => selectedFruit),
    };
  });
};

export const numbersData = generateNumbersData();

export default numbersData;
