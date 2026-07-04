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
  const rewardedRef = useRef({});
  const [celebrating, setCelebrating] = useState(false);
  const pop = useRef(new Animated.Value(0)).current;

  const scene = coloringData.find((s) => s.id === sceneId) || coloringData[0];
  const sceneFills = fills[sceneId] || {};

  const handleRegionPress = (regionId) => {
    Haptics.selectionAsync().catch(() => {});
    setFills((prev) => {
      const cur = { ...(prev[sceneId] || {}) };
      if (selectedColor === ERASER) {
        delete cur[regionId];
      } else {
        cur[regionId] = selectedColor;
      }
      const next = { ...prev, [sceneId]: cur };

      // Fully coloured for the first time? Celebrate + reward.
      const allFilled = scene.regions.every((r) => cur[r.id]);
      if (allFilled && !rewardedRef.current[sceneId]) {
        rewardedRef.current[sceneId] = true;
        addStars(15);
        setCelebrating(true);
        pop.setValue(0);
        Animated.spring(pop, { toValue: 1, friction: 5, useNativeDriver: true }).start();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        SpeechEngine.speak(`Beautiful! You colored the whole ${scene.name} and earned 15 stars!`, 'en-US');
      }
      return next;
    });
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

        <Text style={styles.hint}>Pick a color below, then tap a part of the picture to fill it! 👆</Text>

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

          {celebrating && (
            <View style={styles.celebrateOverlay} pointerEvents="box-none">
              <Animated.View style={[styles.celebrateCard, { transform: [{ scale: pop }] }]}>
                <Text style={styles.celebrateEmoji}>🎉</Text>
                <Text style={styles.celebrateTitle}>Masterpiece!</Text>
                <Text style={styles.celebrateSub}>+15 ⭐ earned</Text>
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

  hint: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginVertical: 10, textAlign: 'center' },

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
