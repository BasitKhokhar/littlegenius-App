// English Alphabet Data - 26 Letters with Vocabulary
// Card colours are NOT hardcoded here — they're cycled from the shared
// premium palette in Theme/colors.js so every module (Alphabet, Urdu,
// Islamic) reads as one cohesive jewel-tone theme instead of a per-screen
// grab-bag of hex codes.
import { premiumPalette } from '../Theme/colors';

const RAW_LETTERS = [
  {
    letter: 'A',
    vocabulary: [
      { word: 'Apple', emoji: '🍎', category: 'Fruits' },
      { word: 'Ant', emoji: '🐜', category: 'Insects' },
      { word: 'Alligator', emoji: '🐊', category: 'Animals' },
      { word: 'Anchor', emoji: '⚓', category: 'Objects' },
      { word: 'Arrow', emoji: '🏹', category: 'Shapes' },
      { word: 'Avocado', emoji: '🥑', category: 'Fruits' }
    ]
  },
  {
    letter: 'B',
    vocabulary: [
      { word: 'Ball', emoji: '⚽', category: 'Sports' },
      { word: 'Butterfly', emoji: '🦋', category: 'Insects' },
      { word: 'Banana', emoji: '🍌', category: 'Fruits' },
      { word: 'Bear', emoji: '🐻', category: 'Animals' },
      { word: 'Bicycle', emoji: '🚲', category: 'Vehicles' },
      { word: 'Bread', emoji: '🍞', category: 'Food' }
    ]
  },
  {
    letter: 'C',
    vocabulary: [
      { word: 'Cat', emoji: '🐱', category: 'Animals' },
      { word: 'Car', emoji: '🚗', category: 'Vehicles' },
      { word: 'Camel', emoji: '🐫', category: 'Animals' },
      { word: 'Cake', emoji: '🍰', category: 'Food' },
      { word: 'Carrot', emoji: '🥕', category: 'Vegetables' },
      { word: 'Cloud', emoji: '☁️', category: 'Nature' }
    ]
  },
  {
    letter: 'D',
    vocabulary: [
      { word: 'Dog', emoji: '🐶', category: 'Animals' },
      { word: 'Duck', emoji: '🦆', category: 'Birds' },
      { word: 'Dolphin', emoji: '🐬', category: 'Sea Creatures' },
      { word: 'Donkey', emoji: '🫏', category: 'Animals' },
      { word: 'Drum', emoji: '🥁', category: 'Music' },
      { word: 'Door', emoji: '🚪', category: 'Objects' }
    ]
  },
  {
    letter: 'E',
    vocabulary: [
      { word: 'Elephant', emoji: '🐘', category: 'Animals' },
      { word: 'Egg', emoji: '🥚', category: 'Food' },
      { word: 'Eagle', emoji: '🦅', category: 'Birds' },
      { word: 'Engine', emoji: '🚂', category: 'Machines' },
      { word: 'Earth', emoji: '🌍', category: 'Nature' },
      { word: 'Eye', emoji: '👁️', category: 'Body' }
    ]
  },
  {
    letter: 'F',
    vocabulary: [
      { word: 'Fish', emoji: '🐟', category: 'Sea Creatures' },
      { word: 'Frog', emoji: '🐸', category: 'Amphibians' },
      { word: 'Fox', emoji: '🦊', category: 'Animals' },
      { word: 'Flower', emoji: '🌸', category: 'Plants' },
      { word: 'Fan', emoji: '🪭', category: 'Objects' },
      { word: 'Fire', emoji: '🔥', category: 'Nature' }
    ]
  },
  {
    letter: 'G',
    vocabulary: [
      { word: 'Grapes', emoji: '🍇', category: 'Fruits' },
      { word: 'Goat', emoji: '🐐', category: 'Animals' },
      { word: 'Giraffe', emoji: '🦒', category: 'Animals' },
      { word: 'Guitar', emoji: '🎸', category: 'Music' },
      { word: 'Garlic', emoji: '🧄', category: 'Vegetables' },
      { word: 'Gift', emoji: '🎁', category: 'Objects' }
    ]
  },
  {
    letter: 'H',
    vocabulary: [
      { word: 'House', emoji: '🏠', category: 'Buildings' },
      { word: 'Horse', emoji: '🐎', category: 'Animals' },
      { word: 'Hat', emoji: '🎩', category: 'Clothes' },
      { word: 'Hen', emoji: '🐔', category: 'Birds' },
      { word: 'Hammer', emoji: '🔨', category: 'Tools' },
      { word: 'Honey', emoji: '🍯', category: 'Food' }
    ]
  },
  {
    letter: 'I',
    vocabulary: [
      { word: 'Ice Cream', emoji: '🍦', category: 'Sweets' },
      { word: 'Iguana', emoji: '🦎', category: 'Reptiles' },
      { word: 'Igloo', emoji: '❄️', category: 'Buildings' },
      { word: 'Ink', emoji: '🫙', category: 'School' },
      { word: 'Island', emoji: '🏝️', category: 'Nature' },
      { word: 'Ice', emoji: '🧊', category: 'Nature' }
    ]
  },
  {
    letter: 'J',
    vocabulary: [
      { word: 'Juice', emoji: '🧃', category: 'Drinks' },
      { word: 'Jaguar', emoji: '🐆', category: 'Animals' },
      { word: 'Jellyfish', emoji: '🪼', category: 'Sea Creatures' },
      { word: 'Jet', emoji: '✈️', category: 'Vehicles' },
      { word: 'Jeep', emoji: '🚙', category: 'Vehicles' },
      { word: 'Jacket', emoji: '🧥', category: 'Clothes' }
    ]
  },
  {
    letter: 'K',
    vocabulary: [
      { word: 'Kite', emoji: '🪁', category: 'Toys' },
      { word: 'Kangaroo', emoji: '🦘', category: 'Animals' },
      { word: 'Key', emoji: '🔑', category: 'Objects' },
      { word: 'Koala', emoji: '🐨', category: 'Animals' },
      { word: 'Kiwi', emoji: '🥝', category: 'Fruits' },
      { word: 'King', emoji: '🤴', category: 'People' }
    ]
  },
  {
    letter: 'L',
    vocabulary: [
      { word: 'Lion', emoji: '🦁', category: 'Animals' },
      { word: 'Lemon', emoji: '🍋', category: 'Fruits' },
      { word: 'Leaf', emoji: '🍃', category: 'Nature' },
      { word: 'Lamp', emoji: '💡', category: 'Objects' },
      { word: 'Lock', emoji: '🔒', category: 'Objects' },
      { word: 'Ladder', emoji: '🪜', category: 'Tools' }
    ]
  },
  {
    letter: 'M',
    vocabulary: [
      { word: 'Moon', emoji: '🌙', category: 'Space' },
      { word: 'Monkey', emoji: '🐒', category: 'Animals' },
      { word: 'Mango', emoji: '🥭', category: 'Fruits' },
      { word: 'Milk', emoji: '🥛', category: 'Drinks' },
      { word: 'Mouse', emoji: '🐭', category: 'Animals' },
      { word: 'Mountain', emoji: '⛰️', category: 'Nature' }
    ]
  },
  {
    letter: 'N',
    vocabulary: [
      { word: 'Nest', emoji: '🪺', category: 'Birds' },
      { word: 'Nut', emoji: '🥜', category: 'Food' },
      { word: 'Notebook', emoji: '📓', category: 'School' },
      { word: 'Needle', emoji: '🪡', category: 'Tools' },
      { word: 'Noodle', emoji: '🍜', category: 'Food' },
      { word: 'Nose', emoji: '👃', category: 'Body' }
    ]
  },
  {
    letter: 'O',
    vocabulary: [
      { word: 'Orange', emoji: '🍊', category: 'Fruits' },
      { word: 'Owl', emoji: '🦉', category: 'Birds' },
      { word: 'Octopus', emoji: '🐙', category: 'Sea Creatures' },
      { word: 'Onion', emoji: '🧅', category: 'Vegetables' },
      { word: 'Ostrich', emoji: '🪶', category: 'Birds' },
      { word: 'Ocean', emoji: '🌊', category: 'Nature' }
    ]
  },
  {
    letter: 'P',
    vocabulary: [
      { word: 'Parrot', emoji: '🦜', category: 'Birds' },
      { word: 'Pencil', emoji: '✏️', category: 'School' },
      { word: 'Pear', emoji: '🍐', category: 'Fruits' },
      { word: 'Penguin', emoji: '🐧', category: 'Birds' },
      { word: 'Pizza', emoji: '🍕', category: 'Food' },
      { word: 'Panda', emoji: '🐼', category: 'Animals' }
    ]
  },
  {
    letter: 'Q',
    vocabulary: [
      { word: 'Queen', emoji: '👑', category: 'People' },
      { word: 'Quill', emoji: '🪶', category: 'Objects' },
      { word: 'Quilt', emoji: '🛌', category: 'Objects' },
      { word: 'Quail', emoji: '🐦', category: 'Birds' },
      { word: 'Queue', emoji: '🚶', category: 'People' },
      { word: 'Question', emoji: '❓', category: 'School' }
    ]
  },
  {
    letter: 'R',
    vocabulary: [
      { word: 'Rabbit', emoji: '🐰', category: 'Animals' },
      { word: 'Ring', emoji: '💍', category: 'Objects' },
      { word: 'Rocket', emoji: '🚀', category: 'Space' },
      { word: 'Rose', emoji: '🌹', category: 'Flowers' },
      { word: 'Rainbow', emoji: '🌈', category: 'Nature' },
      { word: 'Robot', emoji: '🤖', category: 'Toys' }
    ]
  },
  {
    letter: 'S',
    vocabulary: [
      { word: 'Sun', emoji: '☀️', category: 'Space' },
      { word: 'Star', emoji: '⭐', category: 'Shapes' },
      { word: 'Sheep', emoji: '🐑', category: 'Animals' },
      { word: 'Snail', emoji: '🐌', category: 'Insects' },
      { word: 'Ship', emoji: '🚢', category: 'Vehicles' },
      { word: 'Snake', emoji: '🐍', category: 'Reptiles' }
    ]
  },
  {
    letter: 'T',
    vocabulary: [
      { word: 'Tiger', emoji: '🐯', category: 'Animals' },
      { word: 'Turtle', emoji: '🐢', category: 'Reptiles' },
      { word: 'Tomato', emoji: '🍅', category: 'Vegetables' },
      { word: 'Tree', emoji: '🌳', category: 'Nature' },
      { word: 'Train', emoji: '🚂', category: 'Vehicles' },
      { word: 'Telephone', emoji: '☎️', category: 'Objects' }
    ]
  },
  {
    letter: 'U',
    vocabulary: [
      { word: 'Umbrella', emoji: '☂️', category: 'Objects' },
      { word: 'Unicorn', emoji: '🦄', category: 'Fantasy' },
      { word: 'Uncle', emoji: '👨', category: 'Family' },
      { word: 'Urn', emoji: '🏺', category: 'Objects' },
      { word: 'Umpire', emoji: '🧢', category: 'Sports' },
      { word: 'Uniform', emoji: '👔', category: 'Clothes' }
    ]
  },
  {
    letter: 'V',
    vocabulary: [
      { word: 'Violin', emoji: '🎻', category: 'Music' },
      { word: 'Vase', emoji: '🏺', category: 'Objects' },
      { word: 'Vulture', emoji: '🦅', category: 'Birds' },
      { word: 'Van', emoji: '🚐', category: 'Vehicles' },
      { word: 'Volcano', emoji: '🌋', category: 'Nature' },
      { word: 'Vegetable', emoji: '🥦', category: 'Vegetables' }
    ]
  },
  {
    letter: 'W',
    vocabulary: [
      { word: 'Watermelon', emoji: '🍉', category: 'Fruits' },
      { word: 'Whale', emoji: '🐋', category: 'Sea Creatures' },
      { word: 'Watch', emoji: '⌚', category: 'Objects' },
      { word: 'Wasp', emoji: '🐝', category: 'Insects' },
      { word: 'Window', emoji: '🪟', category: 'Objects' },
      { word: 'Wolf', emoji: '🐺', category: 'Animals' }
    ]
  },
  {
    letter: 'X',
    vocabulary: [
      { word: 'Xylophone', emoji: '🎵', category: 'Music' },
      { word: 'X-ray', emoji: '🩻', category: 'Science' },
      { word: 'Xenops', emoji: '🐦', category: 'Birds' },
      { word: 'Xylocopa', emoji: '🐝', category: 'Insects' },
      { word: 'Xmas Tree', emoji: '🎄', category: 'Plants' },
      { word: 'Box', emoji: '📦', category: 'Objects' }
    ]
  },
  {
    letter: 'Y',
    vocabulary: [
      { word: 'Yacht', emoji: '⛵', category: 'Vehicles' },
      { word: 'Yak', emoji: '🐂', category: 'Animals' },
      { word: 'Yo-yo', emoji: '🪀', category: 'Toys' },
      { word: 'Yarn', emoji: '🧶', category: 'Objects' },
      { word: 'Yogurt', emoji: '🥛', category: 'Food' },
      { word: 'Yellow', emoji: '🟡', category: 'Colors' }
    ]
  },
  {
    letter: 'Z',
    vocabulary: [
      { word: 'Zebra', emoji: '🦓', category: 'Animals' },
      { word: 'Zip', emoji: '🤐', category: 'Objects' },
      { word: 'Zero', emoji: '0️⃣', category: 'Numbers' },
      { word: 'Zoo', emoji: '🦁', category: 'Places' },
      { word: 'Zucchini', emoji: '🥒', category: 'Vegetables' },
      { word: 'Zigzag', emoji: '〽️', category: 'Shapes' }
    ]
  }
];

// Cycle the shared premium palette across the 26 letters — `color` /
// `borderColor` stay for existing consumers (hero backgrounds, nav buttons,
// SketchCanvas accents); `gradientFrom`/`gradientTo` feed the new gradient
// card look in AlphabetCard.
export const alphabetData = RAW_LETTERS.map((item, i) => {
  const p = premiumPalette[i % premiumPalette.length];
  return {
    ...item,
    color: p.solid,
    borderColor: p.to,
    gradientFrom: p.from,
    gradientTo: p.to,
  };
});
