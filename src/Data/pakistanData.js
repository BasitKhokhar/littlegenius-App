// ──────────────────────────────────────────────────────────────
// Pakistan General Knowledge for young children (PG–Class 1).
// Grouped into sections the screen renders as tabs.
// ──────────────────────────────────────────────────────────────

// National symbols & basic facts.
export const nationalSymbols = [
  { title: 'Country', urduTitle: 'ملک', value: 'Pakistan', urduValue: 'پاکستان', emoji: '🇵🇰', color: '#10B981', speak: 'Our country is Pakistan.' },
  { title: 'Capital City', urduTitle: 'دارالحکومت', value: 'Islamabad', urduValue: 'اسلام آباد', emoji: '🏛️', color: '#6366F1', speak: 'The capital of Pakistan is Islamabad.' },
  { title: 'Founder (Quaid-e-Azam)', urduTitle: 'بانیِ پاکستان', value: 'Muhammad Ali Jinnah', urduValue: 'محمد علی جناح', emoji: '🧕', color: '#0EA5E9', speak: 'The founder of Pakistan is Quaid e Azam Muhammad Ali Jinnah.' },
  { title: 'National Poet', urduTitle: 'قومی شاعر', value: 'Allama Iqbal', urduValue: 'علامہ اقبال', emoji: '✍️', color: '#8B5CF6', speak: 'The national poet of Pakistan is Allama Iqbal.' },
  { title: 'National Language', urduTitle: 'قومی زبان', value: 'Urdu', urduValue: 'اردو', emoji: '🗣️', color: '#F59E0B', speak: 'The national language of Pakistan is Urdu.' },
  { title: 'National Flag', urduTitle: 'قومی پرچم', value: 'Green & White with star and crescent', urduValue: 'سبز و سفید، چاند اور تارے کے ساتھ', emoji: '🏳️', color: '#22C55E', speak: 'The flag of Pakistan is green and white with a star and crescent.' },
  { title: 'National Animal', urduTitle: 'قومی جانور', value: 'Markhor', urduValue: 'مارخور', emoji: '🐐', color: '#14B8A6', speak: 'The national animal of Pakistan is the Markhor.' },
  { title: 'National Bird', urduTitle: 'قومی پرندہ', value: 'Chukar Partridge', urduValue: 'چکور', emoji: '🐦', color: '#EC4899', speak: 'The national bird of Pakistan is the Chukar.' },
  { title: 'National Flower', urduTitle: 'قومی پھول', value: 'Jasmine', urduValue: 'چنبیلی', emoji: '🌼', color: '#F97316', speak: 'The national flower of Pakistan is Jasmine, called Chambeli.' },
  { title: 'National Tree', urduTitle: 'قومی درخت', value: 'Deodar', urduValue: 'دیودار', emoji: '🌲', color: '#16A34A', speak: 'The national tree of Pakistan is the Deodar.' },
  { title: 'National Fruit', urduTitle: 'قومی پھل', value: 'Mango', urduValue: 'آم', emoji: '🥭', color: '#EAB308', speak: 'The national fruit of Pakistan is the Mango.' },
  { title: 'National Sport', urduTitle: 'قومی کھیل', value: 'Field Hockey', urduValue: 'ہاکی', emoji: '🏑', color: '#0EA5E9', speak: 'The national sport of Pakistan is field hockey.' },
  { title: 'Independence Day', urduTitle: 'یومِ آزادی', value: '14 August 1947', urduValue: '۱۴ اگست ۱۹۴۷', emoji: '🗓️', color: '#059669', speak: 'Pakistan became independent on the fourteenth of August nineteen forty seven.' },
  { title: 'National Anthem', urduTitle: 'قومی ترانہ', value: 'Qaumi Taranah', urduValue: 'قومی ترانہ', emoji: '🎵', color: '#7C3AED', speak: 'The national anthem of Pakistan is the Qaumi Taranah.' },
  { title: 'Currency', urduTitle: 'کرنسی', value: 'Pakistani Rupee', urduValue: 'پاکستانی روپیہ', emoji: '💵', color: '#16A34A', speak: 'The money of Pakistan is the Pakistani Rupee.' },
  { title: 'Largest City', urduTitle: 'سب سے بڑا شہر', value: 'Karachi', urduValue: 'کراچی', emoji: '🌆', color: '#0891B2', speak: 'The largest city of Pakistan is Karachi.' },
  { title: 'Highest Mountain', urduTitle: 'بلند ترین پہاڑ', value: 'K2', urduValue: 'کے ٹو', emoji: '🏔️', color: '#64748B', speak: 'The highest mountain in Pakistan is K2.' },
  { title: 'Major River', urduTitle: 'بڑا دریا', value: 'River Indus', urduValue: 'دریائے سندھ', emoji: '🌊', color: '#0EA5E9', speak: 'The major river of Pakistan is the River Indus.' },
  { title: 'National Dress', urduTitle: 'قومی لباس', value: 'Shalwar Kameez', urduValue: 'شلوار قمیض', emoji: '👕', color: '#A855F7', speak: 'The national dress of Pakistan is the shalwar kameez.' },
  { title: 'National Mosque', urduTitle: 'قومی مسجد', value: 'Faisal Mosque', urduValue: 'فیصل مسجد', emoji: '🕌', color: '#0D9488', speak: 'The national mosque of Pakistan is the Faisal Mosque.' },
  { title: 'Religion', urduTitle: 'مذہب', value: 'Islam', urduValue: 'اسلام', emoji: '☪️', color: '#15803D', speak: 'The religion of most people in Pakistan is Islam.' },
  { title: 'National Monument', urduTitle: 'قومی یادگار', value: 'Pakistan Monument', urduValue: 'پاکستان مونومنٹ', emoji: '🏛️', color: '#6366F1', speak: 'The national monument of Pakistan is the Pakistan Monument in Islamabad.' },
];

