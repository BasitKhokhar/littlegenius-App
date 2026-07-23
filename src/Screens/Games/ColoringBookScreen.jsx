import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Header } from '../../Components/UI';
import { useThemeColors } from '../../Context/ThemeContext';
import { useTabBarClearance } from '../../Hooks';
import { useAuth } from '../../Context';
import SpeechEngine from '../../Utils/speechEngine';
import { ColorPalette, ERASER } from '../../Components/Games';
import coloringData from '../../Data/coloringData';

// ──────────────────────────────────────────────────────────────
// ColoringBookScreen — tap-to-fill coloring pages. Pick a colour,
// tap a region to fill it. Fills are kept per scene so switching
// pictures never loses work. Fully colouring a scene celebrates
// and awards stars (once per scene per visit).
// ──────────────────────────────────────────────────────────────

const { width: SCREEN_W } = Dimensions.get('window');
const CANVAS = Math.min(SCREEN_W - 32, 380);

const PALETTE = [
  '#EF4444', '#F97316', '#FBBF24', '#4ADE80', '#10B981', '#22D3EE',
  '#3B82F6', '#6366F1', '#A78BFA', '#EC4899', '#8B4513', '#111827',
];

const ColoringBookScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const bottomPad = useTabBarClearance();
  const { addStars } = useAuth();
  const styles = makeStyles(colors);

  const [sceneId, setSceneId] = useState(coloringData[0].id);
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]);
  // fills[sceneId] = { regionId: color }
  const [fills, setFills] = useState({});
  const rewardedRef = useRef({});            // scenes that already gave the completion bonus
  const rewardedRegionsRef = useRef({});     // { sceneId: Set(regionId) } already awarded per-fill points
  const [celebrating, setCelebrating] = useState(false);
  const pop = useRef(new Animated.Value(0)).current;

  // Floating "+2 ⭐" that pops up each time a new region is coloured.
  const [floatLabel, setFloatLabel] = useState(null);
  const floatY = useRef(new Animated.Value(0)).current;
  const floatOpacity = useRef(new Animated.Value(0)).current;

  const scene = coloringData.find((s) => s.id === sceneId) || coloringData[0];
  const sceneFills = fills[sceneId] || {};
  const filledCount = scene.regions.filter((r) => sceneFills[r.id]).length;
  const totalRegions = scene.regions.length;

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
      setCelebrating(true);
      pop.setValue(0);
      Animated.spring(pop, { toValue: 1, friction: 5, useNativeDriver: true }).start();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      SpeechEngine.speak(`Beautiful! You colored the whole ${scene.name} and earned a big bonus!`, 'en-US');
    }
  };

  const handleReset = () => {
    setFills((prev) => ({ ...prev, [sceneId]: {} }));
    setCelebrating(false);
  };

  return (
    <View style={styles.container}>
      <Header title="Coloring Book 🎨" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]} showsVerticalScrollIndicator={false}>
        {/* Scene picker */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sceneStrip}>
          {coloringData.map((s) => {
            const active = s.id === sceneId;
            const done = (fills[s.id] && s.regions.every((r) => fills[s.id][r.id]));
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.sceneChip, active && styles.sceneChipActive]}
                onPress={() => { setSceneId(s.id); setCelebrating(false); }}
                activeOpacity={0.85}
              >
                <Text style={styles.sceneEmoji}>{s.emoji}</Text>
                <Text style={[styles.sceneName, active && { color: colors.primary }]}>{s.name}</Text>
                {done ? <Text style={styles.sceneDone}>✅</Text> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected colour + live hint */}
        <View style={styles.hintRow}>
          <View style={[styles.colorChip, { backgroundColor: selectedColor === ERASER ? '#E5E7EB' : selectedColor }]}>
            {selectedColor === ERASER ? <Text style={styles.colorChipIcon}>🧽</Text> : null}
          </View>
          <Text style={styles.hint}>
            {selectedColor === ERASER ? 'Tap a part to erase it' : 'Tap any white part to fill it!'} 👆
          </Text>
        </View>

        {/* Progress */}
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(filledCount / totalRegions) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{filledCount}/{totalRegions} ⭐</Text>
        </View>

        {/* Canvas */}
        <View style={styles.canvasWrap}>
          <Svg width={CANVAS} height={CANVAS} viewBox={scene.viewBox}>
            {scene.regions.map((r) => (
              <Path
                key={r.id}
                d={r.d}
                fill={sceneFills[r.id] || colors.surface}
                stroke={colors.textPrimary}
                strokeWidth={3.5}
                strokeLinejoin="round"
                onPress={() => handleRegionPress(r.id)}
              />
            ))}
            {scene.outlines.map((o, i) => (
              <Path
                key={`o${i}`}
                d={o.d}
                fill={o.fill ? colors.textPrimary : 'none'}
                stroke={colors.textPrimary}
                strokeWidth={3}
                strokeLinecap="round"
                pointerEvents="none"
              />
            ))}
          </Svg>

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

        {/* Palette + reset */}
        <ColorPalette
          colors={PALETTE}
          value={selectedColor}
          onChange={setSelectedColor}
          eraser
          large
        />
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.85}>
          <Text style={styles.resetBtnText}>↺ Start this picture over</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, paddingTop: 10, alignItems: 'center' },

  sceneStrip: { gap: 8, paddingVertical: 6 },
  sceneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sceneChipActive: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  sceneEmoji: { fontSize: 18 },
  sceneName: { fontSize: 12, fontWeight: '900', color: colors.textSecondary },
  sceneDone: { fontSize: 12 },

  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  colorChip: {
    width: 26,
    height: 26,
    borderRadius: 13,
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
  colorChipIcon: { fontSize: 13 },
  hint: { fontSize: 13, fontWeight: '800', color: colors.textSecondary, textAlign: 'center' },

  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: CANVAS,
    marginBottom: 12,
  },
  progressTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  progressText: { fontSize: 13, fontWeight: '900', color: colors.textPrimary, minWidth: 48, textAlign: 'right' },

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

  canvasWrap: {
    width: CANVAS,
    height: CANVAS,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

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
  celebrateBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  celebrateBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13 },

  resetBtn: {
    marginTop: 10,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  resetBtnText: { fontSize: 13, fontWeight: '900', color: colors.textPrimary },
});

export default ColoringBookScreen;
