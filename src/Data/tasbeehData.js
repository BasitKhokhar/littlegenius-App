// ──────────────────────────────────────────────────────────────
// Tasbeeh (dhikr) presets for the Tasbeeh Counter screen.
// Each entry: { id, arabic, transliteration, urdu, english, defaultTarget, color }
// ──────────────────────────────────────────────────────────────
const tasbeehData = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    urdu: 'اللہ پاک ہے',
    english: 'Glory be to Allah',
    defaultTarget: 33,
    color: '#10B981',
  },
  {
    id: 'alhamdulillah',
    arabic: 'اَلْحَمْدُ لِلّٰهِ',
    transliteration: 'Alhamdulillah',
    urdu: 'سب تعریف اللہ کے لیے ہے',
    english: 'All praise is for Allah',
    defaultTarget: 33,
    color: '#0EA5E9',
  },
  {
    id: 'allahuakbar',
    arabic: 'اَللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    urdu: 'اللہ سب سے بڑا ہے',
    english: 'Allah is the Greatest',
    defaultTarget: 34,
    color: '#F59E0B',
  },
  {
    id: 'lailahaillallah',
    arabic: 'لَا إِلٰهَ إِلَّا اللَّهُ',
    transliteration: 'La ilaha illallah',
    urdu: 'اللہ کے سوا کوئی معبود نہیں',
    english: 'There is no god but Allah',
    defaultTarget: 100,
    color: '#8B5CF6',
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah',
    urdu: 'میں اللہ سے معافی مانگتا ہوں',
    english: 'I seek forgiveness from Allah',
    defaultTarget: 100,
    color: '#EC4899',
  },
  {
    id: 'durood',
    arabic: 'اَللّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
    transliteration: 'Allahumma Salli Ala Muhammad',
    urdu: 'اے اللہ! محمد ﷺ پر رحمت بھیج',
    english: 'O Allah, send blessings upon Muhammad ﷺ',
    defaultTarget: 100,
    color: '#14B8A6',
  },
];

export default tasbeehData;
