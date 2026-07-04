import React from 'react';
import Svg, { Circle, Path, Rect, Line } from 'react-native-svg';

// ──────────────────────────────────────────────────────────────
// PostureFigure — friendly SVG "prayer buddy" illustrations for the
// Namaz Guide. Pure vector (no assets), drawn as a chunky stick
// figure on a prayer mat. Postures:
//   niyyah | takbir | qiyam | ruku | qawmah | sajdah | jalsa |
//   tashahhud | salam
// ──────────────────────────────────────────────────────────────

const LIMB = 9; // stroke width for arms/legs/torso

const PostureFigure = ({ posture = 'qiyam', color = '#10B981', size = 180 }) => {
  const face = '#FFFFFF';

  // Shared pieces
  const mat = (
    <Rect x="18" y="172" width="164" height="14" rx="7" fill={color} opacity={0.25} />
  );

  const head = (cx, cy, r = 15, turn = 0) => (
    <>
      <Circle cx={cx} cy={cy} r={r} fill={color} />
      {/* eyes + smile; `turn` nudges the face sideways for Salam */}
      <Circle cx={cx - 5 + turn} cy={cy - 3} r={1.8} fill={face} />
      <Circle cx={cx + 5 + turn} cy={cy - 3} r={1.8} fill={face} />
      <Path
        d={`M${cx - 5 + turn},${cy + 4} Q${cx + turn},${cy + 9} ${cx + 5 + turn},${cy + 4}`}
        stroke={face}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
    </>
  );

  const limb = (d) => (
    <Path d={d} stroke={color} strokeWidth={LIMB} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  );

  let figure = null;

  switch (posture) {
    case 'niyyah':
    case 'qawmah':
      // Standing straight, arms relaxed at the sides
      figure = (
        <>
          {head(100, 44)}
          {limb('M100,60 L100,128')}
          {limb('M100,78 L84,112')}
          {limb('M100,78 L116,112')}
          {limb('M100,128 L90,170')}
          {limb('M100,128 L110,170')}
        </>
      );
      break;

    case 'takbir':
      // Standing, hands raised to the ears (Allahu Akbar)
      figure = (
        <>
          {head(100, 48)}
          {limb('M100,64 L100,128')}
          {limb('M100,82 L76,64 L78,48')}
          {limb('M100,82 L124,64 L122,48')}
          {limb('M100,128 L90,170')}
          {limb('M100,128 L110,170')}
        </>
      );
      break;

    case 'qiyam':
      // Standing with hands folded below the chest
      figure = (
        <>
          {head(100, 44)}
          {limb('M100,60 L100,128')}
          {limb('M100,78 L82,98 L106,104')}
          {limb('M100,78 L118,98 L94,104')}
          {limb('M100,128 L90,170')}
          {limb('M100,128 L110,170')}
        </>
      );
      break;

    case 'ruku':
      // Bowing: flat back, hands on knees
      figure = (
        <>
          {head(52, 84, 14)}
          {limb('M66,88 L124,96')}
          {limb('M78,90 L112,136')}
          {limb('M124,96 L116,170')}
          {limb('M124,96 L134,168')}
        </>
      );
      break;

    case 'sajdah':
      // Prostration: forehead on the ground
      figure = (
        <>
          {head(50, 158, 13)}
          {limb('M62,152 L118,132')}
          {limb('M118,132 L130,162 L162,164')}
          {limb('M76,148 L62,170')}
          {limb('M100,142 L84,170')}
        </>
      );
      break;

    case 'jalsa':
    case 'tashahhud':
    case 'salam': {
      // Sitting on folded legs; tashahhud raises the index finger,
      // salam turns the face to the side.
      const turn = posture === 'salam' ? 6 : 0;
      figure = (
        <>
          {head(96, 78, 15, turn)}
          {limb('M96,94 L96,138')}
          {/* folded legs */}
          {limb('M96,138 L66,160 L128,166')}
          {/* resting arm */}
          {limb('M96,106 L114,140')}
          {posture === 'tashahhud' ? (
            <>
              {limb('M96,106 L70,134')}
              <Line x1="70" y1="134" x2="60" y2="122" stroke={color} strokeWidth={4} strokeLinecap="round" />
            </>
          ) : (
            limb('M96,106 L78,140')
          )}
        </>
      );
      break;
    }

    default:
      figure = <>{head(100, 44)}{limb('M100,60 L100,128')}</>;
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      {mat}
      {figure}
    </Svg>
  );
};

export default PostureFigure;
