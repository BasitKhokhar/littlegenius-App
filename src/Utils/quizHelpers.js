import { shuffleArray } from './dataHelpers';

export const QUIZ_QUESTION_COUNT = 10;

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
};
