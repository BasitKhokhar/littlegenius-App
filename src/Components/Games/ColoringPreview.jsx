import React from 'react';
import Svg, { Path } from 'react-native-svg';
import coloringData from '../../Data/coloringData';

// Renders a coloring-book scene pre-filled with its "correct" colours (the
// same `preview` map the in-game "see the original" button uses), so cards
// can show the real finished art — e.g. an actual T-Rex — instead of a flat
// emoji. Shared by GamesScreen's featured card and HomeScreen's Quick Play
// slider so both stay in sync with the same source art.
export const PREVIEW_SCENE = coloringData.find((s) => s.id === 'trex') || coloringData[0];
const PREVIEW_FILLS = PREVIEW_SCENE.preview || {};

// Thumbnails are small, so the art's own stroke weights get scaled up a
// little — otherwise the hairline texture lines vanish on the card.
const PREVIEW_INK = 1.5;

const ColoringPreview = ({ size, scene = PREVIEW_SCENE }) => {
  const fills = scene.preview || {};
  return (
    <Svg width={size} height={size} viewBox={scene.viewBox}>
      {scene.regions.map((r) => (
        <Path
          key={r.id}
          d={r.d}
          fill={fills[r.id] || '#FFFFFF'}
          stroke="#2B2B3A"
          strokeWidth={(r.w ?? 2.8) * PREVIEW_INK}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
      {scene.outlines.map((o, i) => (
        <Path
          key={`o${i}`}
          d={o.d}
          fill={o.fill ? '#2B2B3A' : 'none'}
          stroke="#2B2B3A"
          strokeWidth={(o.w ?? 1.6) * PREVIEW_INK}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
};

export default ColoringPreview;
