// Learning Modules — the Home screen's module grid, and the join target
// for ProgressContext's `lastLesson` pointer (matched on `mod`).
export const MODULES = [
  { id: 1, name: 'English ABC', icon: '🔤', description: '26 Letters • 130 Words', mod: 'alphabet', screen: 'Alphabet', badge: 'LEARN' },
  { id: 2, name: 'Urdu Haroof', icon: 'اب', description: '34 Sound Cards', mod: 'urdu', screen: 'Urdu', badge: 'اردو' },
  { id: 3, name: 'Numbers 1–100', icon: '🔢', description: 'Count & Shapes', mod: 'numbers', screen: 'Numbers', badge: '123' },
  { id: 4, name: 'Islamic Studies', icon: '🕌', description: 'Duas • 99 Names • Salah', mod: 'islamic', screen: 'Islamic', badge: 'DEEN' },
  { id: 5, name: 'My Pakistan', icon: '🇵🇰', description: 'Symbols • Provinces • Heroes', mod: 'pakistan', screen: 'Pakistan', badge: 'GK' },
  { id: 6, name: 'My World', icon: '🌍', description: 'Animals • Birds • Fruits', mod: 'world', screen: 'Learn', params: { moduleKey: 'world' }, badge: 'GK' },
  { id: 7, name: 'Good Habits', icon: '🌟', description: 'Manners • Cleanliness • Safety', mod: 'habits', screen: 'Learn', params: { moduleKey: 'habits' }, badge: 'LIFE' },
];

export default MODULES;
