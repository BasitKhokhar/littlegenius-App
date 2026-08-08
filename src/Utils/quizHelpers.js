import { shuffleArray } from './dataHelpers';

export const QUIZ_QUESTION_COUNT = 10;

// Question banks append " {emoji}" to the displayed `q` text (see
// quizGenerators.js) so the child sees the picture while the spoken line
// stays clean. Pulling it back off lets the quiz screen render that emoji
// BIG in its own bubble instead of tiny and inline with the sentence.
const TRAILING_EMOJI = /([\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Regional_Indicator}\u{FE0F}\u{200D}]+)\s*$/u;

export const splitTrailingEmoji = (text) => {
  const str = `${text ?? ''}`;
  const match = str.match(TRAILING_EMOJI);
  if (!match) return { text: str.trim(), emoji: null };
  return { text: str.slice(0, match.index).trim(), emoji: match[1] };
};

/**
 * Pick random questions from a bank
 */
export const pickRandomQuestions = (bank, count = QUIZ_QUESTION_COUNT) => {
  if (!bank?.length) return [];
  return shuffleArray(bank).slice(0, Math.min(count, bank.length));
};

/**
 * Shuffle options while keeping the correct answer identifiable
 */
export const prepareQuizQuestion = (question) => {
  const shuffledOptions = shuffleArray(question.options);
  return {
    ...question,
    shuffledOptions,
    answer: question.answer,
  };
};

/**
 * Build a full quiz session with random questions and shuffled options
 */
export const createQuizSession = (bank, count = QUIZ_QUESTION_COUNT) => {
  return pickRandomQuestions(bank, count).map(prepareQuizQuestion);
};

export default {
  QUIZ_QUESTION_COUNT,
  pickRandomQuestions,
  prepareQuizQuestion,
  createQuizSession,
  splitTrailingEmoji,
};
