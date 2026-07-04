import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { Header } from '../../Components/UI';
import { useThemeColors } from '../../Context/ThemeContext';
import { useDialog } from '../../Context';
import { useTabBarClearance } from '../../Hooks';
import { Fonts } from '../../Theme/fonts';
import tasbeehData from '../../Data/tasbeehData';

const STORAGE_KEY = '@lg_tasbeeh';
const TARGETS = [33, 34, 100];

const RING_SIZE = 190;
const RING_STROKE = 12;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_C = 2 * Math.PI * RING_R;

const TasbeehScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const bottomPad = useTabBarClearance();
  const { showConfirm } = useDialog();
  const styles = makeStyles(colors);

  const [dhikrId, setDhikrId] = useState(tasbeehData[0].id);
  const [target, setTarget] = useState(tasbeehData[0].defaultTarget);
  const [count, setCount] = useState(0);
  const [totalAllTime, setTotalAllTime] = useState(0);
  const [celebrated, setCelebrated] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const pulse = useRef(new Animated.Value(1)).current;
  const celebrationScale = useRef(new Animated.Value(0)).current;

  const dhikr = tasbeehData.find((d) => d.id === dhikrId) || tasbeehData[0];

  // Restore persisted state
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (tasbeehData.some((d) => d.id === saved.dhikrId)) setDhikrId(saved.dhikrId);
          if (TARGETS.includes(saved.target)) setTarget(saved.target);
          if (Number.isFinite(saved.count)) setCount(saved.count);
          if (Number.isFinite(saved.totalAllTime)) setTotalAllTime(saved.totalAllTime);
        }
      } catch (e) {
        // corrupted state — start fresh
      }
      setLoaded(true);
    })();
  }, []);

  // Persist on change (after initial load)
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ dhikrId, target, count, totalAllTime })
      ).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [dhikrId, target, count, totalAllTime, loaded]);

  const runPulse = useCallback(() => {
    pulse.setValue(0.9);
    Animated.spring(pulse, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }).start();
  }, [pulse]);

  const handleTap = () => {
    const next = count + 1;
    setCount(next);
    setTotalAllTime((t) => t + 1);
    runPulse();
    if (next === target) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setCelebrated(true);
      celebrationScale.setValue(0);
      Animated.spring(celebrationScale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    } else {
      Haptics.selectionAsync().catch(() => {});
    }
  };

  const resetCount = () => {
    showConfirm({
      title: 'Reset Counter?',
      message: 'This will set the current count back to zero.',
      emoji: '📿',
      confirmLabel: 'Reset',
      onConfirm: () => {
        setCount(0);
        setCelebrated(false);
      },
    });
  };

  const selectDhikr = (d) => {
    setDhikrId(d.id);
    setTarget(d.defaultTarget);
    setCount(0);
    setCelebrated(false);
  };

  const selectTarget = (t) => {
    setTarget(t);
    if (count >= t) {
      setCount(0);
      setCelebrated(false);
    }
  };

  const progress = Math.min(count / target, 1);

  return (
    <View style={styles.container}>
      <Header title="Tasbeeh Counter" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]} showsVerticalScrollIndicator={false}>
        {/* Dhikr selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dhikrRow}>
          {tasbeehData.map((d) => {
            const active = d.id === dhikrId;
            return (
              <TouchableOpacity
                key={d.id}
                style={[styles.dhikrChip, active && { backgroundColor: d.color, borderColor: d.color }]}
                onPress={() => selectDhikr(d)}
                activeOpacity={0.85}
              >
                <Text style={[styles.dhikrChipText, active && { color: '#FFF' }]}>{d.transliteration}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Current dhikr card */}
        <View style={[styles.dhikrCard, { borderLeftColor: dhikr.color }]}>
          <Text style={styles.arabic}>{dhikr.arabic}</Text>
          <Text style={styles.urdu}>{dhikr.urdu}</Text>
          <Text style={styles.english}>{dhikr.english}</Text>
        </View>

        {/* Target presets */}
        <View style={styles.targetRow}>
          {TARGETS.map((t) => {
            const active = t === target;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.targetChip, active && { backgroundColor: dhikr.color, borderColor: dhikr.color }]}
                onPress={() => selectTarget(t)}
                activeOpacity={0.85}
              >
                <Text style={[styles.targetChipText, active && { color: '#FFF' }]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Big tap counter with progress ring */}
        <TouchableOpacity activeOpacity={0.9} onPress={handleTap} style={styles.tapZone}>
          <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ring}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_R}
              stroke={colors.border}
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_R}
              stroke={dhikr.color}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C * (1 - progress)}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </Svg>
          <Animated.View style={[styles.countWrap, { transform: [{ scale: pulse }] }]}>
            <Text style={[styles.countText, { color: dhikr.color }]}>{count}</Text>
            <Text style={styles.countTarget}>of {target}</Text>
          </Animated.View>
        </TouchableOpacity>
        <Text style={styles.tapHint}>👆 Tap the circle to count</Text>

        {/* Celebration */}
        {celebrated && (
          <Animated.View style={[styles.celebration, { transform: [{ scale: celebrationScale }] }]}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationText}>Masha'Allah! You completed {target}× {dhikr.transliteration}!</Text>
          </Animated.View>
        )}

        {/* Footer: total + reset */}
        <View style={styles.footerRow}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>All-time dhikr</Text>
            <Text style={styles.totalValue}>📿 {totalAllTime}</Text>
          </View>
          <TouchableOpacity style={styles.resetBtn} onPress={resetCount} activeOpacity={0.85}>
            <Text style={styles.resetBtnText}>Reset 🔄</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, paddingTop: 12, alignItems: 'center' },

  dhikrRow: { gap: 8, paddingVertical: 4, paddingHorizontal: 2 },
  dhikrChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dhikrChipText: { fontSize: 12, fontWeight: '800', color: colors.textSecondary },

  dhikrCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 5,
    padding: 16,
    marginTop: 14,
    alignItems: 'center',
  },
  arabic: {
    fontSize: 26,
    color: colors.textPrimary,
    lineHeight: 52,
    textAlign: 'center',
    fontFamily: Fonts.arabicBold,
  },
  urdu: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
    fontFamily: Fonts.urdu,
  },
  english: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginTop: 4, textAlign: 'center' },

  targetRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  targetChip: {
    minWidth: 62,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  targetChipText: { fontSize: 15, fontWeight: '900', color: colors.textSecondary },

  tapZone: {
    marginTop: 22,
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: { position: 'absolute' },
  countWrap: { alignItems: 'center' },
  countText: { fontSize: 56, fontWeight: '900', lineHeight: 62 },
  countTarget: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  tapHint: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginTop: 10 },

  celebration: {
    width: '100%',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
    gap: 6,
  },
  celebrationEmoji: { fontSize: 34 },
  celebrationText: { fontSize: 13, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },

  footerRow: { flexDirection: 'row', width: '100%', gap: 12, marginTop: 18, alignItems: 'center' },
  totalBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  totalLabel: { fontSize: 10, fontWeight: '800', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  totalValue: { fontSize: 18, fontWeight: '900', color: colors.textPrimary, marginTop: 2 },
  resetBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  resetBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
});

export default TasbeehScreen;
