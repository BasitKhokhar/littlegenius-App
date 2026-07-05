/**
 * SVG registry — maps a stable string name to its imported SVG component.
 *
 * Why a registry (instead of importing each .svg where it's used):
 *  • Data files (numbersData, alphabetData, …) can reference an illustration
 *    by NAME string — the same way they used an emoji — with zero imports.
 *  • One place to see every illustration the app ships.
 *  • <Illustration name="apple" /> stays declarative and swappable.
 *
 * To add art: drop `foo.svg` in this folder, add one line below, done.
 * Keep SVGs flat (few paths, no filters/masks) so they stay light & fast.
 */
import Apple from './apple.svg';
import Star from './star.svg';
import Cat from './cat.svg';

export const SVGS = {
  apple: Apple,
  star: Star,
  cat: Cat,
};

export const hasSvg = (name) => Boolean(name && SVGS[name]);

export default SVGS;