// Provinces & territories with their capitals.
export const provinces = [
  { name: 'Punjab', urduName: 'پنجاب', capital: 'Lahore', urduCapital: 'لاہور', emoji: '🌾', color: '#F59E0B', speak: 'Punjab. Its capital is Lahore.' },
  { name: 'Sindh', urduName: 'سندھ', capital: 'Karachi', urduCapital: 'کراچی', emoji: '🏖️', color: '#0EA5E9', speak: 'Sindh. Its capital is Karachi.' },
  { name: 'Khyber Pakhtunkhwa', urduName: 'خیبر پختونخوا', capital: 'Peshawar', urduCapital: 'پشاور', emoji: '⛰️', color: '#10B981', speak: 'Khyber Pakhtunkhwa. Its capital is Peshawar.' },
  { name: 'Balochistan', urduName: 'بلوچستان', capital: 'Quetta', urduCapital: 'کوئٹہ', emoji: '🏜️', color: '#8B5CF6', speak: 'Balochistan. Its capital is Quetta.' },
  { name: 'Gilgit-Baltistan', urduName: 'گلگت بلتستان', capital: 'Gilgit', urduCapital: 'گلگت', emoji: '🏔️', color: '#14B8A6', speak: 'Gilgit Baltistan. Its capital is Gilgit.' },
  { name: 'Azad Kashmir', urduName: 'آزاد کشمیر', capital: 'Muzaffarabad', urduCapital: 'مظفرآباد', emoji: '🌄', color: '#22C55E', speak: 'Azad Kashmir. Its capital is Muzaffarabad.' },
  { name: 'Islamabad (Capital)', urduName: 'اسلام آباد', capital: 'Islamabad', urduCapital: 'اسلام آباد', emoji: '🏛️', color: '#6366F1', speak: 'Islamabad is the federal capital territory.' },
];

