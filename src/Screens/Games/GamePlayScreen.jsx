import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  gamesList,
  patternData,
  memoryCardsList,
  oddOneOutData,
  colorMatchData,
  shapeQuizData,
} from '../../Data/gamesData';
import { useTheme } from '../../Context/ThemeContext';
import { getGameTheme } from '../../Theme/gameThemes';
import { useTabBarClearance } from '../../Hooks';
import { Header } from '../../Components/UI';
import { GameStage, Mascot, CelebrationOverlay } from '../../Components/Games';
import { useAuth } from '../../Context';
import SpeechEngine from '../../Utils/speechEngine';
import { SPEECH_PHRASES } from '../../Data/speechCatalog';
import { generateMathProblem, shuffleArray } from '../../Utils/dataHelpers';

// ──────────────────────────────────────────────────────────────
// GamePlayScreen — the premium "arcade" gameplay surface.
//
// Six mini-games share one polished shell: a live progress HUD
// (accent-themed bar + score chip + streak), juicy answer feedback
// (correct tiles flash green & pop, wrong tiles flash red & shake),
// haptics on every tap, and a celebratory animated victory screen.
// ──────────────────────────────────────────────────────────────

const MEMORY_PAIRS = memoryCardsList.length / 2;

// Games whose play area has no visual subject of its own — only these get the
// bobbing mascot above the question (Pattern Match & Math Race).
const SHOWS_MASCOT = new Set([1, 4]);

