// Urdu Alphabet (Haroof) Data - Full 38 Letters
// Six words per letter — same shape as alphabetData, so UrduScreen can lay them
// out as a 3x2 grid exactly like AlphabetScreen. `speak` is the romanization,
// used ONLY as the no-voice-pack fallback (the app speaks `word` in ur-PK).
//
// Colours are cycled from the shared premium palette in Theme/colors.js (the
// same one Alphabet uses) instead of a local hex list, so both letter decks
// read as one cohesive theme. `GRADIENTS` mirrors the same cycle for cards
// that want a from/to pair rather than a single solid.
import { premiumPalette } from '../Theme/colors';

const COLORS = premiumPalette.map((p) => p.solid);
const GRADIENTS = premiumPalette;

const RAW_URDU = [
  {
    letter: 'ا', name: 'Alif', color: COLORS[0],
    vocabulary: [
      { word: 'انار', meaning: 'Pomegranate', emoji: '🍎', speak: 'Anaar' },
      { word: 'انگور', meaning: 'Grapes', emoji: '🍇', speak: 'Angoor' },
      { word: 'انڈہ', meaning: 'Egg', emoji: '🥚', speak: 'Anda' },
      { word: 'اونٹ', meaning: 'Camel', emoji: '🐫', speak: 'Oont' },
      { word: 'امرود', meaning: 'Guava', emoji: '🍏', speak: 'Amrood' },
      { word: 'استاد', meaning: 'Teacher', emoji: '👨‍🏫', speak: 'Ustaad' },
    ],
  },
  {
    letter: 'ب', name: 'Bay', color: COLORS[1],
    vocabulary: [
      { word: 'برف', meaning: 'Snow', emoji: '❄️', speak: 'Barf' },
      { word: 'بلی', meaning: 'Cat', emoji: '🐱', speak: 'Billi' },
      { word: 'بطخ', meaning: 'Duck', emoji: '🦆', speak: 'Batakh' },
      { word: 'باجا', meaning: 'Trumpet', emoji: '🎺', speak: 'Baja' },
      { word: 'بادل', meaning: 'Cloud', emoji: '☁️', speak: 'Baadal' },
      { word: 'بندر', meaning: 'Monkey', emoji: '🐒', speak: 'Bandar' },
    ],
  },
  {
    letter: 'پ', name: 'Pay', color: COLORS[2],
    vocabulary: [
      { word: 'پھول', meaning: 'Flower', emoji: '🌸', speak: 'Phool' },
      { word: 'پتا', meaning: 'Leaf', emoji: '🍃', speak: 'Patta' },
      { word: 'پنکھا', meaning: 'Fan', emoji: '🌀', speak: 'Pankha' },
      { word: 'پیاز', meaning: 'Onion', emoji: '🧅', speak: 'Pyaaz' },
      { word: 'پتنگ', meaning: 'Kite', emoji: '🪁', speak: 'Patang' },
      { word: 'پرندہ', meaning: 'Bird', emoji: '🐦', speak: 'Parinda' },
    ],
  },
  {
    letter: 'ت', name: 'Tay', color: COLORS[3],
    vocabulary: [
      { word: 'تتلی', meaning: 'Butterfly', emoji: '🦋', speak: 'Titli' },
      { word: 'تالا', meaning: 'Lock', emoji: '🔒', speak: 'Taala' },
      { word: 'ترازو', meaning: 'Scale', emoji: '⚖️', speak: 'Tarazoo' },
      { word: 'تربوز', meaning: 'Watermelon', emoji: '🍉', speak: 'Tarbooz' },
      { word: 'تارا', meaning: 'Star', emoji: '⭐', speak: 'Taara' },
      { word: 'تصویر', meaning: 'Picture', emoji: '🖼️', speak: 'Tasveer' },
    ],
  },
  {
    letter: 'ٹ', name: 'Ttay', color: COLORS[4],
    vocabulary: [
      { word: 'ٹماٹر', meaning: 'Tomato', emoji: '🍅', speak: 'Tamatar' },
      { word: 'ٹوپی', meaning: 'Hat', emoji: '🎩', speak: 'Topi' },
      { word: 'ٹب', meaning: 'Tub', emoji: '🛁', speak: 'Tab' },
      { word: 'ٹرک', meaning: 'Truck', emoji: '🚚', speak: 'Trak' },
      { word: 'ٹوکری', meaning: 'Basket', emoji: '🧺', speak: 'Tokri' },
      { word: 'ٹرین', meaning: 'Train', emoji: '🚆', speak: 'Train' },
    ],
  },
  {
    letter: 'ث', name: 'Say', color: COLORS[5],
    vocabulary: [
      { word: 'ثنا', meaning: 'Praise', emoji: '🙏', speak: 'Sana' },
      { word: 'ثبات', meaning: 'Firmness', emoji: '💪', speak: 'Sabat' },
      { word: 'ثانی', meaning: 'Second', emoji: '🥈', speak: 'Sani' },
      { word: 'ثمین', meaning: 'Precious', emoji: '💎', speak: 'Samin' },
      { word: 'ثالث', meaning: 'Third', emoji: '🥉', speak: 'Salis' },
      { word: 'ثبت', meaning: 'Record', emoji: '📝', speak: 'Sabt' },
    ],
  },
  {
    letter: 'ج', name: 'Jeem', color: COLORS[6],
    vocabulary: [
      { word: 'جگ', meaning: 'Jug', emoji: '🫙', speak: 'Jug' },
      { word: 'جہاز', meaning: 'Airplane', emoji: '✈️', speak: 'Jahaaz' },
      { word: 'جوتا', meaning: 'Shoe', emoji: '👟', speak: 'Joota' },
      { word: 'جوس', meaning: 'Juice', emoji: '🧃', speak: 'Juice' },
      { word: 'جانور', meaning: 'Animal', emoji: '🐾', speak: 'Janwar' },
      { word: 'جھنڈا', meaning: 'Flag', emoji: '🚩', speak: 'Jhanda' },
    ],
  },
  {
    letter: 'چ', name: 'Chay', color: COLORS[7],
    vocabulary: [
      { word: 'چائے', meaning: 'Tea', emoji: '🍵', speak: 'Chaaye' },
      { word: 'چمچہ', meaning: 'Spoon', emoji: '🥄', speak: 'Chamcha' },
      { word: 'چڑیا', meaning: 'Sparrow', emoji: '🐦', speak: 'Chidiya' },
      { word: 'چابی', meaning: 'Key', emoji: '🔑', speak: 'Chaabi' },
      { word: 'چہل پہل', meaning: 'Fun', emoji: '🎉', speak: 'Chehal Pehal' },
      { word: 'چاند', meaning: 'Moon', emoji: '🌙', speak: 'Chaand' },
    ],
  },
  {
    letter: 'ح', name: 'Hay', color: COLORS[8],
    vocabulary: [
      { word: 'حباب', meaning: 'Bubble', emoji: '🫧', speak: 'Hubab' },
      { word: 'حیوان', meaning: 'Animal', emoji: '🐾', speak: 'Haiwan' },
      { word: 'حیرت', meaning: 'Surprise', emoji: '😲', speak: 'Hairat' },
      { word: 'حرارت', meaning: 'Heat', emoji: '🌡️', speak: 'Hararat' },
      { word: 'حصہ', meaning: 'Share', emoji: '🍰', speak: 'Hissa' },
      { word: 'حلق', meaning: 'Throat', emoji: '👄', speak: 'Halaq' },
    ],
  },
  {
    letter: 'خ', name: 'Khay', color: COLORS[9],
    vocabulary: [
      { word: 'خربوزہ', meaning: 'Melon', emoji: '🍈', speak: 'Kharbooza' },
      { word: 'خالہ', meaning: 'Aunt', emoji: '👵', speak: 'Khala' },
      { word: 'خرگوش', meaning: 'Rabbit', emoji: '🐰', speak: 'Khargosh' },
      { word: 'خیمہ', meaning: 'Tent', emoji: '⛺', speak: 'Khaima' },
      { word: 'خاکہ', meaning: 'Map', emoji: '🗺️', speak: 'Khaka' },
      { word: 'خط', meaning: 'Mail', emoji: '✉️', speak: 'Khat' },
    ],
  },
  {
    letter: 'د', name: 'Daal', color: COLORS[0],
    vocabulary: [
      { word: 'دیوار', meaning: 'Wall', emoji: '🧱', speak: 'Deewar' },
      { word: 'دودھ', meaning: 'Milk', emoji: '🥛', speak: 'Doodh' },
      { word: 'دوا', meaning: 'Medicine', emoji: '💊', speak: 'Dawa' },
      { word: 'دیا', meaning: 'Lamp', emoji: '🪔', speak: 'Diya' },
      { word: 'دانت', meaning: 'Tooth', emoji: '🦷', speak: 'Daant' },
      { word: 'دھوپ', meaning: 'Sunshine', emoji: '☀️', speak: 'Dhoop' },
    ],
  },
  {
    letter: 'ڈ', name: 'Ddaal', color: COLORS[1],
    vocabulary: [
      { word: 'ڈاکٹر', meaning: 'Doctor', emoji: '👨‍⚕️', speak: 'Doctor' },
      { word: 'ڈرائنگ', meaning: 'Drawing', emoji: '🎨', speak: 'Drawing' },
      { word: 'ڈرم', meaning: 'Drum', emoji: '🥁', speak: 'Drum' },
      { word: 'ڈبہ', meaning: 'Box', emoji: '📦', speak: 'Dibba' },
      { word: 'ڈنڈا', meaning: 'Stick', emoji: '🪵', speak: 'Danda' },
      { word: 'ڈاکیا', meaning: 'Postman', emoji: '📬', speak: 'Dakiya' },
    ],
  },
  {
    letter: 'ذ', name: 'Zaal', color: COLORS[2],
    vocabulary: [
      { word: 'ذہین', meaning: 'Clever', emoji: '🧠', speak: 'Zaheen' },
      { word: 'ذکر', meaning: 'Remembrance', emoji: '📿', speak: 'Zikr' },
      { word: 'ذائقہ', meaning: 'Taste', emoji: '👅', speak: 'Zaiqa' },
      { word: 'ذرا', meaning: 'A little', emoji: '🤏', speak: 'Zara' },
      { word: 'ذخیرہ', meaning: 'Treasure', emoji: '💎', speak: 'Zakheera' },
      { word: 'ذمہ داری', meaning: 'Responsibility', emoji: '🤝', speak: 'Zimmedari' },
    ],
  },
  {
    letter: 'ر', name: 'Ray', color: COLORS[3],
    vocabulary: [
      { word: 'رنگ', meaning: 'Color', emoji: '🎨', speak: 'Rang' },
      { word: 'رکشا', meaning: 'Rickshaw', emoji: '🛺', speak: 'Riksha' },
      { word: 'رسی', meaning: 'Rope', emoji: '🪢', speak: 'Rassi' },
      { word: 'راستہ', meaning: 'Path', emoji: '🛤️', speak: 'Raasta' },
      { word: 'روٹی', meaning: 'Bread', emoji: '🍞', speak: 'Roti' },
      { word: 'ریل', meaning: 'Train', emoji: '🚆', speak: 'Rail' },
    ],
  },
  {
    letter: 'ڑ', name: 'Rray', color: COLORS[4],
    vocabulary: [
      // ڑ never begins an Urdu word, so every word here teaches it where it
      // really lives — inside a word the child already knows.
      { word: 'گھوڑا', meaning: 'Horse', emoji: '🐴', speak: 'Ghoda' },
      { word: 'جھاڑو', meaning: 'Broom', emoji: '🧹', speak: 'Jhaadu' },
      { word: 'لڑکا', meaning: 'Boy', emoji: '👦', speak: 'Larka' },
      { word: 'لڑکی', meaning: 'Girl', emoji: '👧', speak: 'Larki' },
      { word: 'کڑوا', meaning: 'Bitter', emoji: '😖', speak: 'Karwa' },
      { word: 'پہاڑ', meaning: 'Mountain', emoji: '🏔️', speak: 'Pahaar' },
    ],
  },
  {
    letter: 'ز', name: 'Zay', color: COLORS[5],
    vocabulary: [
      { word: 'زمین', meaning: 'Earth', emoji: '🌍', speak: 'Zameen' },
      { word: 'زبان', meaning: 'Tongue', emoji: '👅', speak: 'Zubaan' },
      { word: 'زر', meaning: 'Gold', emoji: '🥇', speak: 'Zar' },
      { word: 'زندگی', meaning: 'Life', emoji: '🌱', speak: 'Zindagi' },
      { word: 'زنجیر', meaning: 'Chain', emoji: '⛓️', speak: 'Zanjeer' },
      { word: 'زیتون', meaning: 'Olive', emoji: '🫒', speak: 'Zaitoon' },
    ],
  },
  {
    letter: 'ژ', name: 'Zhay', color: COLORS[6],
    vocabulary: [
      { word: 'ژالہ باری', meaning: 'Hailstorm', emoji: '⛈️', speak: 'Zhala Bari' },
      { word: 'ژوب', meaning: 'Zhob (a city)', emoji: '🏙️', speak: 'Zhob' },
      { word: 'ژالہ', meaning: 'Hailstone', emoji: '🧊', speak: 'Zhala' },
      { word: 'ٹیلی ویژن', meaning: 'Television', emoji: '📺', speak: 'Television' },
      { word: 'گیراژ', meaning: 'Garage', emoji: '🚗', speak: 'Garage' },
      { word: 'ژولیدہ بال', meaning: 'Messy Hair', emoji: '🙋', speak: 'Zhoolida Baal' },
    ],
  },
  {
    letter: 'س', name: 'Seen', color: COLORS[7],
    vocabulary: [
      { word: 'سورج', meaning: 'Sun', emoji: '☀️', speak: 'Suraj' },
      { word: 'ستارہ', meaning: 'Star', emoji: '⭐', speak: 'Sitara' },
      { word: 'سکول', meaning: 'School', emoji: '🏫', speak: 'School' },
      { word: 'سپرمین', meaning: 'Superman', emoji: '🦸', speak: 'Superman' },
      { word: 'سردی', meaning: 'Cold', emoji: '❄️', speak: 'Sardi' },
      { word: 'سیب', meaning: 'Apple', emoji: '🍎', speak: 'Saib' },
    ],
  },
  {
    letter: 'ش', name: 'Sheen', color: COLORS[8],
    vocabulary: [
      { word: 'شیر', meaning: 'Lion', emoji: '🦁', speak: 'Sher' },
      { word: 'شکر', meaning: 'Sugar', emoji: '🍬', speak: 'Shakar' },
      { word: 'شیشہ', meaning: 'Glass', emoji: '🪟', speak: 'Sheesha' },
      { word: 'شام', meaning: 'Evening', emoji: '🌆', speak: 'Shaam' },
      { word: 'شہد', meaning: 'Honey', emoji: '🍯', speak: 'Shehad' },
      { word: 'شمع', meaning: 'Candle', emoji: '🕯️', speak: 'Shama' },
    ],
  },
  {
    letter: 'ص', name: 'Suad', color: COLORS[9],
    vocabulary: [
      { word: 'صابن', meaning: 'Soap', emoji: '🧼', speak: 'Saabun' },
      { word: 'صبح', meaning: 'Morning', emoji: '🌅', speak: 'Subah' },
      { word: 'صندوق', meaning: 'Box', emoji: '📦', speak: 'Sandooq' },
      { word: 'صحت', meaning: 'Health', emoji: '💚', speak: 'Sehat' },
      { word: 'صوف', meaning: 'Wool', emoji: '🧶', speak: 'Suf' },
      { word: 'صراحی', meaning: 'Jug', emoji: '🏺', speak: 'Suraahi' },
    ],
  },
  {
    letter: 'ض', name: 'Zuad', color: COLORS[0],
    vocabulary: [
      { word: 'ضرور', meaning: 'Surely', emoji: '✅', speak: 'Zaroor' },
      { word: 'ضیا', meaning: 'Light', emoji: '💡', speak: 'Zia' },
      { word: 'ضمانت', meaning: 'Guarantee', emoji: '🤝', speak: 'Zamaanat' },
      { word: 'ضعف', meaning: 'Weakness', emoji: '😔', speak: 'Zauf' },
      { word: 'ضمیمہ', meaning: 'Supplement', emoji: '📎', speak: 'Zameema' },
      { word: 'ضرب', meaning: 'Multiply', emoji: '✖️', speak: 'Zarb' },
    ],
  },
  {
    letter: 'ط', name: 'Toay', color: COLORS[1],
    vocabulary: [
      { word: 'طوطا', meaning: 'Parrot', emoji: '🦜', speak: 'Tota' },
      { word: 'طبلہ', meaning: 'Drum', emoji: '🥁', speak: 'Tabla' },
      { word: 'طویل', meaning: 'Long', emoji: '📏', speak: 'Taweel' },
      { word: 'طاقت', meaning: 'Power', emoji: '💪', speak: 'Taaqat' },
      { word: 'طعام', meaning: 'Food', emoji: '🍽️', speak: 'Taam' },
      { word: 'طالب علم', meaning: 'Student', emoji: '🧑‍🎓', speak: 'Taalib Ilm' },
    ],
  },
  {
    letter: 'ظ', name: 'Zoay', color: COLORS[2],
    vocabulary: [
      { word: 'ظرف', meaning: 'Container', emoji: '🫙', speak: 'Zarf' },
      { word: 'ظلم', meaning: 'Injustice', emoji: '⚖️', speak: 'Zulm' },
      { word: 'ظاہر', meaning: 'Visible', emoji: '👁️', speak: 'Zaahir' },
      { word: 'ظہور', meaning: 'Appearance', emoji: '✨', speak: 'Zuhoor' },
      { word: 'ظفر', meaning: 'Victory', emoji: '🏆', speak: 'Zafar' },
      { word: 'ظہر', meaning: 'Noon Prayer', emoji: '🕌', speak: 'Zuhr' },
    ],
  },
  {
    letter: 'ع', name: 'Ain', color: COLORS[3],
    vocabulary: [
      { word: 'عام', meaning: 'Common', emoji: '👥', speak: 'Aam' },
      { word: 'عقل', meaning: 'Mind', emoji: '🧠', speak: 'Aqal' },
      { word: 'عید', meaning: 'Eid', emoji: '🌙', speak: 'Eid' },
      { word: 'عطر', meaning: 'Perfume', emoji: '🌸', speak: 'Itr' },
      { word: 'عناب', meaning: 'Grapes', emoji: '🍇', speak: 'Anaab' },
      { word: 'عینک', meaning: 'Glasses', emoji: '👓', speak: 'Ainak' },
    ],
  },
  {
    letter: 'غ', name: 'Ghain', color: COLORS[4],
    vocabulary: [
      { word: 'غبارہ', meaning: 'Balloon', emoji: '🎈', speak: 'Ghubaara' },
      { word: 'غلام', meaning: 'Servant', emoji: '🙇', speak: 'Ghulaam' },
      { word: 'غذا', meaning: 'Food', emoji: '🍲', speak: 'Ghiza' },
      { word: 'غلطی', meaning: 'Mistake', emoji: '❌', speak: 'Ghalti' },
      { word: 'غار', meaning: 'Cave', emoji: '🕳️', speak: 'Ghaar' },
      { word: 'غزل', meaning: 'Poem', emoji: '🎶', speak: 'Ghazal' },
    ],
  },
  {
    letter: 'ف', name: 'Fay', color: COLORS[5],
    vocabulary: [
      { word: 'فالودہ', meaning: 'Falooda', emoji: '🍧', speak: 'Falooda' },
      { word: 'فانوس', meaning: 'Lantern', emoji: '🏮', speak: 'Fanoos' },
      { word: 'فصل', meaning: 'Season', emoji: '🍂', speak: 'Fasl' },
      { word: 'فرشتہ', meaning: 'Angel', emoji: '👼', speak: 'Farishta' },
      { word: 'فوج', meaning: 'Army', emoji: '🪖', speak: 'Fauj' },
      { word: 'فٹ بال', meaning: 'Football', emoji: '⚽', speak: 'Football' },
    ],
  },
  {
    letter: 'ق', name: 'Qaaf', color: COLORS[6],
    vocabulary: [
      { word: 'قالین', meaning: 'Carpet', emoji: '🧶', speak: 'Qaleen' },
      { word: 'قلم', meaning: 'Pen', emoji: '✏️', speak: 'Qalam' },
      { word: 'قمر', meaning: 'Moon', emoji: '🌙', speak: 'Qamar' },
      { word: 'قصہ', meaning: 'Story', emoji: '📖', speak: 'Qissa' },
      { word: 'قنات', meaning: 'Canal', emoji: '🌊', speak: 'Qanat' },
      { word: 'قمیض', meaning: 'Shirt', emoji: '👕', speak: 'Qameez' },
    ],
  },
  {
    letter: 'ک', name: 'Kaaf', color: COLORS[7],
    vocabulary: [
      { word: 'کتاب', meaning: 'Book', emoji: '📚', speak: 'Kitaab' },
      { word: 'کبوتر', meaning: 'Pigeon', emoji: '🕊️', speak: 'Kabootar' },
      { word: 'کپڑا', meaning: 'Cloth', emoji: '👕', speak: 'Kapra' },
      { word: 'کیلا', meaning: 'Banana', emoji: '🍌', speak: 'Kela' },
      { word: 'کمرہ', meaning: 'Room', emoji: '🏠', speak: 'Kamra' },
      { word: 'کرسی', meaning: 'Chair', emoji: '🪑', speak: 'Kursi' },
    ],
  },
  {
    letter: 'گ', name: 'Gaaf', color: COLORS[8],
    vocabulary: [
      { word: 'گائے', meaning: 'Cow', emoji: '🐄', speak: 'Gaaye' },
      { word: 'گلاب', meaning: 'Rose', emoji: '🌹', speak: 'Gulaab' },
      { word: 'گاڑی', meaning: 'Car', emoji: '🚗', speak: 'Gaari' },
      { word: 'گھڑی', meaning: 'Clock', emoji: '🕐', speak: 'Ghari' },
      { word: 'گھر', meaning: 'Home', emoji: '🏡', speak: 'Ghar' },
      { word: 'گیند', meaning: 'Ball', emoji: '⚽', speak: 'Gaind' },
    ],
  },
  {
    letter: 'ل', name: 'Laam', color: COLORS[9],
    vocabulary: [
      { word: 'لال', meaning: 'Red', emoji: '🔴', speak: 'Laal' },
      { word: 'لکڑی', meaning: 'Wood', emoji: '🪵', speak: 'Lakri' },
      { word: 'لڈو', meaning: 'Sweet', emoji: '🍬', speak: 'Laddu' },
      { word: 'لہر', meaning: 'Wave', emoji: '🌊', speak: 'Lehar' },
      { word: 'لالچ', meaning: 'Greed', emoji: '🤑', speak: 'Laalach' },
      { word: 'لیموں', meaning: 'Lemon', emoji: '🍋', speak: 'Lemoon' },
    ],
  },
  {
    letter: 'م', name: 'Meem', color: COLORS[0],
    vocabulary: [
      { word: 'مچھلی', meaning: 'Fish', emoji: '🐟', speak: 'Machli' },
      { word: 'مکڑی', meaning: 'Spider', emoji: '🕷️', speak: 'Makri' },
      { word: 'مٹی', meaning: 'Soil', emoji: '🌱', speak: 'Mitti' },
      { word: 'موسم', meaning: 'Weather', emoji: '🌤️', speak: 'Mausam' },
      { word: 'مٹھائی', meaning: 'Sweet', emoji: '🍬', speak: 'Mithai' },
      { word: 'مور', meaning: 'Peacock', emoji: '🦚', speak: 'Mor' },
    ],
  },
  {
    letter: 'ن', name: 'Noon', color: COLORS[1],
    vocabulary: [
      { word: 'ناریل', meaning: 'Coconut', emoji: '🥥', speak: 'Nariyal' },
      { word: 'نمک', meaning: 'Salt', emoji: '🧂', speak: 'Namak' },
      { word: 'نیلا', meaning: 'Blue', emoji: '🔵', speak: 'Neela' },
      { word: 'نہر', meaning: 'Canal', emoji: '🌊', speak: 'Nehr' },
      { word: 'نماز', meaning: 'Prayer', emoji: '🕌', speak: 'Namaaz' },
      { word: 'ناشپاتی', meaning: 'Pear', emoji: '🍐', speak: 'Nashpaati' },
    ],
  },
  {
    letter: 'و', name: 'Wao', color: COLORS[2],
    vocabulary: [
      { word: 'وقت', meaning: 'Time', emoji: '⏰', speak: 'Waqt' },
      { word: 'وطن', meaning: 'Homeland', emoji: '🏳️', speak: 'Watan' },
      { word: 'وزن', meaning: 'Weight', emoji: '⚖️', speak: 'Wazan' },
      { word: 'ورزش', meaning: 'Exercise', emoji: '🏃', speak: 'Warzish' },
      { word: 'وین', meaning: 'Van', emoji: '🚐', speak: 'Van' },
      { word: 'وردی', meaning: 'Uniform', emoji: '👔', speak: 'Wardi' },
    ],
  },
  {
    letter: 'ہ', name: 'Chhoti Hay', color: COLORS[3],
    vocabulary: [
      { word: 'ہاتھ', meaning: 'Hand', emoji: '✋', speak: 'Haath' },
      { word: 'ہوا', meaning: 'Air', emoji: '💨', speak: 'Hawa' },
      { word: 'ہدف', meaning: 'Target', emoji: '🎯', speak: 'Hadaf' },
      { word: 'ہنسی', meaning: 'Laughter', emoji: '😄', speak: 'Hansi' },
      { word: 'ہلدی', meaning: 'Turmeric', emoji: '🟡', speak: 'Haldi' },
      { word: 'ہرن', meaning: 'Deer', emoji: '🦌', speak: 'Hiran' },
    ],
  },
  {
    letter: 'ھ', name: 'Do Chashmi Hay', color: COLORS[4],
    vocabulary: [
      { word: 'کہانی', meaning: 'Story', emoji: '📖', speak: 'Kahaani' },
      { word: 'مچھلی', meaning: 'Fish', emoji: '🐟', speak: 'Machli' },
      { word: 'گھڑی', meaning: 'Clock', emoji: '🕐', speak: 'Ghari' },
      { word: 'چھتری', meaning: 'Umbrella', emoji: '☂️', speak: 'Chhatri' },
      { word: 'بھائی', meaning: 'Brother', emoji: '👦', speak: 'Bhai' },
      { word: 'پھول', meaning: 'Flower', emoji: '🌸', speak: 'Phool' },
    ],
  },
  {
    letter: 'ء', name: 'Hamza', color: COLORS[5],
    vocabulary: [
      { word: 'آدمی', meaning: 'Man', emoji: '👨', speak: 'Aadmi' },
      { word: 'آسمان', meaning: 'Sky', emoji: '🌌', speak: 'Aasmaan' },
      { word: 'آئینہ', meaning: 'Mirror', emoji: '🪞', speak: 'Aaina' },
      { word: 'آواز', meaning: 'Voice', emoji: '🔊', speak: 'Aawaaz' },
      { word: 'آم', meaning: 'Mango', emoji: '🥭', speak: 'Aam' },
      { word: 'آنکھ', meaning: 'Eye', emoji: '👁️', speak: 'Aankh' },
    ],
  },
  {
    letter: 'ی', name: 'Chhoti Yeh', color: COLORS[6],
    vocabulary: [
      { word: 'یاد', meaning: 'Memory', emoji: '🧠', speak: 'Yaad' },
      { word: 'یونیفارم', meaning: 'Uniform', emoji: '👔', speak: 'Uniform' },
      { word: 'یخ', meaning: 'Ice', emoji: '🧊', speak: 'Yakh' },
      { word: 'یقین', meaning: 'Belief', emoji: '💫', speak: 'Yaqeen' },
      { word: 'یار', meaning: 'Friend', emoji: '🤝', speak: 'Yaar' },
      { word: 'یاقوت', meaning: 'Ruby', emoji: '💎', speak: 'Yaqoot' },
    ],
  },
  {
    letter: 'ے', name: 'Bari Yeh', color: COLORS[7],
    vocabulary: [
      { word: 'کی', meaning: 'Of', emoji: '🔗', speak: 'Ki' },
      { word: 'تھے', meaning: 'Were', emoji: '👥', speak: 'Thay' },
      { word: 'رہے', meaning: 'Stayed', emoji: '🏠', speak: 'Rahe' },
      { word: 'گئے', meaning: 'Went', emoji: '🚶', speak: 'Gaye' },
      { word: 'آئے', meaning: 'Came', emoji: '🚪', speak: 'Aaye' },
      { word: 'کھلونے', meaning: 'Toys', emoji: '🧸', speak: 'Khilone' },
    ],
  },
];

// Attach the matching gradient pair (from/to) alongside the flat `color`
// each letter already carries, so the hero/grid cards can render a premium
// gradient instead of a flat fill.
export const urduData = RAW_URDU.map((item) => {
  const idx = COLORS.indexOf(item.color);
  const g = GRADIENTS[idx] || GRADIENTS[0];
  return { ...item, gradientFrom: g.from, gradientTo: g.to };
});

export default urduData;
