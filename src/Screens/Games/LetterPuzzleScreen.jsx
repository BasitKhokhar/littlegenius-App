import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Header } from '../../Components/UI';
import { useThemeColors } from '../../Context/ThemeContext';
import { useTabBarClearance } from '../../Hooks';
import { useAuth } from '../../Context';
import SpeechEngine from '../../Utils/speechEngine';
import { SPEECH_PHRASES } from '../../Data/speechCatalog';
import { calculateStarReward } from '../../Utils/dataHelpers';
import { buildPuzzleRounds } from '../../Data/letterPuzzleData';

// ──────────────────────────────────────────────────────────────
// LetterPuzzleScreen — "find the missing letter" word game.
// A word with one letter missing (F _ S H) + its emoji; the child
// taps the right letter from 4 options. Correct → the letter pops
// into the slot; wrong → the row shakes and they try again.
// ──────────────────────────────────────────────────────────────

const ROUNDS = 10;

const LetterPuzzleScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const bottomPad = useTabBarClearance();
  const { addStars } = useAuth();
  const styles = makeStyles(colors);

  const [session, setSession] = useState(0);
  const rounds = useMemo(() => buildPuzzleRounds(ROUNDS), [session]);

  const [roundIdx, setRoundIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [solved, setSolved] = useState(false);       // current round solved
  const [firstTry, setFirstTry] = useState(true);     // no wrong taps yet this round
  const [finished, setFinished] = useState(false);

  const correctRef = useRef(0); // sync mirror of correctCount for end-of-game reward
  const shake = useRef(new Animated.Value(0)).current;
  const slotPop = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // gentle pulse on the empty slot
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const round = rounds[roundIdx];

  const runShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleOption = (letter) => {
    if (solved || finished) return;
    if (letter === round.answer) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      if (firstTry) {
        correctRef.current += 1;
        setCorrectCount((c) => c + 1);
      }
      setSolved(true);
      slotPop.setValue(0.3);
      Animated.spring(slotPop, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }).start();
      // Speak the plain word (no trailing "!") so it matches the pre-baked
      // alphabet word clip and plays in the teacher voice. speechKey lowercases,
      // so the uppercased puzzle word still resolves to the baked clip.
      SpeechEngine.speak(round.word, 'en-US');
      setTimeout(nextRound, 1200);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setFirstTry(false);
      runShake();
      SpeechEngine.speak(SPEECH_PHRASES.TRY_AGAIN, 'en-US');
    }
  };

  const nextRound = () => {
    if (roundIdx < rounds.length - 1) {
      setRoundIdx((i) => i + 1);
      setSolved(false);
      setFirstTry(true);
    } else {
      setFinished(true);
      const finalCount = correctRef.current;
      const reward = calculateStarReward(finalCount, ROUNDS, 3);
      addStars(reward);
      // Fixed praise phrase (pre-baked teacher voice); the score/stars show on
      // screen rather than being read as dynamic numbers.
      SpeechEngine.speak(SPEECH_PHRASES.PUZZLE_COMPLETE, 'en-US');
    }
  };

  const restart = () => {
    setSession((s) => s + 1);
    setRoundIdx(0);
    correctRef.current = 0;
    setCorrectCount(0);
    setSolved(false);
    setFirstTry(true);
    setFinished(false);
  };

  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-10, 10] });

  return (
    <View style={styles.container}>
      <Header title="Letter Puzzle 🧩" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]} showsVerticalScrollIndicator={false}>
        {finished ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>🏆</Text>
            <Text style={styles.resultTitle}>Puzzle Complete!</Text>
            <Text style={styles.resultScore}>First-try score: {correctCount} / {ROUNDS}</Text>
            <Text style={styles.resultReward}>+{calculateStarReward(correctCount, ROUNDS, 3)} ⭐ earned!</Text>
            <View style={styles.resultBtns}>
              <TouchableOpacity style={styles.primaryBtn} onPress={restart} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Play Again 🔁</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
                <Text style={styles.secondaryBtnText}>Back to Games ➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.progText}>Word {roundIdx + 1} of {ROUNDS}</Text>
            <Text style={styles.title}>Find the missing letter!</Text>

            {/* Illustration */}
            <View style={styles.emojiCard}>
              <Text style={styles.bigEmoji}>{round.emoji}</Text>
            </View>

            {/* Word tiles */}
            <Animated.View style={[styles.wordRow, { transform: [{ translateX: shakeX }] }]}>
              {round.word.split('').map((letter, i) => {
                const isBlank = i === round.blankIdx;
                if (isBlank) {
                  return (
                    <Animated.View
                      key={i}
                      style={[
                        styles.tile,
                        styles.blankTile,
                        solved && styles.solvedTile,
                        { transform: [{ scale: solved ? slotPop : pulse }] },
                      ]}
                    >
                      <Text style={[styles.tileText, solved ? styles.solvedTileText : styles.blankTileText]}>
                        {solved ? round.answer : '?'}
                      </Text>
                    </Animated.View>
                  );
                }
                return (
                  <View key={i} style={styles.tile}>
                    <Text style={styles.tileText}>{letter}</Text>
                  </View>
                );
              })}
            </Animated.View>

            {/* Options */}
            <View style={styles.optionsRow}>
              {round.options.map((letter, i) => (
                <TouchableOpacity
                  key={`${roundIdx}-${i}`}
                  style={styles.optionTile}
                  onPress={() => handleOption(letter)}
                  activeOpacity={0.8}
                  disabled={solved}
                >
                  <Text style={styles.optionText}>{letter}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {solved && <Text style={styles.praise}>🎉 {round.word}!</Text>}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const TILE = 52;

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, paddingTop: 20, alignItems: 'center', flexGrow: 1, justifyContent: 'center' },

  progText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  title: { fontSize: 20, fontWeight: '900', color: colors.textPrimary, marginBottom: 20 },

  emojiCard: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 3,
  },
  bigEmoji: { fontSize: 64 },

  wordRow: { flexDirection: 'row', gap: 8, marginBottom: 30 },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    borderBottomWidth: 4,
  },
  tileText: { fontSize: 24, fontWeight: '900', color: colors.textPrimary },
  blankTile: {
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: colors.surfaceAlt,
  },
  blankTileText: { color: colors.primary },
  solvedTile: {
    borderColor: colors.secondary,
    borderStyle: 'solid',
    backgroundColor: colors.secondary,
  },
  solvedTileText: { color: '#FFFFFF' },

  optionsRow: { flexDirection: 'row', gap: 12 },
  optionTile: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  optionText: { fontSize: 26, fontWeight: '900', color: '#FFFFFF' },

  praise: { fontSize: 18, fontWeight: '900', color: colors.secondary, marginTop: 20 },

  resultCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 28,
    alignItems: 'center',
  },
  resultEmoji: { fontSize: 64, marginBottom: 12 },
  resultTitle: { fontSize: 24, fontWeight: '900', color: colors.textPrimary, marginBottom: 6 },
  resultScore: { fontSize: 16, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  resultReward: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 22 },
  resultBtns: { width: '100%', gap: 10 },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
  secondaryBtn: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: { color: colors.textPrimary, fontWeight: '900', fontSize: 14 },
});

export default LetterPuzzleScreen;