// Simple national heroes children should know.
export const heroes = [
  { name: 'Quaid-e-Azam', urduName: 'قائدِ اعظم', role: 'Founder of Pakistan', urduRole: 'بانیِ پاکستان', emoji: '🧕', color: '#10B981', speak: 'Quaid e Azam Muhammad Ali Jinnah founded Pakistan in 1947.' },
  { name: 'Allama Iqbal', urduName: 'علامہ اقبال', role: 'National Poet & Dreamer of Pakistan', urduRole: 'قومی شاعر و مفکرِ پاکستان', emoji: '✍️', color: '#6366F1', speak: 'Allama Iqbal is the national poet who dreamed of Pakistan.' },
  { name: 'Fatima Jinnah', urduName: 'فاطمہ جناح', role: 'Mother of the Nation', urduRole: 'مادرِ ملت', emoji: '👩', color: '#EC4899', speak: 'Fatima Jinnah is known as the mother of the nation.' },
  { name: 'Abdul Sattar Edhi', urduName: 'عبدالستار ایدھی', role: 'Great Helper of the Poor', urduRole: 'غریبوں کے عظیم مددگار', emoji: '🚑', color: '#0EA5E9', speak: 'Abdul Sattar Edhi spent his life helping poor and sick people.' },
  { name: 'Arfa Karim', urduName: 'ارفع کریم', role: 'Youngest Computer Genius', urduRole: 'کم عمر کمپیوٹر ماہر', emoji: '💻', color: '#8B5CF6', speak: 'Arfa Karim became the youngest Microsoft certified professional.' },
  { name: 'Sir Syed Ahmed Khan', urduName: 'سر سید احمد خان', role: 'Great Educator', urduRole: 'عظیم ماہرِ تعلیم', emoji: '📚', color: '#F59E0B', speak: 'Sir Syed Ahmed Khan worked hard to give Muslims good education.' },
  { name: 'Liaquat Ali Khan', urduName: 'لیاقت علی خان', role: 'First Prime Minister', urduRole: 'پہلے وزیراعظم', emoji: '🎖️', color: '#0D9488', speak: 'Liaquat Ali Khan was the first Prime Minister of Pakistan.' },
  { name: 'Dr. Abdus Salam', urduName: 'ڈاکٹر عبدالسلام', role: 'Nobel Prize Scientist', urduRole: 'نوبل انعام یافتہ سائنسدان', emoji: '🔬', color: '#7C3AED', speak: 'Doctor Abdus Salam won the Nobel Prize in Physics.' },
  { name: 'Dr. A. Q. Khan', urduName: 'ڈاکٹر عبدالقدیر خان', role: 'Famous Scientist', urduRole: 'مشہور سائنسدان', emoji: '⚛️', color: '#0891B2', speak: 'Doctor Abdul Qadeer Khan was a famous Pakistani scientist.' },
  { name: 'Jahangir Khan', urduName: 'جہانگیر خان', role: 'Squash Champion', urduRole: 'اسکواش کا عظیم کھلاڑی', emoji: '🏆', color: '#16A34A', speak: 'Jahangir Khan was a great squash champion of the world.' },
  { name: 'Wasim Akram', urduName: 'وسیم اکرم', role: 'Great Cricketer', urduRole: 'عظیم کرکٹر', emoji: '🏏', color: '#EA580C', speak: 'Wasim Akram is one of the greatest cricketers of Pakistan.' },
  { name: 'Malala Yousafzai', urduName: 'ملالہ یوسفزئی', role: 'Champion of Education', urduRole: 'تعلیم کی علمبردار', emoji: '🎓', color: '#DB2777', speak: 'Malala Yousafzai won the Nobel Peace Prize for girls education.' },
  { name: 'Major Aziz Bhatti', urduName: 'میجر عزیز بھٹی', role: 'Brave War Hero', urduRole: 'بہادر جنگی ہیرو', emoji: '🎖️', color: '#15803D', speak: 'Major Aziz Bhatti was a brave soldier who received Nishan e Haider.' },
  { name: 'Rashid Minhas', urduName: 'راشد منہاس', role: 'Brave Young Pilot', urduRole: 'بہادر نوجوان پائلٹ', emoji: '✈️', color: '#1D4ED8', speak: 'Rashid Minhas was a brave young pilot of the Pakistan Air Force.' },
  { name: 'Dr. Ruth Pfau', urduName: 'ڈاکٹر روتھ فاؤ', role: 'Helper of the Sick', urduRole: 'بیماروں کی مددگار', emoji: '🩺', color: '#0EA5E9', speak: 'Doctor Ruth Pfau spent her life helping sick people in Pakistan.' },
];

