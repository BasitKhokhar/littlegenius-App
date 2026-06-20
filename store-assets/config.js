// Edit headlines / subtitles / accent colors here, then run `npm run generate`.
// `image` is a filename inside ./raw/  |  `accent` drives the per-slide glow + frame color.
// `headline` supports inline HTML: <span class="accent">..</span> and <span class="star">⭐</span>.
// Set `badge: false` to hide the gold "OFFLINE · AD-FREE" pill on a slide.

const ACCENTS = {
  indigo: { accent: '#6366F1', glow: 'rgba(99,102,241,0.40)', glowSoft: 'rgba(99,102,241,0.10)' },
  coral:  { accent: '#F43F5E', glow: 'rgba(244,63,94,0.38)',  glowSoft: 'rgba(244,63,94,0.10)' },
  green:  { accent: '#10B981', glow: 'rgba(16,185,129,0.38)', glowSoft: 'rgba(16,185,129,0.10)' },
  blue:   { accent: '#0EA5E9', glow: 'rgba(14,165,233,0.40)', glowSoft: 'rgba(14,165,233,0.10)' },
  orange: { accent: '#F59E0B', glow: 'rgba(245,158,11,0.40)', glowSoft: 'rgba(245,158,11,0.10)' },
  purple: { accent: '#7C3AED', glow: 'rgba(124,58,237,0.40)', glowSoft: 'rgba(124,58,237,0.10)' },
  gold:   { accent: '#FCD34D', glow: 'rgba(252,211,77,0.34)', glowSoft: 'rgba(252,211,77,0.10)' },
};

const screenshots = [
  {
    out: '01-home',
    image: '01-home.png',
    color: 'indigo',
    badge: true,
    headline: 'Everything Your Child <span class="accent">Needs to Learn</span> <span class="star">⭐</span>',
    subtitle: '7 fun learning modules in one beautiful offline app.',
  },
  {
    out: '02-abc',
    image: '02-abc.png',
    color: 'coral',
    badge: false,
    headline: 'Learn the <span class="accent">Alphabet</span>, the Fun Way',
    subtitle: '26 letters · 130 words · friendly voice narration.',
  },
  {
    out: '03-numbers',
    image: '03-numbers.png',
    color: 'green',
    badge: false,
    headline: 'Count & Master <span class="accent">Numbers 1–100</span>',
    subtitle: 'Numbers, shapes and counting — with sounds & star rewards.',
  },
  {
    out: '04-islamic',
    image: '04-islamic.png',
    color: 'blue',
    badge: false,
    headline: '<span class="accent">Islamic Basics</span> for Little Ones',
    subtitle: 'Kalmas · Duas · 99 Names of Allah · Salah.',
  },
  {
    out: '05-stories',
    image: '05-stories.png',
    color: 'orange',
    badge: false,
    headline: 'Bilingual <span class="accent">Moral Stories</span>',
    subtitle: 'English + Urdu · 2-minute bedtime reads with a lesson.',
  },
  {
    out: '06-games',
    image: '06-games.png',
    color: 'purple',
    badge: false,
    headline: 'Brain <span class="accent">Games</span> & Fun Puzzles',
    subtitle: 'Memory, logic, math and colors — learning that feels like play.',
  },
  {
    out: '07-onboarding',
    image: '07-onboarding.png',
    color: 'indigo',
    badge: true,
    headline: '<span class="accent">Offline</span> · Free · No Sign-Up',
    subtitle: 'Safe, ad-free learning with a grown-ups-only parental gate.',
  },
];

// Feature graphic uses the home screenshot in the angled phone.
const featureGraphic = {
  out: 'feature-graphic',
  image: '01-home.png',
};

module.exports = { ACCENTS, screenshots, featureGraphic };
