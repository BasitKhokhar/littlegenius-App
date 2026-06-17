// Brain Games Data

export const gamesList = [
  {
    id: 1,
    name: 'Pattern Match',
    icon: '🎨',
    desc: 'Find the next shape in the pattern',
    gradStart: '#F59E0B',
    gradEnd: '#EF4444',
    tag: 'LOGIC',
  },
  {
    id: 2,
    name: 'Memory Game',
    icon: '🧠',
    desc: 'Flip and match pairs of emojis',
    gradStart: '#10B981',
    gradEnd: '#3B82F6',
    tag: 'MEMORY',
  },
  {
    id: 3,
    name: 'Odd One Out',
    icon: '🔍',
    desc: 'Find what does not belong',
    gradStart: '#8B5CF6',
    gradEnd: '#EC4899',
    tag: 'IQ',
  },
  {
    id: 4,
    name: 'Math Race',
    icon: '🚀',
    desc: 'Solve fast math problems',
    gradStart: '#3B82F6',
    gradEnd: '#06B6D4',
    tag: 'MATH',
  },
  {
    id: 5,
    name: 'Color Match',
    icon: '🌈',
    desc: 'Match colors to their names',
    gradStart: '#EC4899',
    gradEnd: '#F59E0B',
    tag: 'COLORS',
  },
  {
    id: 6,
    name: 'Shape Quiz',
    icon: '⬛',
    desc: 'Identify shapes and their names',
    gradStart: '#6366F1',
    gradEnd: '#8B5CF6',
    tag: 'SHAPES',
  },
];

// Pattern Matching Game
export const patternData = [
  { pattern: ['🔴','🔵','🔴','🔵'], answer: '🔴', options: ['🔴','🟡','🟢','🟣'] },
  { pattern: ['⭐','⭐','🌙','⭐','⭐'], answer: '🌙', options: ['⭐','🌙','☀️','❤️'] },
  { pattern: ['🐱','🐶','🐱','🐶'], answer: '🐱', options: ['🐱','🐸','🐰','🐧'] },
  { pattern: ['1️⃣','2️⃣','3️⃣','4️⃣'], answer: '5️⃣', options: ['5️⃣','6️⃣','7️⃣','8️⃣'] },
  { pattern: ['🍎','🍊','🍋','🍎','🍊'], answer: '🍋', options: ['🍎','🍊','🍋','🍇'] },
  { pattern: ['🌸','🌺','🌸','🌺'], answer: '🌸', options: ['🌸','🌻','🌹','🌷'] },
  { pattern: ['🔺','🔵','🔺','🔵'], answer: '🔺', options: ['🔺','🟢','🟡','⬛'] },
  { pattern: ['🐸','🐸','🦋','🐸','🐸'], answer: '🦋', options: ['🐸','🦋','🐝','🐞'] },
  { pattern: ['❤️','💛','💚','❤️','💛'], answer: '💚', options: ['❤️','💛','💚','💙'] },
  { pattern: ['🚗','🚌','🚗','🚌'], answer: '🚗', options: ['🚗','✈️','🚢','🚲'] },
  { pattern: ['🌞','🌙','🌞','🌙'], answer: '🌞', options: ['🌞','🌙','⭐','☁️'] },
  { pattern: ['🍌','🍎','🍊','🍌','🍎'], answer: '🍊', options: ['🍌','🍎','🍊','🍇'] },
];

// Memory Game Cards
export const memoryCardsList = [
  '🐱','🐶','🐸','🐰','🦁','🐯','🐻','🦊',
  '🐱','🐶','🐸','🐰','🦁','🐯','🐻','🦊',
];

