import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, useWindowDimensions } from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { Radius, Spacing, coloredShadow } from '../../Theme';

// ──────────────────────────────────────────────────────────────
// CelebrationOverlay — the shared "you won!" surface for the gameplay
// screens. Emoji-confetti rains down, a big trophy bounces, and the
// score + star reward sit on a themed card with two bright pill
// buttons. Fully theme-driven (light/dark via useThemeColors); the
// game's `accent` colours the primary button so each game keeps its
// personality.
//
//   <CelebrationOverlay
//     title="Puzzle Complete!"
//     scoreLabel="First-try score: 8 / 10"
//     reward={3}
//     accent={gt.accent}
//     onReplay={restart}
//     onExit={() => navigation.goBack()} />
// ──────────────────────────────────────────────────────────────

const CONFETTI = ['🎉', '⭐', '🎊', '✨', '🌟', '🎈'];

// A single confetti piece falling + spinning from above the card.
const Piece = ({ emoji, left, delay, duration, size, travelDistance }) => {
  const fall = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(fall, { toValue: 1, duration, delay, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [fall, delay, duration]);

  const translateY = fall.interpolate({ inputRange: [0, 1], outputRange: [-40, travelDistance] });
  const rotate = fall.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '320deg'] });
  const opacity = fall.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] });

  return (
    <Animated.Text
      style={{ position: 'absolute', left, top: 0, fontSize: size, opacity, transform: [{ translateY }, { rotate }] }}
      pointerEvents="none"
    >
      {emoji}
    </Animated.Text>
  );
};

const CelebrationOverlay = ({
  title = 'Great Job!',
  scoreLabel,
  reward = 0,
  accent = '#6366F1',
  onReplay,
  onExit,
  replayLabel = 'Play Again 🔁',
  exitLabel = 'Back to Games ➔',
}) => {
  const { width, height } = useWindowDimensions();
  const colors = useThemeColors();
  const styles = makeStyles(colors);

  const scale = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1.12, duration: 620, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 1, duration: 620, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale, bounce]);

  const pieces = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        emoji: CONFETTI[i % CONFETTI.length],
        left: (i * 37) % (width - 24) + 8,
        delay: (i % 7) * 220,
        duration: 2200 + (i % 5) * 350,
        size: 18 + (i % 4) * 6,
      })),
    [width]
  );

  return (
    <View style={styles.overlay}>
      {pieces.map((p, i) => (
        <Piece key={i} {...p} travelDistance={height * 0.5} />
      ))}

      <Animated.View style={[styles.card, coloredShadow(accent, 'xl'), { transform: [{ scale }] }]}>
        <Animated.Text style={[styles.trophy, { transform: [{ scale: bounce }] }]}>🏆</Animated.Text>
        <Text style={styles.title}>{title}</Text>
        {!!scoreLabel && <Text style={styles.score}>{scoreLabel}</Text>}
        <View style={[styles.rewardPill, { backgroundColor: accent }]}>
          <Text style={styles.rewardText}>+{reward} ⭐ earned!</Text>
        </View>

        <View style={styles.btns}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: accent }]}
            onPress={onReplay}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>{replayLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={onExit} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>{exitLabel}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
    card: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: colors.surface,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 30,
      paddingHorizontal: 26,
      alignItems: 'center',
    },
    trophy: { fontSize: 72, marginBottom: 10 },
    title: { fontSize: 24, fontWeight: '900', color: colors.textPrimary, marginBottom: 6, textAlign: 'center' },
    score: { fontSize: 15, fontWeight: '800', color: colors.textSecondary, marginBottom: 14, textAlign: 'center' },
    rewardPill: {
      borderRadius: Radius.full,
      paddingVertical: 8,
      paddingHorizontal: 20,
      marginBottom: 24,
      borderBottomWidth: 3,
      borderBottomColor: 'rgba(0,0,0,0.18)',
    },
    rewardText: { fontSize: 15, fontWeight: '900', color: '#FFFFFF' },
    btns: { width: '100%', gap: 10 },
    primaryBtn: {
      borderRadius: Radius.md,
      paddingVertical: 15,
      alignItems: 'center',
      borderBottomWidth: 4,
      borderBottomColor: 'rgba(0,0,0,0.2)',
    },
    primaryBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
    secondaryBtn: {
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: Radius.md,
      paddingVertical: 15,
      alignItems: 'center',
    },
    secondaryBtnText: { color: colors.textPrimary, fontWeight: '900', fontSize: 15 },
  });

export default CelebrationOverlay;
