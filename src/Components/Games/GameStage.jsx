import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

// ──────────────────────────────────────────────────────────────
// GameStage — the reusable full-bleed "cartoon premium" backdrop that
// every gameplay screen wraps its content in. Draws the game's themed
// gradient, a layer of gently drifting bubble/sparkle decorations, and
// an optional bottom "underwater" wave. Fully theme-driven: callers
// pass a resolved theme ({ bg, accent, deco, mascot }) picked from
// getGameTheme(id, isDark), so light and dark both look right.
//
//   <GameStage theme={gt} wave>{content}</GameStage>
// ──────────────────────────────────────────────────────────────

// One ambient floating orb (lifted from the Onboarding `Orb` pattern).
const Orb = ({ style, color, delay = 0, drift = 22, dur = 3400 }) => {
  const t = useSharedValue(0);
  React.useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: dur, easing: Easing.inOut(Easing.quad) }), -1, true)
    );
  }, [t, delay, dur]);
  const aStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(t.value, [0, 1], [0, -drift]) },
      { scale: interpolate(t.value, [0, 1], [1, 1.14]) },
    ],
    opacity: interpolate(t.value, [0, 1], [0.55, 0.9]),
  }));
  return <Animated.View style={[style, { backgroundColor: color }, aStyle]} pointerEvents="none" />;
};

// Fixed decorative bubble field — positions are relative to the screen so
// it reads like a playful, hand-placed scene rather than a repeated tile.
const BUBBLES = [
  { top: '14%', left: '8%', size: 70, drift: 26, dur: 3600, delay: 0 },
  { top: '26%', right: '10%', size: 44, drift: 18, dur: 3000, delay: 400 },
  { top: '48%', left: '4%', size: 30, drift: 22, dur: 3200, delay: 900 },
  { top: '58%', right: '7%', size: 56, drift: 24, dur: 3800, delay: 200 },
  { top: '72%', left: '14%', size: 38, drift: 20, dur: 3100, delay: 700 },
  { top: '82%', right: '18%', size: 26, drift: 16, dur: 2800, delay: 500 },
];

const GameStage = ({ theme, wave = false, children, style }) => {
  const { width } = useWindowDimensions();
  const bg = theme?.bg || ['#818CF8', '#6366F1', '#4338CA'];
  const deco = theme?.deco || 'rgba(255,255,255,0.14)';
  // Wave sits at the bottom as a slightly stronger translucent band.
  const waveFill = theme?.deco ? theme.deco.replace(/[\d.]+\)$/, '0.22)') : 'rgba(255,255,255,0.2)';

  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={bg}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient floating decorations */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {BUBBLES.map((b, i) => (
          <Orb
            key={i}
            color={deco}
            delay={b.delay}
            drift={b.drift}
            dur={b.dur}
            style={{
              position: 'absolute',
              top: b.top,
              left: b.left,
              right: b.right,
              width: b.size,
              height: b.size,
              borderRadius: b.size / 2,
            }}
          />
        ))}
      </View>

      {/* Optional bottom wave (ocean themes) */}
      {wave && (
        <View style={styles.wave} pointerEvents="none">
          <Svg width={width} height={120} viewBox={`0 0 ${width} 120`}>
            <Path
              d={`M0 46 Q ${width * 0.25} 6 ${width * 0.5} 40 T ${width} 40 L ${width} 120 L 0 120 Z`}
              fill={waveFill}
            />
            <Path
              d={`M0 70 Q ${width * 0.25} 34 ${width * 0.5} 66 T ${width} 62 L ${width} 120 L 0 120 Z`}
              fill={waveFill}
            />
          </Svg>
        </View>
      )}

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  wave: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});

export default GameStage;
