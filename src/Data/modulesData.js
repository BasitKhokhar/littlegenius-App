// Learning Modules — the Home screen's module grid, and the join target
// for ProgressContext's `lastLessons` map (matched on `mod`). `image` is the
// hand-illustrated cover art for each module's Home card (modN.png, in the
// same order as this array) — kept alongside `icon`, which other cards
// (Continue Learning, etc.) still use as their small glyph.
export const MODULES = [
  { id: 1, name: 'English ABC', icon: '🔤', image: require('../../assets/mod1.png'), description: '26 Letters • 130 Words', mod: 'alphabet', screen: 'Alphabet', params: { initialIndex: 0 }, badge: 'LEARN' },
  { id: 2, name: 'Urdu Haroof', icon: 'اب', image: require('../../assets/mod2.png'), description: '34 Sound Cards', mod: 'urdu', screen: 'Urdu', params: { initialIndex: 0 }, badge: 'اردو' },
  { id: 3, name: 'Numbers 1–100', icon: '🔢', image: require('../../assets/mod3.png'), description: 'Count & Shapes', mod: 'numbers', screen: 'Numbers', params: { initialIndex: 0 }, badge: '123' },
  { id: 4, name: 'Islamic Studies', icon: '🕌', image: require('../../assets/mod4.png'), description: 'Duas • 99 Names • Salah', mod: 'islamic', screen: 'Islamic', badge: 'DEEN' },
  { id: 5, name: 'My Pakistan', icon: '🇵🇰', image: require('../../assets/mod5.png'), description: 'Symbols • Provinces • Heroes', mod: 'pakistan', screen: 'Pakistan', badge: 'GK' },
  { id: 6, name: 'My World', icon: '🌍', image: require('../../assets/mod6.png'), description: 'Animals • Birds • Fruits', mod: 'world', screen: 'Learn', params: { moduleKey: 'world' }, badge: 'GK' },
  { id: 7, name: 'Good Habits', icon: '🌟', image: require('../../assets/mod7.png'), description: 'Manners • Cleanliness • Safety', mod: 'habits', screen: 'Learn', params: { moduleKey: 'habits' }, badge: 'LIFE' },
];

export default MODULES;