// Odd One Out Puzzles
export const oddOneOutData = [
  { items: ['🍎','🍊','🍋','🐱'], odd: 3, explain: 'Cat is an animal, not a fruit!' },
  { items: ['🚗','🚌','✈️','🍕'], odd: 3, explain: 'Pizza is delicious food, not a vehicle!' },
  { items: ['📚','📖','✏️','🐶'], odd: 3, explain: 'A dog is an animal, not a school item!' },
  { items: ['🔴','🔵','🟢','🐰'], odd: 3, explain: 'A rabbit is an animal, not a color!' },
  { items: ['⚽','🏀','🧪','🍕'], odd: 2, explain: 'A science tube is not a game ball!' },
  { items: ['🐄','🐑','🐔','🚗'], odd: 3, explain: 'A car is a vehicle, not a farm animal!' },
  { items: ['🌞','🌙','⭐','🍎'], odd: 3, explain: 'An apple is a fruit, not in the sky!' },
  { items: ['👕','👗','👟','🍰'], odd: 3, explain: 'Cake is food, not clothing!' },
  { items: ['🎹','🎸','🥁','🐟'], odd: 3, explain: 'A fish is an animal, not a musical instrument!' },
  { items: ['🏠','🏫','🕌','🐸'], odd: 3, explain: 'A frog is an animal, not a building!' },
  { items: ['❄️','☀️','🌧️','📚'], odd: 3, explain: 'A book is not weather!' },
  { items: ['🦁','🐘','🦒','🌳'], odd: 3, explain: 'A tree is a plant, not an animal!' },
];

// Color Match Game
export const colorMatchData = [
  { color: '#FF0000', name: 'Red', emoji: '🔴', options: ['Red', 'Blue', 'Green', 'Yellow'] },
  { color: '#0000FF', name: 'Blue', emoji: '🔵', options: ['Red', 'Blue', 'Green', 'Yellow'] },
  { color: '#00FF00', name: 'Green', emoji: '🟢', options: ['Red', 'Blue', 'Green', 'Yellow'] },
  { color: '#FFFF00', name: 'Yellow', emoji: '🟡', options: ['Red', 'Blue', 'Green', 'Yellow'] },
  { color: '#FFA500', name: 'Orange', emoji: '🟠', options: ['Orange', 'Purple', 'Pink', 'Brown'] },
  { color: '#800080', name: 'Purple', emoji: '🟣', options: ['Orange', 'Purple', 'Pink', 'Brown'] },
  { color: '#FFC0CB', name: 'Pink', emoji: '🩷', options: ['Orange', 'Purple', 'Pink', 'Brown'] },
  { color: '#8B4513', name: 'Brown', emoji: '🟤', options: ['Orange', 'Purple', 'Pink', 'Brown'] },
  { color: '#FFFFFF', name: 'White', emoji: '⬜', options: ['White', 'Black', 'Gray', 'Gold'] },
  { color: '#000000', name: 'Black', emoji: '⬛', options: ['White', 'Black', 'Gray', 'Gold'] },
];

// Shape Quiz Game
export const shapeQuizData = [
  { shape: '⭕', name: 'Circle', urdu: 'دائرہ', options: ['Circle', 'Square', 'Triangle', 'Star'] },
  { shape: '⬛', name: 'Square', urdu: 'مربع', options: ['Circle', 'Square', 'Triangle', 'Star'] },
  { shape: '🔺', name: 'Triangle', urdu: 'مثلث', options: ['Circle', 'Square', 'Triangle', 'Star'] },
  { shape: '⭐', name: 'Star', urdu: 'ستارہ', options: ['Circle', 'Square', 'Triangle', 'Star'] },
  { shape: '❤️', name: 'Heart', urdu: 'دل', options: ['Heart', 'Diamond', 'Oval', 'Rectangle'] },
  { shape: '💎', name: 'Diamond', urdu: 'ہیرا', options: ['Heart', 'Diamond', 'Oval', 'Rectangle'] },
  { shape: '🥚', name: 'Oval', urdu: 'بیضہ', options: ['Heart', 'Diamond', 'Oval', 'Rectangle'] },
  { shape: '▬', name: 'Rectangle', urdu: 'مستطیل', options: ['Heart', 'Diamond', 'Oval', 'Rectangle'] },
  { shape: '🌙', name: 'Crescent', urdu: 'هلال', options: ['Crescent', 'Hexagon', 'Pentagon', 'Cylinder'] },
  { shape: '⬡', name: 'Hexagon', urdu: 'شش پہلو', options: ['Crescent', 'Hexagon', 'Pentagon', 'Cylinder'] },
];

export default {
  gamesList,
  patternData,
  memoryCardsList,
  oddOneOutData,
  colorMatchData,
  shapeQuizData,
};
