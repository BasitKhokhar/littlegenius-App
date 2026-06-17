// Data Helper Functions for Games and Learning Modules

/**
 * Convert number to English words
 * @param {number} num - Number to convert (0-100)
 */
export const numberToEnglish = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 100) return 'One Hundred';
  if (num < 20) return ones[num];
  const digit = num % 10;
  return tens[Math.floor(num / 10)] + (digit ? ' ' + ones[digit] : '');
};

/**
 * Shuffle array elements randomly
 * @param {array} array - Array to shuffle
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Generate random pattern for pattern game
 * @param {array} gameItems - Available items
 * @param {number} patternLength - Length of pattern (default: 4)
 */
export const generatePattern = (gameItems, patternLength = 4) => {
  const pattern = [];
  for (let i = 0; i < patternLength; i++) {
    pattern.push(gameItems[Math.floor(Math.random() * gameItems.length)]);
  }
  return pattern;
};

/**
 * Generate random math problem
 * @param {string} operation - '+' or '-'
 */
export const generateMathProblem = (operation = '+') => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;

  let result;
  if (operation === '+') {
    result = num1 + num2;
  } else {
    result = Math.max(num1, num2) - Math.min(num1, num2);
  }

  const question = operation === '+' 
    ? `${num1} + ${num2}` 
    : `${Math.max(num1, num2)} - ${Math.min(num1, num2)}`;

  // Generate 4 options
  const options = new Set([result]);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 5) - 2;
    const dummy = result + offset;
    if (dummy >= 0) options.add(dummy);
  }

  return {
    question,
    answer: result,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  };
};

/**
 * Calculate quiz score and star rewards
 * @param {number} correct - Number of correct answers
 * @param {number} total - Total questions
 * @param {number} starsPerCorrect - Stars awarded per correct answer
 */
export const calculateStarReward = (correct, total, starsPerCorrect = 5) => {
  if (total === 0) return 0;
  const percentage = (correct / total) * 100;
  const baseStars = correct * starsPerCorrect;

  // Bonus stars for perfect score
  if (percentage === 100) return baseStars + 10;
  // Bonus for 80% or higher
  if (percentage >= 80) return baseStars + 5;
  return baseStars;
};

/**
 * Format time remaining in MM:SS format
 * @param {number} seconds - Total seconds remaining
 */
export const formatTimeRemaining = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get random emoji from a set
 * @param {array} emojis - Array of emojis
 */
export const getRandomEmoji = (emojis) => {
  return emojis[Math.floor(Math.random() * emojis.length)];
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate difficulty level based on score
 * @param {number} score - Current score
 */
export const getDifficultyLevel = (score) => {
  if (score < 50) return 'Easy';
  if (score < 150) return 'Medium';
  if (score < 250) return 'Hard';
  return 'Expert';
};

export default {
  numberToEnglish,
  shuffleArray,
  generatePattern,
  generateMathProblem,
  calculateStarReward,
  formatTimeRemaining,
  getRandomEmoji,
  validateEmail,
  getDifficultyLevel,
};