// ── Reusable answer tile (pattern / math / color / shape) ─────
const OptionTile = ({ value, display, textStyle, correctValue, picked, onPress, colors }) => {
  const scale = useRef(new Animated.Value(1)).current;

  let state = 'idle';
  if (picked) {
    if (value === correctValue) state = 'correct';
    else if (value === picked.value) state = 'wrong';
    else state = 'dim';
  }

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 24, bounciness: 10 }).start();

  const stateStyle =
    state === 'correct'
      ? { backgroundColor: colors.success, borderColor: colors.successDeep, borderBottomColor: colors.successDeep }
      : state === 'wrong'
      ? { backgroundColor: colors.error, borderColor: colors.errorDeep, borderBottomColor: colors.errorDeep }
      : null;

  const isFilled = state === 'correct' || state === 'wrong';

  return (
    <Animated.View style={{ width: '47%', opacity: state === 'dim' ? 0.45 : 1, transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={!!picked}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => onPress(value)}
        style={[optionStyles(colors).tile, stateStyle]}
      >
        <Text style={[optionStyles(colors).text, textStyle, isFilled && { color: '#FFFFFF' }]}>
          {display}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Memory card with flip pop ─────────────────────────────────
const MemoryCard = ({ card, isFlipped, isMatched, onPress, accent, colors }) => {
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFlipped) {
      pop.setValue(0.4);
      Animated.spring(pop, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
    }
  }, [isFlipped, pop]);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={memoStyles(colors).cardWrap}>
      {isFlipped ? (
        <Animated.View
          style={[
            memoStyles(colors).cardFace,
            isMatched ? memoStyles(colors).cardMatched : memoStyles(colors).cardOpen,
            { transform: [{ scale: pop }] },
          ]}
        >
          <Text style={memoStyles(colors).emoji}>{card.emoji}</Text>
        </Animated.View>
      ) : (
        <LinearGradient colors={accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={memoStyles(colors).cardFace}>
          <Text style={memoStyles(colors).back}>?</Text>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
};

const GamePlayScreen = ({ navigation, route }) => {
  const { gameId } = route.params;
  const { addStars } = useAuth();
  const { colors, isDark } = useTheme();
  const gt = getGameTheme(gameId, isDark);
  const bottomPad = useTabBarClearance();
  const styles = makeStyles(colors);

  const meta = gamesList.find((g) => g.id === gameId) || {};
  // Inner "vivid box" gradient (math/shape/pattern-mark/memory back) —
  // candy accent → the stage's deepest stop, so it harmonises with the
  // themed background in both light and dark.
  const accent = [gt.accent, gt.bg[gt.bg.length - 1]];

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, won
  const [picked, setPicked] = useState(null); // { value, correct } for option games
  const [session, setSession] = useState(0);

  // Per-game state
  const [patternIdx, setPatternIdx] = useState(0);
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [oddIdx, setOddIdx] = useState(0);
  const [oddPick, setOddPick] = useState(null);
  const [oddExplain, setOddExplain] = useState(null);
  const [mathIdx, setMathIdx] = useState(0);
  const [mathProblem, setMathProblem] = useState(null);
  const [colorIdx, setColorIdx] = useState(0);
  const [shapeIdx, setShapeIdx] = useState(0);

  // Animations
  const shake = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const victoryScale = useRef(new Animated.Value(0)).current;
  const trophyBounce = useRef(new Animated.Value(1)).current;

  // Stable, shuffled options (avoid reshuffle on every re-render)
  const colorOptions = useMemo(
    () => shuffleArray(colorMatchData[colorIdx].options),
    [colorIdx, session]
  );
  const shapeOptions = useMemo(
    () => shuffleArray(shapeQuizData[shapeIdx].options),
    [shapeIdx, session]
  );

  useEffect(() => {
    initGame();
  }, [gameId]);

  const initGame = () => {
    setScore(0);
    setStreak(0);
    setPicked(null);
    setGameState('playing');
    victoryScale.setValue(0);
    setSession((s) => s + 1);
    if (gameId === 1) {
      setPatternIdx(0);
      SpeechEngine.speak(SPEECH_PHRASES.GAME_PATTERN, 'en-US');
    } else if (gameId === 2) {
      const shuffled = shuffleArray(memoryCardsList).map((emoji, index) => ({ id: index, emoji }));
      setCards(shuffled);
      setSelectedCards([]);
      setMatchedCards([]);
      SpeechEngine.speak(SPEECH_PHRASES.GAME_MEMORY, 'en-US');
    } else if (gameId === 3) {
      setOddIdx(0);
      setOddPick(null);
      setOddExplain(null);
      SpeechEngine.speak(SPEECH_PHRASES.GAME_ODD, 'en-US');
    } else if (gameId === 4) {
      setMathIdx(0);
      setMathProblem(generateMathProblem('+'));
      SpeechEngine.speak(SPEECH_PHRASES.GAME_MATH, 'en-US');
    } else if (gameId === 5) {
      setColorIdx(0);
      SpeechEngine.speak(SPEECH_PHRASES.GAME_COLOR, 'en-US');
    } else if (gameId === 6) {
      setShapeIdx(0);
      SpeechEngine.speak(SPEECH_PHRASES.GAME_SHAPE, 'en-US');
    }
  };

  // ── Progress (drives the HUD bar) ───────────────────────────
  const getProgress = () => {
    if (gameId === 1) return { current: patternIdx, total: patternData.length };
    if (gameId === 2) return { current: matchedCards.length / 2, total: MEMORY_PAIRS };
    if (gameId === 3) return { current: oddIdx, total: oddOneOutData.length };
    if (gameId === 4) return { current: mathIdx, total: 10 };
    if (gameId === 5) return { current: colorIdx, total: colorMatchData.length };
    return { current: shapeIdx, total: shapeQuizData.length };
  };
  const { current: progCurrent, total: progTotal } = getProgress();

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progTotal ? progCurrent / progTotal : 0,
      duration: 420,
      useNativeDriver: false,
    }).start();
  }, [progCurrent, progTotal, progressAnim]);

  // ── Feedback helpers ────────────────────────────────────────
  const runShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const onCorrect = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setScore((s) => s + 1);
    setStreak((s) => s + 1);
  };
  const onWrong = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    setStreak(0);
    runShake();
  };

  const handleGameWin = (starsReward = 15) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setGameState('won');
    addStars(starsReward);
    victoryScale.setValue(0);
    Animated.spring(victoryScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(trophyBounce, { toValue: 1.12, duration: 620, useNativeDriver: true }),
        Animated.timing(trophyBounce, { toValue: 1, duration: 620, useNativeDriver: true }),
      ])
    ).start();
    // Fixed praise phrase (pre-baked teacher voice); the stars earned show on
    // screen rather than being read as a dynamic number.
    SpeechEngine.speak(SPEECH_PHRASES.GAME_WON, 'en-US');
  };

  // ── Generic option-game answer (pattern / math / color / shape) ──
  const answerOption = (selected, correctValue, advance) => {
    if (picked) return;
    const correct = selected === correctValue;
    setPicked({ value: selected, correct });
    if (correct) {
      onCorrect();
      SpeechEngine.speak(SPEECH_PHRASES.CORRECT_NICE_JOB, 'en-US');
      setTimeout(() => {
        setPicked(null);
        advance();
      }, 700);
    } else {
      onWrong();
      SpeechEngine.speak(SPEECH_PHRASES.OOPS_TRY_AGAIN, 'en-US');
      setTimeout(() => setPicked(null), 750);
    }
  };

  // ── Pattern ─────────────────────────────────────────────────
  const handlePatternAnswer = (selected) => {
    const current = patternData[patternIdx];
    answerOption(selected, current.answer, () => {
      if (patternIdx < patternData.length - 1) setPatternIdx((p) => p + 1);
      else handleGameWin(15);
    });
  };

  // ── Memory ──────────────────────────────────────────────────
  const handleCardPress = (cardIndex) => {
    if (selectedCards.length >= 2 || selectedCards.includes(cardIndex) || matchedCards.includes(cardIndex)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const newSelected = [...selectedCards, cardIndex];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const firstCard = cards[newSelected[0]];
      const secondCard = cards[newSelected[1]];
      if (firstCard.emoji === secondCard.emoji) {
        onCorrect();
        setMatchedCards((prev) => {
          const nextMatched = [...prev, newSelected[0], newSelected[1]];
          if (nextMatched.length === cards.length) setTimeout(() => handleGameWin(15), 550);
          return nextMatched;
        });
        setSelectedCards([]);
        SpeechEngine.speak(SPEECH_PHRASES.MATCHED, 'en-US');
      } else {
        onWrong();
        SpeechEngine.speak(SPEECH_PHRASES.NO_MATCH, 'en-US');
        setTimeout(() => setSelectedCards([]), 900);
      }
    }
  };

  // ── Odd One Out ─────────────────────────────────────────────
  const handleOddAnswer = (idx) => {
    if (oddExplain !== null || oddPick !== null) return;
    const current = oddOneOutData[oddIdx];
    setOddPick(idx);
    if (idx === current.odd) {
      onCorrect();
      setOddExplain(current.explain);
      SpeechEngine.speak(`Excellent! ${current.explain}`, 'en-US');
    } else {
      onWrong();
      SpeechEngine.speak(SPEECH_PHRASES.TRY_AGAIN, 'en-US');
      setTimeout(() => setOddPick(null), 750);
    }
  };

  const nextOddQuestion = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setOddExplain(null);
    setOddPick(null);
    if (oddIdx < oddOneOutData.length - 1) setOddIdx((p) => p + 1);
    else handleGameWin(15);
  };

  // ── Math ────────────────────────────────────────────────────
  const handleMathAnswer = (selected) => {
    answerOption(selected, mathProblem.answer, () => {
      if (mathIdx < 9) {
        setMathIdx((p) => p + 1);
        setMathProblem(generateMathProblem(Math.random() > 0.5 ? '+' : '-'));
      } else {
        handleGameWin(15);
      }
    });
  };

  // ── Color ───────────────────────────────────────────────────
  const handleColorAnswer = (selected) => {
    const current = colorMatchData[colorIdx];
    answerOption(selected, current.name, () => {
      if (colorIdx < colorMatchData.length - 1) setColorIdx((p) => p + 1);
      else handleGameWin(15);
    });
  };

  // ── Shape ───────────────────────────────────────────────────
  const handleShapeAnswer = (selected) => {
    const current = shapeQuizData[shapeIdx];
    answerOption(selected, current.name, () => {
      if (shapeIdx < shapeQuizData.length - 1) setShapeIdx((p) => p + 1);
      else handleGameWin(15);
    });
  };

  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-9, 9] });

  // ── Renderers ───────────────────────────────────────────────
  const renderPatternGame = () => {
    const current = patternData[patternIdx];
    return (
      <View style={styles.gameContent}>
        <Text style={styles.questionText}>What comes next?</Text>
        <Text style={styles.hint}>Look at the pattern and pick the missing piece</Text>

        <Animated.View style={[styles.patternBox, { transform: [{ translateX: shakeX }] }]}>
          {current.pattern.map((emoji, idx) => (
            <Text key={idx} style={styles.patternEmoji}>{emoji}</Text>
          ))}
          <LinearGradient colors={accent} style={styles.questionMarkBox}>
            <Text style={styles.questionMark}>?</Text>
          </LinearGradient>
        </Animated.View>

        <View style={styles.optionsGrid}>
          {current.options.map((option, idx) => (
            <OptionTile
              key={`${patternIdx}-${idx}`}
              value={option}
              display={option}
              textStyle={styles.optionEmoji}
              correctValue={current.answer}
              picked={picked}
              onPress={handlePatternAnswer}
              colors={colors}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderMemoryGame = () => (
    <View style={styles.gameContent}>
      <Text style={styles.questionText}>Match all the pairs!</Text>
      <Text style={styles.hint}>Pairs found: {matchedCards.length / 2} / {MEMORY_PAIRS}</Text>

      <View style={styles.memoryGrid}>
        {cards.map((card, index) => (
          <MemoryCard
            key={card.id}
            card={card}
            isFlipped={selectedCards.includes(index) || matchedCards.includes(index)}
            isMatched={matchedCards.includes(index)}
            onPress={() => handleCardPress(index)}
            accent={accent}
            colors={colors}
          />
        ))}
      </View>
    </View>
  );

  const renderOddGame = () => {
    const current = oddOneOutData[oddIdx];
    return (
      <View style={styles.gameContent}>
        <Text style={styles.questionText}>Find the odd one out!</Text>
        <Text style={styles.hint}>Tap the item that does not belong</Text>

        <Animated.View style={[styles.oddGrid, { transform: [{ translateX: shakeX }] }]}>
          {current.items.map((emoji, idx) => {
            const answered = oddExplain !== null || oddPick !== null;
            const isCorrect = idx === current.odd;
            let stateStyle = null;
            if (answered && isCorrect && (oddPick === idx || oddExplain !== null)) stateStyle = styles.oddCorrect;
            else if (oddPick === idx && !isCorrect) stateStyle = styles.oddWrong;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.oddCard, stateStyle]}
                onPress={() => handleOddAnswer(idx)}
                activeOpacity={0.85}
                disabled={oddExplain !== null}
              >
                <Text style={styles.oddEmoji}>{emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {oddExplain && (
          <LinearGradient colors={accent} style={styles.explainCard}>
            <Text style={styles.explainText}>🎉 {oddExplain}</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={nextOddQuestion} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>Next ➔</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}
      </View>
    );
  };

  const renderMathGame = () => {
    if (!mathProblem) return null;
    return (
      <View style={styles.gameContent}>
        <Text style={styles.questionText}>Solve the math race!</Text>
        <Text style={styles.hint}>Tap the correct answer</Text>

        <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
          <LinearGradient colors={accent} style={styles.mathBox}>
            <Text style={styles.mathText}>{mathProblem.question} = ?</Text>
          </LinearGradient>
        </Animated.View>

        <View style={styles.optionsGrid}>
          {mathProblem.options.map((option, idx) => (
            <OptionTile
              key={`${mathIdx}-${idx}`}
              value={option}
              display={String(option)}
              textStyle={styles.optionNumber}
              correctValue={mathProblem.answer}
              picked={picked}
              onPress={handleMathAnswer}
              colors={colors}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderColorGame = () => {
    const current = colorMatchData[colorIdx];
    return (
      <View style={styles.gameContent}>
        <Text style={styles.questionText}>What color is this?</Text>
        <Text style={styles.hint}>Pick the right color name</Text>

        <Animated.View style={[styles.colorBox, { backgroundColor: current.color, transform: [{ translateX: shakeX }] }]}>
          <Text style={styles.colorEmoji}>{current.emoji}</Text>
        </Animated.View>

        <View style={styles.optionsGrid}>
          {colorOptions.map((option, idx) => (
            <OptionTile
              key={`${colorIdx}-${idx}`}
              value={option}
              display={option}
              textStyle={styles.optionWord}
              correctValue={current.name}
              picked={picked}
              onPress={handleColorAnswer}
              colors={colors}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderShapeGame = () => {
    const current = shapeQuizData[shapeIdx];
    return (
      <View style={styles.gameContent}>
        <Text style={styles.questionText}>What shape is this?</Text>
        <Text style={styles.hint}>Name the shape below</Text>

        <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
          <LinearGradient colors={accent} style={styles.shapeBox}>
            <Text style={styles.shapeEmoji}>{current.shape}</Text>
            <Text style={styles.shapeUrdu}>{current.urdu}</Text>
          </LinearGradient>
        </Animated.View>

        <View style={styles.optionsGrid}>
          {shapeOptions.map((option, idx) => (
            <OptionTile
              key={`${shapeIdx}-${idx}`}
              value={option}
              display={option}
              textStyle={styles.optionWord}
              correctValue={current.name}
              picked={picked}
              onPress={handleShapeAnswer}
              colors={colors}
            />
          ))}
        </View>
      </View>
    );
  };

  const getHeaderTitle = () => {
    if (gameId === 1) return 'Pattern Match';
    if (gameId === 2) return 'Memory Pairs';
    if (gameId === 3) return 'Odd One Out';
    if (gameId === 4) return 'Math Race';
    if (gameId === 5) return 'Color Match';
    return 'Shape Quiz';
  };

  const barWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <GameStage theme={gt}>
      <Header title={getHeaderTitle()} showBack variant="transparent" onBackPress={() => navigation.goBack()} />

      {gameState === 'won' ? (
        <CelebrationOverlay
          title="Awesome Job!"
          scoreLabel={`You got ${score} correct in ${getHeaderTitle()}`}
          reward={15}
          accent={gt.accent}
          onReplay={initGame}
          onExit={() => navigation.goBack()}
        />
      ) : (
      <>
      {/* Live HUD (floating glass panel over the themed stage) */}
      {(
        <View style={styles.hud}>
          <View style={styles.hudRow}>
            <View style={styles.hudChip}>
              <Text style={styles.hudChipEmoji}>{meta.icon}</Text>
              <Text style={styles.hudChipLabel}>{Math.round(progCurrent)} / {progTotal}</Text>
            </View>
            <View style={styles.hudRight}>
              {streak >= 2 && (
                <View style={styles.streakChip}>
                  <Text style={styles.streakText}>🔥 {streak}</Text>
                </View>
              )}
              <View style={styles.scoreChip}>
                <Text style={styles.scoreText}>⭐ {score}</Text>
              </View>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: barWidth }]}>
              <LinearGradient
                colors={accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}>
        {/* The mascot only earns its space where the puzzle itself has no
            visual subject. Memory / Odd One Out / Color / Shape already show
            big art of their own, so a second floating emoji just crowds them. */}
        {SHOWS_MASCOT.has(gameId) && (
          <Mascot emoji={gt.mascot} size={58} glow={gt.deco} style={styles.mascot} />
        )}
        {gameId === 1 && renderPatternGame()}
        {gameId === 2 && renderMemoryGame()}
        {gameId === 3 && renderOddGame()}
        {gameId === 4 && renderMathGame()}
        {gameId === 5 && renderColorGame()}
        {gameId === 6 && renderShapeGame()}
      </ScrollView>
      </>
      )}
    </GameStage>
  );
};

// ── Shared option-tile styles (need colors) ───────────────────
const optionStyles = (colors) =>
  StyleSheet.create({
    tile: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.border,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      borderBottomWidth: 5,
      borderBottomColor: 'rgba(0,0,0,0.12)',
    },
    text: { fontSize: 30, fontWeight: '900', color: colors.textPrimary },
  });

const memoStyles = (colors) =>
  StyleSheet.create({
    cardWrap: { width: '22%', aspectRatio: 0.92 },
    cardFace: {
      flex: 1,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 3,
    },
    cardOpen: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.borderStrong,
    },
    cardMatched: {
      backgroundColor: colors.surface,
      borderWidth: 2.5,
      borderColor: colors.success,
    },
    emoji: { fontSize: 26 },
    back: { fontSize: 26, fontWeight: '900', color: 'rgba(255,255,255,0.9)' },
  });

const makeStyles = (colors) =>
  StyleSheet.create({
    mascot: { alignSelf: 'center', marginBottom: 8 },

    // HUD — floating glass panel over the themed stage
    hud: {
      marginHorizontal: 16,
      marginTop: 10,
      marginBottom: 4,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 14,
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.16,
      shadowRadius: 12,
    },
    hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    hudChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 12,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    hudChipEmoji: { fontSize: 15 },
    hudChipLabel: { fontSize: 13, fontWeight: '900', color: colors.textPrimary, letterSpacing: 0.3 },
    hudRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    streakChip: {
      backgroundColor: 'rgba(245,158,11,0.16)',
      borderRadius: 12,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    streakText: { fontSize: 13, fontWeight: '900', color: colors.warning },
    scoreChip: {
      backgroundColor: 'rgba(99,102,241,0.14)',
      borderRadius: 12,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    scoreText: { fontSize: 13, fontWeight: '900', color: colors.primary },
    progressTrack: {
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.surfaceSunken,
      overflow: 'hidden',
    },
    progressFill: { height: '100%', borderRadius: 6, overflow: 'hidden' },

    scrollContent: {
      paddingHorizontal: 16,
      paddingVertical: 24,
      flexGrow: 1,
      justifyContent: 'center',
    },
    gameContent: { alignItems: 'center', width: '100%' },
    questionText: {
      fontSize: 24,
      fontWeight: '900',
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 6,
      letterSpacing: -0.4,
      textShadowColor: 'rgba(0,0,0,0.22)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    hint: {
      fontSize: 13,
      fontWeight: '800',
      color: 'rgba(255,255,255,0.92)',
      marginBottom: 26,
      textAlign: 'center',
      textShadowColor: 'rgba(0,0,0,0.18)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },

    // Pattern
    patternBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: colors.border,
      paddingVertical: 18,
      paddingHorizontal: 20,
      marginBottom: 32,
      gap: 10,
      elevation: 2,
    },
    patternEmoji: { fontSize: 34 },
    questionMarkBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    questionMark: { fontSize: 26, fontWeight: '900', color: '#FFFFFF' },

    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      width: '100%',
      rowGap: 14,
    },
    optionEmoji: { fontSize: 32 },
    optionNumber: { fontSize: 26, fontWeight: '900' },
    optionWord: { fontSize: 17, fontWeight: '900' },

    // Memory
    memoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      width: '100%',
      justifyContent: 'center',
    },

    // Odd
    oddGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      width: '100%',
      justifyContent: 'center',
      marginBottom: 24,
    },
    oddCard: {
      width: '40%',
      height: 112,
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
      borderBottomWidth: 5,
      borderBottomColor: 'rgba(0,0,0,0.12)',
    },
    oddCorrect: { backgroundColor: colors.success, borderColor: colors.successDeep, borderBottomColor: colors.successDeep },
    oddWrong: { backgroundColor: colors.error, borderColor: colors.errorDeep, borderBottomColor: colors.errorDeep },
    oddEmoji: { fontSize: 48 },
    explainCard: {
      width: '100%',
      borderRadius: 20,
      padding: 18,
      alignItems: 'center',
      gap: 12,
      elevation: 3,
    },
    explainText: { fontSize: 15, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', lineHeight: 20 },
    nextBtn: {
      backgroundColor: 'rgba(255,255,255,0.25)',
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 14,
    },
    nextBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },

    // Math
    mathBox: {
      borderRadius: 24,
      paddingVertical: 28,
      paddingHorizontal: 48,
      marginBottom: 32,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
    },
    mathText: { fontSize: 42, fontWeight: '900', color: '#FFFFFF' },

    // Color
    colorBox: {
      width: 130,
      height: 130,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
      borderWidth: 4,
      borderColor: '#FFFFFF',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
    },
    colorEmoji: { fontSize: 52 },

    // Shape — the glyph IS the question here, so it gets the space the
    // removed mascot used to take.
    shapeBox: {
      borderRadius: 32,
      paddingVertical: 30,
      paddingHorizontal: 56,
      marginBottom: 32,
      alignItems: 'center',
      elevation: 4,
    },
    shapeEmoji: { fontSize: 128, lineHeight: 148, marginBottom: 2 },
    shapeUrdu: { fontSize: 22, fontWeight: '800', color: 'rgba(255,255,255,0.92)' },
  });

export default GamePlayScreen;