// Famous places & landmarks of Pakistan.
export const famousPlaces = [
  { title: 'Faisal Mosque', urduTitle: 'فیصل مسجد', value: 'In Islamabad', urduValue: 'اسلام آباد میں', emoji: '🕌', color: '#0D9488', speak: 'Faisal Mosque is a very large and beautiful mosque in Islamabad.' },
  { title: 'Minar-e-Pakistan', urduTitle: 'مینارِ پاکستان', value: 'In Lahore', urduValue: 'لاہور میں', emoji: '🗼', color: '#059669', speak: 'Minar e Pakistan is a tall tower in Lahore.' },
  { title: 'Badshahi Mosque', urduTitle: 'بادشاہی مسجد', value: 'In Lahore', urduValue: 'لاہور میں', emoji: '🕌', color: '#B45309', speak: 'The Badshahi Mosque is a grand old mosque in Lahore.' },
  { title: 'Lahore Fort', urduTitle: 'شاہی قلعہ لاہور', value: 'In Lahore', urduValue: 'لاہور میں', emoji: '🏰', color: '#92400E', speak: 'Lahore Fort is a very old royal fort in Lahore.' },
  { title: 'Mazar-e-Quaid', urduTitle: 'مزارِ قائد', value: 'In Karachi', urduValue: 'کراچی میں', emoji: '🏛️', color: '#0EA5E9', speak: 'Mazar e Quaid is the tomb of Quaid e Azam in Karachi.' },
  { title: 'Pakistan Monument', urduTitle: 'پاکستان مونومنٹ', value: 'In Islamabad', urduValue: 'اسلام آباد میں', emoji: '🏛️', color: '#6366F1', speak: 'The Pakistan Monument is a flower shaped landmark in Islamabad.' },
  { title: 'K2 Mountain', urduTitle: 'کے ٹو پہاڑ', value: 'In Gilgit-Baltistan', urduValue: 'گلگت بلتستان میں', emoji: '🏔️', color: '#64748B', speak: 'K2 is the highest mountain of Pakistan in Gilgit Baltistan.' },
  { title: 'Nanga Parbat', urduTitle: 'نانگا پربت', value: 'In Gilgit-Baltistan', urduValue: 'گلگت بلتستان میں', emoji: '⛰️', color: '#475569', speak: 'Nanga Parbat is a very tall and famous mountain.' },
  { title: 'Khyber Pass', urduTitle: 'درۂ خیبر', value: 'In Khyber Pakhtunkhwa', urduValue: 'خیبر پختونخوا میں', emoji: '🛤️', color: '#10B981', speak: 'The Khyber Pass is a famous mountain pass in the north.' },
  { title: 'Hunza Valley', urduTitle: 'وادیِ ہنزہ', value: 'In Gilgit-Baltistan', urduValue: 'گلگت بلتستان میں', emoji: '🏞️', color: '#16A34A', speak: 'Hunza is a beautiful green valley in the mountains.' },
  { title: 'Swat Valley', urduTitle: 'وادیِ سوات', value: 'In Khyber Pakhtunkhwa', urduValue: 'خیبر پختونخوا میں', emoji: '🌄', color: '#22C55E', speak: 'Swat is a green valley called the Switzerland of Pakistan.' },
  { title: 'Saif-ul-Malook Lake', urduTitle: 'جھیل سیف الملوک', value: 'Near Naran', urduValue: 'ناران کے قریب', emoji: '🏞️', color: '#0EA5E9', speak: 'Saif ul Malook is a beautiful lake near Naran.' },
  { title: 'Attabad Lake', urduTitle: 'عطا آباد جھیل', value: 'In Hunza', urduValue: 'ہنزہ میں', emoji: '💧', color: '#0891B2', speak: 'Attabad Lake has bright blue water in Hunza.' },
  { title: 'Mohenjo-daro', urduTitle: 'موہنجو داڑو', value: 'In Sindh', urduValue: 'سندھ میں', emoji: '🏺', color: '#CA8A04', speak: 'Mohenjo daro is a very old city in Sindh.' },
  { title: 'Clifton Beach', urduTitle: 'کلفٹن بیچ', value: 'In Karachi', urduValue: 'کراچی میں', emoji: '🏖️', color: '#38BDF8', speak: 'Clifton is a famous sea beach in Karachi.' },
  { title: 'Derawar Fort', urduTitle: 'قلعہ دراوڑ', value: 'In Bahawalpur', urduValue: 'بہاولپور میں', emoji: '🏰', color: '#D97706', speak: 'Derawar Fort is a large desert fort near Bahawalpur.' },
  { title: 'Rohtas Fort', urduTitle: 'قلعہ روہتاس', value: 'In Jhelum', urduValue: 'جہلم میں', emoji: '🏯', color: '#78350F', speak: 'Rohtas Fort is a strong old fort near Jhelum.' },
  { title: 'Wazir Khan Mosque', urduTitle: 'مسجد وزیر خان', value: 'In Lahore', urduValue: 'لاہور میں', emoji: '🕌', color: '#0D9488', speak: 'Wazir Khan Mosque is famous for its colourful tile work.' },
  { title: 'Naltar Valley', urduTitle: 'وادیِ نلتر', value: 'In Gilgit-Baltistan', urduValue: 'گلگت بلتستان میں', emoji: '🌲', color: '#15803D', speak: 'Naltar is a green valley famous for its colourful lakes.' },
  { title: 'Faisalabad Clock Tower', urduTitle: 'گھنٹہ گھر فیصل آباد', value: 'In Faisalabad', urduValue: 'فیصل آباد میں', emoji: '🕰️', color: '#B91C1C', speak: 'The Clock Tower is a famous old landmark in Faisalabad.' },
];

export const pakistanData = { nationalSymbols, provinces, heroes, famousPlaces };

export default pakistanData;
