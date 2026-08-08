import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Header } from '../../Components/UI';
import { useThemeColors } from '../../Context/ThemeContext';
import { useTabBarClearance } from '../../Hooks';
import { useAuth, useProgress } from '../../Context';
import SpeechEngine from '../../Utils/speechEngine';
import { SPEECH_PHRASES } from '../../Data/speechCatalog';
import { ColorPalette, ERASER } from '../../Components/Games';
import coloringData from '../../Data/coloringData';

// ──────────────────────────────────────────────────────────────
// ColoringBookScreen — premium tap-to-fill coloring pages.
//
// • Big full-height editing canvas that fills the screen. Everything else
//   (scene strip, status, palette) is kept slim so the art gets the room.
// • Each path carries its own stroke width, so heavy silhouettes and
//   hairline texture lines render the way the art was drawn.
// • Pinch to zoom + drag to pan, so tiny parts of detailed art can be
//   reached (double-tap resets). Fills still work by tapping.
// • Top-right button reveals the finished "original" (same paths, filled
//   from each scene's `preview` map) and flips back to the child's sketch.
// • Fills are kept per scene so switching pictures never loses work; fully
//   colouring a scene celebrates and awards bonus stars.
// ──────────────────────────────────────────────────────────────

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

const clampW = (v, min, max) => {
  'worklet';
  return Math.min(Math.max(v, min), max);
};

// One long scrolling row of bright + soft colours, like a real coloring
// app's palette. Small swatches so plenty of them fit in a single row.
const PALETTE = [
  '#EF4444', '#DC2626', '#F97316', '#F59E0B', '#FBBF24', '#FDE68A',
  '#84CC16', '#22C55E', '#15803D', '#10B981', '#14B8A6', '#06B6D4',
  '#0EA5E9', '#3B82F6', '#1D4ED8', '#6366F1', '#8B5CF6', '#A855F7',
  '#EC4899', '#F472B6', '#FBCFE8', '#FDE2C8', '#A16207', '#8B4513',
  '#78350F', '#9CA3AF', '#4B5563', '#FFFFFF', '#111827',
];

const SWATCH_SIZE = 28;

// The page itself always stays a real coloring-book sheet — white paper,
// dark ink — in both themes, so the line art reads the way it was drawn
// and the child's colours land on the tones they picked.
const PAPER = '#FFFFFF';
const INK = '#1F2937';

const ColoringBookScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const bottomPad = useTabBarClearance();
  const { addStars } = useAuth();
  const { recordGameComplete } = useProgress();
  const styles = makeStyles(colors);

  const [sceneId, setSceneId] = useState(coloringData[0].id);
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]);
  const [showReference, setShowReference] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  // fills[sceneId] = { regionId: color }
  const [fills, setFills] = useState({});
  const rewardedRef = useRef({});            // scenes that already gave the completion bonus
  const rewardedRegionsRef = useRef({});     // { sceneId: Set(regionId) } already awarded per-fill points
  const [celebrating, setCelebrating] = useState(false);
  const pop = useRef(new Animated.Value(0)).current;

  // Size of the (square) drawing, measured from the flexible canvas box.
  const [canvasSize, setCanvasSize] = useState(0);

  // Floating "+2 ⭐" that pops up each time a new region is coloured.
  const [floatLabel, setFloatLabel] = useState(null);
  const floatY = useRef(new Animated.Value(0)).current;
  const floatOpacity = useRef(new Animated.Value(0)).current;

  // ── Zoom / pan shared values ──────────────────────────────────
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  // JS guard so a pan-drag never paints a region (SVG onPress can fire on
  // the finger-lift at the end of a drag). Kept true briefly after a pan.
  const panningRef = useRef(false);

  const scene = coloringData.find((s) => s.id === sceneId) || coloringData[0];
  const sceneFills = fills[sceneId] || {};
  const filledCount = scene.regions.filter((r) => sceneFills[r.id]).length;
  const totalRegions = scene.regions.length;

  const resetZoom = () => {
    scale.value = withTiming(1);
    savedScale.value = 1;
    tx.value = withTiming(0);
    ty.value = withTiming(0);
    savedTx.value = 0;
    savedTy.value = 0;
    setZoomed(false);
  };

  const switchScene = (id) => {
    setSceneId(id);
    setCelebrating(false);
    setShowReference(false);
    resetZoom();
  };

  const setPanning = (v) => { panningRef.current = v; };
  const endPanSoon = () => { setTimeout(() => { panningRef.current = false; }, 70); };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = clampW(savedScale.value * e.scale, MIN_ZOOM, MAX_ZOOM);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      const isZoomed = scale.value > MIN_ZOOM + 0.01;
      if (!isZoomed) {
        tx.value = withTiming(0);
        ty.value = withTiming(0);
        savedTx.value = 0;
        savedTy.value = 0;
      }
      runOnJS(setZoomed)(isZoomed);
    });

  const pan = Gesture.Pan()
    .minDistance(12)
    .onStart(() => {
      runOnJS(setPanning)(true);
    })
    .onUpdate((e) => {
      if (scale.value <= MIN_ZOOM + 0.01) return; // only pan when zoomed in
      const bound = (canvasSize * (scale.value - 1)) / 2;
      tx.value = clampW(savedTx.value + e.translationX, -bound, bound);
      ty.value = clampW(savedTy.value + e.translationY, -bound, bound);
    })
    .onEnd(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
      runOnJS(endPanSoon)();
    });

  // Pinch + pan run together. No tap gesture here — single taps pass
  // straight through to the SVG regions so filling stays instant.
  const composed = Gesture.Simultaneous(pinch, pan);

  const canvasStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  const showFloat = (label) => {
    setFloatLabel(label);
    floatY.setValue(0);
    floatOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(floatY, { toValue: -70, duration: 850, useNativeDriver: true }),
      Animated.timing(floatOpacity, { toValue: 0, duration: 850, useNativeDriver: true }),
    ]).start(() => setFloatLabel(null));
  };

  const handleRegionPress = (regionId) => {
    if (panningRef.current || showReference) return; // don't paint while panning / viewing original
    Haptics.selectionAsync().catch(() => {});
    const isErase = selectedColor === ERASER;
    const wasFilled = !!sceneFills[regionId];

    const cur = { ...sceneFills };
    if (isErase) delete cur[regionId];
    else cur[regionId] = selectedColor;
    setFills((prev) => ({ ...prev, [sceneId]: cur }));

    if (isErase) return;

    // Award a couple of stars the first time each region gets coloured.
    if (!wasFilled) {
      const set = rewardedRegionsRef.current[sceneId] || (rewardedRegionsRef.current[sceneId] = new Set());
      if (!set.has(regionId)) {
        set.add(regionId);
        addStars(2);
        showFloat('+2 ⭐');
      }
    }

    // Fully coloured for the first time? Celebrate + bonus.
    const allFilled = scene.regions.every((r) => cur[r.id]);
    if (allFilled && !rewardedRef.current[sceneId]) {
      rewardedRef.current[sceneId] = true;
      addStars(10);
      recordGameComplete({ xpAmount: 10 });
      setCelebrating(true);
      pop.setValue(0);
      Animated.spring(pop, { toValue: 1, friction: 5, useNativeDriver: true }).start();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      SpeechEngine.speak(SPEECH_PHRASES.COLORING_DONE, 'en-US');
    }
  };

  const handleReset = () => {
    setFills((prev) => ({ ...prev, [sceneId]: {} }));
    setCelebrating(false);
  };

  const onCanvasLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    const size = Math.max(0, Math.floor(Math.min(width, height)) - 8);
    if (size !== canvasSize) setCanvasSize(size);
  };

  return (
    <View style={styles.container}>
      <Header title="Coloring Book 🎨" showBack onBackPress={() => navigation.goBack()} />

      <View style={[styles.body, { paddingBottom: bottomPad }]}>
        {/* Scene picker */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sceneStrip} style={styles.sceneStripWrap}>
          {coloringData.map((s) => {
            const active = s.id === sceneId;
            const done = (fills[s.id] && s.regions.every((r) => fills[s.id][r.id]));
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.sceneChip, active && styles.sceneChipActive]}
                onPress={() => switchScene(s.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.sceneEmoji}>{s.emoji}</Text>
                <Text style={[styles.sceneName, active && { color: colors.primary }]}>{s.name}</Text>
                {done ? <Text style={styles.sceneDone}>✅</Text> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Large editing canvas */}
        <View style={styles.canvasWrap} onLayout={onCanvasLayout}>
          {canvasSize > 0 && (
            <GestureDetector gesture={composed}>
              <Reanimated.View style={[styles.canvasInner, canvasStyle]}>
                <Svg width={canvasSize} height={canvasSize} viewBox={scene.viewBox}>
                  {scene.regions.map((r) => (
                    <Path
                      key={r.id}
                      d={r.d}
                      fill={
                        showReference
                          ? (scene.preview?.[r.id] || PAPER)
                          : (sceneFills[r.id] || PAPER)
                      }
                      stroke={INK}
                      strokeWidth={r.w ?? 2.8}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      onPress={showReference ? undefined : () => handleRegionPress(r.id)}
                    />
                  ))}
                  {scene.outlines.map((o, i) => (
                    <Path
                      key={`o${i}`}
                      d={o.d}
                      fill={o.fill ? INK : 'none'}
                      stroke={INK}
                      strokeWidth={o.w ?? 1.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pointerEvents="none"
                    />
                  ))}
                </Svg>
              </Reanimated.View>
            </GestureDetector>
          )}

          {/* Hint pill (bottom-left) */}
          <View style={styles.hintPill}>
            <Text style={styles.hintPillText}>
              {showReference ? '👀 This is the finished picture' : '👆 Tap a part · pinch to zoom'}
            </Text>
          </View>

          {/* Reference (original) toggle — top-right */}
          <TouchableOpacity
            style={[styles.refBtn, showReference && styles.refBtnActive]}
            onPress={() => setShowReference((v) => !v)}
            activeOpacity={0.85}
          >
            <Text style={styles.refBtnIcon}>{showReference ? '✏️' : '🖼️'}</Text>
          </TouchableOpacity>
          {showReference && (
            <View style={styles.refBadge}><Text style={styles.refBadgeText}>ORIGINAL</Text></View>
          )}

          {/* Reset zoom — only while zoomed in */}
          {zoomed && (
            <TouchableOpacity style={styles.zoomResetBtn} onPress={resetZoom} activeOpacity={0.85}>
              <Text style={styles.zoomResetIcon}>⤢</Text>
            </TouchableOpacity>
          )}

          {floatLabel && (
            <Animated.View
              pointerEvents="none"
              style={[styles.floatBadge, { opacity: floatOpacity, transform: [{ translateY: floatY }] }]}
            >
              <Text style={styles.floatText}>{floatLabel}</Text>
            </Animated.View>
          )}

          {celebrating && (
            <View style={styles.celebrateOverlay} pointerEvents="box-none">
              <Animated.View style={[styles.celebrateCard, { transform: [{ scale: pop }] }]}>
                <Text style={styles.celebrateEmoji}>🎉</Text>
                <Text style={styles.celebrateTitle}>Masterpiece!</Text>
                <Text style={styles.celebrateSub}>Completion bonus +10 ⭐</Text>
                <TouchableOpacity style={styles.celebrateBtn} onPress={() => setCelebrating(false)} activeOpacity={0.85}>
                  <Text style={styles.celebrateBtnText}>Keep coloring 🎨</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
        </View>

        {/* Slim status strip + one scrolling row of small swatches */}
        <View style={styles.bottomBar}>
          <View style={styles.statusRow}>
            <View style={[styles.colorChip, { backgroundColor: selectedColor === ERASER ? '#E5E7EB' : selectedColor }]}>
              {selectedColor === ERASER ? <Text style={styles.colorChipIcon}>🧽</Text> : null}
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(filledCount / totalRegions) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{filledCount}/{totalRegions}</Text>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.85}>
              <Text style={styles.resetBtnText}>↺</Text>
            </TouchableOpacity>
          </View>

          <ColorPalette
            colors={PALETTE}
            value={selectedColor}
            onChange={setSelectedColor}
            eraser
            size={SWATCH_SIZE}
          />
        </View>
      </View>
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, paddingHorizontal: 10, paddingTop: 4 },

  sceneStripWrap: { flexGrow: 0 },
  sceneStrip: { gap: 6, paddingVertical: 2, paddingHorizontal: 2 },
  sceneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  sceneChipActive: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  sceneEmoji: { fontSize: 15 },
  sceneName: { fontSize: 11, fontWeight: '900', color: colors.textSecondary },
  sceneDone: { fontSize: 11 },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
    paddingBottom: 2,
  },
  colorChip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  colorChipIcon: { fontSize: 11 },
  progressTrack: {
    flex: 1,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressFill: { height: '100%', borderRadius: 5, backgroundColor: colors.primary },
  progressText: { fontSize: 12, fontWeight: '900', color: colors.textPrimary, minWidth: 38, textAlign: 'right' },

  // Big flexible editing area — everything else is kept slim so this grows.
  canvasWrap: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: PAPER,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  canvasInner: { alignItems: 'center', justifyContent: 'center' },

  hintPill: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hintPillText: { fontSize: 11, fontWeight: '800', color: colors.textSecondary },

  refBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  refBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  refBtnIcon: { fontSize: 22 },
  zoomResetBtn: {
    position: 'absolute',
    top: 66,
    right: 12,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  zoomResetIcon: { fontSize: 22, fontWeight: '900', color: colors.textPrimary },
  refBadge: {
    position: 'absolute',
    top: 20,
    left: 12,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  refBadgeText: { fontSize: 10, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },

  floatBadge: {
    position: 'absolute',
    top: '34%',
    alignSelf: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    elevation: 6,
  },
  floatText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },

  celebrateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,13,40,0.35)',
  },
  celebrateCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 4,
    elevation: 8,
  },
  celebrateEmoji: { fontSize: 44 },
  celebrateTitle: { fontSize: 20, fontWeight: '900', color: colors.textPrimary },
  celebrateSub: { fontSize: 14, fontWeight: '800', color: colors.textSecondary, marginBottom: 8 },
  celebrateBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 18 },
  celebrateBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13 },

  bottomBar: {
    paddingTop: 4,
    paddingBottom: 2,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 6,
  },
  resetBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  resetBtnText: { fontSize: 15, fontWeight: '900', color: colors.textPrimary },
});

export default ColoringBookScreen;
