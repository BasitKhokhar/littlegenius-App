export const quizPacksByModule = {
  alphabet: {
    title: 'ABC Quiz Zone',
    subtitle: 'Pick a quiz — 10 random questions each time!',
    color: '#F85A9B',
    packs: [
      { id: 'letter-match', title: 'Letter Match', description: 'Match words to the correct letter', emoji: '🔤', color: '#F85A9B', bankKey: 'alphabetLetterMatch' },
      { id: 'word-match', title: 'Word Match', description: 'Find words that start with each letter', emoji: '📝', color: '#FFAF3A', bankKey: 'alphabetWordMatch' },
      { id: 'emoji-quiz', title: 'Emoji Quiz', description: 'Guess words and letters from emojis', emoji: '😀', color: '#3EC38B', bankKey: 'alphabetEmoji' },
      { id: 'category-quiz', title: 'Category Quiz', description: 'Sort words into their categories', emoji: '🏷️', color: '#3C97F9', bankKey: 'alphabetCategory' },
      { id: 'full-abc', title: 'Full ABC Challenge', description: 'Mixed questions from all ABC topics', emoji: '🏆', color: '#8A6FF0', bankKey: 'alphabetMixed' },
    ],
  },
  urdu: {
    title: 'Urdu Quiz Zone',
    subtitle: 'اردو کوئز — ہر بار ۱۰ نئے سوالات!',
    color: '#8A6FF0',
    packs: [
      { id: 'harf-match', title: 'Harf Match', description: 'Match Urdu words to their haroof', emoji: 'ا', color: '#8A6FF0', bankKey: 'urduHarfMatch' },
      { id: 'word-match', title: 'Word Match', description: 'Find words starting with each harf', emoji: '📖', color: '#F85A9B', bankKey: 'urduWordMatch' },
      { id: 'meaning-quiz', title: 'Meaning Quiz', description: 'Match Urdu words to English meanings', emoji: '💬', color: '#3EC38B', bankKey: 'urduMeaning' },
      { id: 'name-quiz', title: 'Harf Names', description: 'Learn the names of each harf', emoji: '🎓', color: '#FFAF3A', bankKey: 'urduName' },
      { id: 'full-urdu', title: 'Full Urdu Challenge', description: 'Mixed questions from all Urdu topics', emoji: '🏆', color: '#3C97F9', bankKey: 'urduMixed' },
    ],
  },
  numbers: {
    title: 'Numbers Quiz Zone',
    subtitle: 'گنتی کوئز — ۱۰ random questions from 100+!',
    color: '#3EC38B',
    packs: [
      { id: 'digit-english', title: 'Digit to English', description: 'Say numbers in English words', emoji: '🔢', color: '#3EC38B', bankKey: 'numbersDigitEnglish' },
      { id: 'digit-urdu', title: 'Digit to Urdu', description: 'Say numbers in Urdu', emoji: '🇵🇰', color: '#3C97F9', bankKey: 'numbersDigitUrdu' },
      { id: 'english-digit', title: 'English to Digit', description: 'Pick the right number from words', emoji: '📝', color: '#FFAF3A', bankKey: 'numbersEnglishDigit' },
      { id: 'urdu-digit', title: 'Urdu to Digit', description: 'Pick numbers from Urdu words', emoji: '📖', color: '#8A6FF0', bankKey: 'numbersUrduDigit' },
      { id: 'counting', title: 'Counting Quiz', description: 'Count emojis and objects', emoji: '🧮', color: '#F85A9B', bankKey: 'numbersCounting' },
      { id: 'full-numbers', title: 'Full Numbers Challenge', description: 'Mixed questions from all number topics', emoji: '🏆', color: '#FF6B5A', bankKey: 'numbersMixed' },
    ],
  },
  islamic: {
    title: 'Islamic Quiz Zone',
    subtitle: 'Test your knowledge of duas, kalmas & pillars',
    color: '#00897B',
    packs: [
      { id: 'dua-quiz', title: 'Daily Duas Quiz', description: 'Match duas to their occasions', emoji: '🤲', color: '#00897B', bankKey: 'islamicDua' },
      { id: 'kalma-quiz', title: 'Six Kalmas Quiz', description: 'Learn the six kalmas of Islam', emoji: '📿', color: '#1565C0', bankKey: 'islamicKalma' },
      { id: 'pillar-quiz', title: 'Five Pillars Quiz', description: 'Test your knowledge of Islam pillars', emoji: '🕌', color: '#6A1B9A', bankKey: 'islamicPillar' },
      { id: 'names-quiz', title: '99 Names Quiz', description: 'Learn the beautiful names of Allah', emoji: '📖', color: '#0EA5E9', bankKey: 'islamicNames' },
      { id: 'full-islamic', title: 'Full Islamic Challenge', description: 'Mixed questions from all Islamic topics', emoji: '🏆', color: '#2E7D32', bankKey: 'islamicMixed' },
    ],
  },
  pakistan: {
    title: 'Pakistan Quiz Zone',
    subtitle: 'پاکستان کوئز — symbols, provinces & heroes!',
    color: '#059669',
    packs: [
      { id: 'symbols-quiz', title: 'National Symbols', description: 'Flag, animal, flower and more', emoji: '🇵🇰', color: '#059669', bankKey: 'pakistanSymbols' },
      { id: 'province-quiz', title: 'Provinces & Capitals', description: 'Match provinces to their capitals', emoji: '🗺️', color: '#0EA5E9', bankKey: 'pakistanProvince' },
      { id: 'full-pakistan', title: 'Full Pakistan Challenge', description: 'Mixed questions about Pakistan', emoji: '🏆', color: '#6366F1', bankKey: 'pakistanMixed' },
    ],
  },
};

export default quizPacksByModule;
