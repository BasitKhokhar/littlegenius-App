// Numbers 1-100 Data with Urdu translations
export const generateNumbersData = () => {
  const baseUrduNumbers = [
    'ایک', 'دو', 'تین', 'چار', 'پانچ', 'چھ', 'سات', 'آٹھ', 'نو', 'دس',
    'گیارہ', 'بارہ', 'تیرہ', 'چودہ', 'پندرہ', 'سولہ', 'سترہ', 'اٹھارہ', 'انیس', 'بیس',
  ];

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numberToEnglish = (num) => {
    if (num === 100) return 'One Hundred';
    if (num < 20) return ones[num];
    const digit = num % 10;
    return tens[Math.floor(num / 10)] + (digit ? ' ' + ones[digit] : '');
  };

  const fruitEmojis = ['🍎', '⭐', '🍓', '🍉', '🎈', '🍩', '🍪', '🍭', '🧩', '🍊', '🍒', '🧸'];
  const colors = ['#F85A9B', '#FFAF3A', '#3EC38B', '#3C97F9', '#8A6FF0', '#FF6B5A', '#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B'];

  return Array.from({ length: 100 }, (_, i) => {
    const n = i + 1;
    const selectedFruit = fruitEmojis[i % fruitEmojis.length];
    const urduNum = baseUrduNumbers[i] || `عدد ${n}`;

    return {
      number: n,
      urdu: urduNum,
      emoji: n <= 10 ? '⭐'.repeat(n) : `${selectedFruit} x${n}`,
      color: colors[i % colors.length],
      speak: `${n}. In English ${numberToEnglish(n)}. In Urdu ${urduNum}`,
      objects: Array.from({ length: Math.min(n, 12) }, () => selectedFruit)
    };
  });
};

export const numbersData = generateNumbersData();

export default numbersData;
