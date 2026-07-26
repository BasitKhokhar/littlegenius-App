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
import { GameStage, Mascot, CelebrationOverlay } from '../../Components/Games';
import { useTheme } from '../../Context/ThemeContext';
import { getGameTheme } from '../../Theme/gameThemes';
import { useTabBarClearance } from '../../Hooks';
import { useAuth } from '../../Context';
import SpeechEngine from '../../Utils/speechEngine';
import { SPEECH_PHRASES } from '../../Data/speechCatalog';
import { calculateStarReward } from '../../Utils/dataHelpers';
import { buildPuzzleRounds } from '../../Data/letterPuzzleData';

// ──────────────────────────────────────────────────────────────
// LetterPuzzleScreen — "find the missing letter" word game, now on a
// bright cartoon "ocean" stage (light & dark aware). A word with one
// letter missing (F _ S H) + its bouncing picture; the child taps the
// right letter from 4 candy buttons. Correct → the letter pops into the
// slot; wrong → the row shakes and they try again.
// ──────────────────────────────────────────────────────────────

const ROUNDS = 10;

const LetterPuzzleScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const gt = getGameTheme(10, isDark); // ocean / fish
  const bottomPad = useTabBarClearance();
  const { addStars } = useAuth();
  const styles = makeStyles(colors, gt);

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
  const picPop = useRef(new Animated.Value(1)).current;

  // Each new word's picture springs in, so the big emoji reads as the star of
  // the round rather than a static image.
  React.useEffect(() => {
    picPop.setValue(0.55);
    Animated.spring(picPop, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start();
  }, [roundIdx, session, picPop]);

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => { });
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
    <GameStage theme={gt} wave>
      <Header title="Letter Puzzle 🧩" showBack variant="transparent" onBackPress={() => navigation.goBack()} />

      {finished ? (
        <CelebrationOverlay
          title="Puzzle Complete!"
          scoreLabel={`First-try score: ${correctCount} / ${ROUNDS}`}
          reward={calculateStarReward(correctCount, ROUNDS, 3)}
          accent={gt.accent}
          onReplay={restart}
          onExit={() => navigation.goBack()}
        />
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]} showsVerticalScrollIndicator={false}>
          {/* Round counter + prompt sit right under the header — no dead
              space above them — and the picture takes the room that frees up. */}
          <View style={styles.progPill}>
            <Text style={styles.progText}>Word {roundIdx + 1} of {ROUNDS}</Text>
            <View style={styles.progDots}>
              {Array.from({ length: ROUNDS }, (_, i) => (
                <View key={i} style={[styles.progDot, i <= roundIdx && styles.progDotOn]} />
              ))}
            </View>
          </View>
          <Text style={styles.title}>Find the missing letter!</Text>

          {/* Bouncing word picture */}
          <View style={{ alignItems: 'center', marginBottom: 30,marginTop: 24 }}>
            <Animated.View style={{ transform: [{ scale: picPop }] }}>
              <Mascot emoji={round.emoji} size={132} glow={gt.deco} style={styles.mascot} />
            </Animated.View>
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

          {solved && (
            <View style={styles.praisePill}>
              <Text style={styles.praise}>🎉 {round.word}!</Text>
            </View>
          )}
        </ScrollView>
      )}
    </GameStage>
  );
};

const TILE = 54;

const makeStyles = (colors, gt) => StyleSheet.create({
  // Top-aligned (not centred) so the round counter sits straight under the
  // header instead of floating in the middle with dead space above it.
  content: { paddingHorizontal: 16, paddingTop: 4, alignItems: 'center' },

  progPill: {
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  progText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  progDots: { flexDirection: 'row', gap: 5 },
  progDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  progDotOn: { backgroundColor: '#FFFFFF' },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  mascot: { marginBottom: 26, marginTop: 14 },

  wordRow: { flexDirection: 'row', gap: 8, marginBottom: 30 },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    borderBottomWidth: 5,
    borderBottomColor: colors.borderStrong,
  },
  tileText: { fontSize: 26, fontWeight: '900', color: colors.textPrimary },
  blankTile: {
    borderColor: gt.accent,
    borderStyle: 'dashed',
    borderBottomColor: gt.accent,
    backgroundColor: colors.surfaceAlt,
  },
  blankTileText: { color: gt.accent },
  solvedTile: {
    borderColor: colors.successDeep,
    borderStyle: 'solid',
    borderBottomColor: colors.successDeep,
    backgroundColor: colors.success,
  },
  solvedTileText: { color: '#FFFFFF' },

  optionsRow: { flexDirection: 'row', gap: 12 },
  optionTile: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: gt.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: gt.accent,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(0,0,0,0.22)',
  },
  optionText: { fontSize: 28, fontWeight: '900', color: '#FFFFFF' },

  praisePill: {
    marginTop: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  praise: { fontSize: 18, fontWeight: '900', color: colors.successDeep },
});

export default LetterPuzzleScreen;
