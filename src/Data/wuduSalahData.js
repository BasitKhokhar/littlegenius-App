// ──────────────────────────────────────────────────────────────
// Step-by-step Wudu (ablution) and Salah (prayer) for children.
// Schema per step: { step, title, urduTitle, emoji, detail, urduDetail }
// ──────────────────────────────────────────────────────────────
export const wuduSteps = [
  { step: 1, title: 'Make Intention (Niyyah)', urduTitle: 'نیت کرنا', emoji: '🤲', detail: 'Begin with "Bismillah" and intend to make wudu for Allah.', urduDetail: '"بسم اللہ" کہہ کر اللہ کے لیے وضو کی نیت کرو۔' },
  { step: 2, title: 'Wash Hands', urduTitle: 'ہاتھ دھونا', emoji: '✋', detail: 'Wash both hands up to the wrists, three times.', urduDetail: 'دونوں ہاتھ کلائیوں تک تین بار دھوؤ۔' },
  { step: 3, title: 'Rinse Mouth', urduTitle: 'کلی کرنا', emoji: '👄', detail: 'Rinse your mouth with water three times.', urduDetail: 'منہ میں پانی لے کر تین بار کلی کرو۔' },
  { step: 4, title: 'Clean Nose', urduTitle: 'ناک صاف کرنا', emoji: '👃', detail: 'Put a little water in the nose and clean it, three times.', urduDetail: 'ناک میں تھوڑا پانی ڈال کر تین بار صاف کرو۔' },
  { step: 5, title: 'Wash Face', urduTitle: 'چہرہ دھونا', emoji: '😊', detail: 'Wash your whole face three times.', urduDetail: 'پورا چہرہ تین بار دھوؤ۔' },
  { step: 6, title: 'Wash Arms', urduTitle: 'بازو دھونا', emoji: '💪', detail: 'Wash both arms up to the elbows, three times.', urduDetail: 'دونوں بازو کہنیوں تک تین بار دھوؤ۔' },
  { step: 7, title: 'Wipe Head (Masah)', urduTitle: 'سر کا مسح', emoji: '🧑', detail: 'Wipe your wet hands over your head once.', urduDetail: 'گیلے ہاتھوں سے ایک بار سر کا مسح کرو۔' },
  { step: 8, title: 'Wash Feet', urduTitle: 'پاؤں دھونا', emoji: '🦶', detail: 'Wash both feet up to the ankles, three times.', urduDetail: 'دونوں پاؤں ٹخنوں تک تین بار دھوؤ۔' },
];

export const salahSteps = [
  { step: 1, title: 'Takbeer', urduTitle: 'تکبیر', emoji: '🙌', detail: 'Stand facing the Qibla and say "Allahu Akbar" raising your hands.', urduDetail: 'قبلہ رخ کھڑے ہو کر ہاتھ اٹھا کر "اللہ اکبر" کہو۔' },
  { step: 2, title: 'Qiyam (Standing)', urduTitle: 'قیام', emoji: '🧍', detail: 'Place hands and recite Surah Al-Fatiha and a short Surah.', urduDetail: 'ہاتھ باندھ کر سورۃ فاتحہ اور ایک چھوٹی سورت پڑھو۔' },
  { step: 3, title: 'Ruku (Bowing)', urduTitle: 'رکوع', emoji: '🙇', detail: 'Bow down and say "Subhana Rabbiyal Azeem" three times.', urduDetail: 'جھک کر تین بار "سبحان ربی العظیم" کہو۔' },
  { step: 4, title: 'Stand Up (Qauma)', urduTitle: 'قومہ', emoji: '🧍', detail: 'Stand straight and say "Sami Allahu liman hamidah".', urduDetail: 'سیدھے کھڑے ہو کر "سمع اللہ لمن حمدہ" کہو۔' },
  { step: 5, title: 'Sajdah (Prostration)', urduTitle: 'سجدہ', emoji: '🤲', detail: 'Put your forehead on the ground and say "Subhana Rabbiyal A’la" three times.', urduDetail: 'پیشانی زمین پر رکھ کر تین بار "سبحان ربی الاعلیٰ" کہو۔' },
  { step: 6, title: 'Sit (Jalsa)', urduTitle: 'جلسہ', emoji: '🧎', detail: 'Sit calmly between the two sajdahs.', urduDetail: 'دو سجدوں کے درمیان سکون سے بیٹھو۔' },
  { step: 7, title: 'Tashahhud', urduTitle: 'تشہد', emoji: '☝️', detail: 'Sit and recite At-Tahiyyat, raising the finger at the shahadah.', urduDetail: 'بیٹھ کر التحیات پڑھو اور شہادت پر انگلی اٹھاؤ۔' },
  { step: 8, title: 'Salam', urduTitle: 'سلام', emoji: '🙂', detail: 'Turn your face right then left saying "Assalamu Alaikum wa Rahmatullah".', urduDetail: 'دائیں پھر بائیں منہ کر کے "السلام علیکم ورحمۃ اللہ" کہو۔' },
];

export const wuduSalahData = { wuduSteps, salahSteps };

export default wuduSalahData;
