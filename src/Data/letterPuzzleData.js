// ──────────────────────────────────────────────────────────────
// Letter Puzzle — "find the missing letter" rounds (F_SH → I),
// generated from the alphabet vocabulary so every round has a word
// with a friendly emoji illustration.
// ──────────────────────────────────────────────────────────────
import { alphabetData } from './alphabetData';
import { shuffleArray } from '../Utils/dataHelpers';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Words 3-6 letters long work best as tap-to-fill tiles.
const buildWordPool = () =>
  alphabetData.flatMap((entry) =>
    entry.vocabulary
      .filter((v) => /^[A-Za-z]+$/.test(v.word) && v.word.length >= 3 && v.word.length <= 6)
      .map((v) => ({ word: v.word.toUpperCase(), emoji: v.emoji }))
  );

/**
 * Build `count` unique puzzle rounds:
 * { word, emoji, blankIdx, answer, options[4] }
 */
export const buildPuzzleRounds = (count = 10) => {
  const pool = shuffleArray(buildWordPool()).slice(0, count);
  return pool.map(({ word, emoji }) => {
    const blankIdx = Math.floor(Math.random() * word.length);
    const answer = word[blankIdx];
    const wrong = shuffleArray(ALPHABET.filter((l) => l !== answer)).slice(0, 3);
    return {
      word,
      emoji,
      blankIdx,
      answer,
      options: shuffleArray([answer, ...wrong]),
    };
  });
};

export default buildPuzzleRounds;
