import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { storiesData } from '../../Data/storiesData';
import islamicStoriesData from '../../Data/islamicStoriesData';
import { getStoryHeroImage } from '../../Data/storyImages';
import { Header } from '../../Components/UI';
import { GameStage, CelebrationOverlay } from '../../Components/Games';
import SpeakButton from '../../Components/Common/SpeakButton';
import QuizOptionButton from '../../Components/Common/QuizOptionButton';
import { useAuth, useProgress } from '../../Context';
import { useTheme } from '../../Context/ThemeContext';
import { coloredShadow } from '../../Theme';
import { getStoryAccent } from '../../Utils/storyColors';
import SpeechEngine from '../../Utils/speechEngine';
import { SPEECH_PHRASES } from '../../Data/speechCatalog';
import { calculateStarReward, shuffleArray } from '../../Utils/dataHelpers';
import { gradientStageFromAccent } from '../../Utils/colorHelpers';

const StoryQuizScreen = ({ navigation, route }) => {
  const { story: storyId } = route.params;
  const { addStars } = useAuth();
  const { recordLessonComplete } = useProgress();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const moralIdx = storiesData.findIndex((s) => s.id === storyId);
  const isIslamicStory = moralIdx === -1;
  const storyIdx = isIslamicStory ? islamicStoriesData.findIndex((s) => s.id === storyId) : moralIdx;
  const story = storyIdx === -1 ? null : (isIslamicStory ? islamicStoriesData[storyIdx] : storiesData[storyIdx]);
  // Same banner artwork the story's own detail screen shows, so the quiz
  // still feels like a continuation of the story instead of a bare form.
  const heroImage = storyIdx === -1 ? null : getStoryHeroImage(storiesData.length, isIslamicStory, storyIdx);

  // Themed gradient stage built from the same per-story accent colour the
  // detail screen's hero/card use (cycled by list position, not the data
  // file's own `color` field) — so the quiz stays visually the same story
  // instead of switching palettes.
  const accent = storyIdx !== -1 ? getStoryAccent(storyIdx).color : colors.primary;
  const stage = useMemo(
    () => ({ bg: gradientStageFromAccent(accent, isDark), accent, deco: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.16)' }),
    [accent, isDark]
  );

  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, finished
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState(null); // selected option, for right/wrong tile colouring

  // Fresh question order + shuffled option positions every round.
  // Source data stores the answer as an option INDEX, so remap each
  // option to { text, isCorrect } before shuffling.
  const questions = useMemo(() => {
    const quiz = story?.quiz || [];
    return shuffleArray(quiz).map((q) => ({
      q: q.q,
      options: shuffleArray(q.options.map((text, i) => ({ text, isCorrect: i === q.answer }))),
    }));
  }, [story, round]);

  const question = questions[currentIdx];

  // Read each question aloud as it appears, and stop on the way out. Declared
  // above the early return below to keep the hook order stable.
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (question?.q) SpeechEngine.speak(question.q, 'en-US');
  }, [question, gameState]);

  useEffect(() => () => { SpeechEngine.stop(); }, []);

  if (!story || questions.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Story Quiz" showBack={true} onBackPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No quiz questions found for this story! 🚀</Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentQuestion = question;

  const handleAnswer = (option) => {
    if (picked) return; // already answered this question — ignore extra taps
    setPicked(option);
    const isCorrect = option.isCorrect;
    if (isCorrect) setCorrectCount(prev => prev + 1);
    Haptics.notificationAsync(
      isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});

    const advance = () => {
      setPicked(null);
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(prev => prev + 1);
        return;
      }
      const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
      const reward = calculateStarReward(finalCorrect, questions.length, 5);
      addStars(reward);
      recordLessonComplete({ xpAmount: reward, mod: 'stories', packId: story.id, packTitle: story.title });
      setGameState('finished');
      // Fixed praise phrase (pre-baked teacher voice); the score/stars show on
      // the results screen instead of being read as dynamic numbers.
      SpeechEngine.speak(SPEECH_PHRASES.STORY_QUIZ_COMPLETE, 'en-US');
    };

    // Wait for the feedback to finish before moving on — starting the next
    // question's audio would otherwise cut off the answer the child needs to
    // hear. SpeechEngine settles exactly once, so `advance` runs once.
    let advanced = false;
    const then = () => {
      if (advanced) return;
      advanced = true;
      setTimeout(advance, 400);
    };

    const correctText = currentQuestion.options.find(o => o.isCorrect)?.text;
    if (isCorrect) {
      SpeechEngine.speak(SPEECH_PHRASES.CORRECT_EXCELLENT, 'en-US', { onDone: then, onError: then });
    } else {
      // Two pre-baked clips so it stays in the teacher voice: the fixed lead-in
      // "Not quite! The correct answer is" → the correct option text (baked).
      const sayAnswer = () =>
        SpeechEngine.speak(`${correctText ?? ''}`, 'en-US', { onDone: then, onError: then });
      SpeechEngine.speak(SPEECH_PHRASES.INCORRECT_LEAD, 'en-US', {
        onDone: sayAnswer,
        onError: sayAnswer,
      });
    }
  };

  const restartQuiz = () => {
    setRound(r => r + 1); // regenerates question + option shuffle
    setCurrentIdx(0);
    setCorrectCount(0);
    setPicked(null);
    setGameState('playing');
  };

  return (
    <GameStage theme={stage}>
      <Header
        title={`${story.title} Quiz`}
        showBack={true}
        variant="transparent"
        onBackPress={() => navigation.goBack()}
      />

      {gameState === 'finished' ? (
        <CelebrationOverlay
          title="Quiz Completed!"
          scoreLabel={`Score: ${correctCount} / ${questions.length}`}
          reward={calculateStarReward(correctCount, questions.length, 5)}
          accent={stage.accent}
          onReplay={restartQuiz}
          onExit={() => navigation.goBack()}
          replayLabel="Try Again 🔁"
          exitLabel="Back to Stories ➔"
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.quizContent}>
            {heroImage ? (
              <View style={[styles.heroSquareWrap, coloredShadow(stage.accent, 'lg')]}>
                <Image source={heroImage} style={styles.heroSquareImage} resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.68)']}
                  locations={[0, 0.55, 1]}
                  style={styles.heroSquareOverlay}
                />
                <View style={styles.heroSquareRing} pointerEvents="none" />
                <View style={styles.heroSquareBadge}>
                  <Text style={styles.heroSquareBadgeText} numberOfLines={2}>{story.emoji} {story.title}</Text>
                </View>
              </View>
            ) : (
              !!story.emoji && (
                <View style={styles.emojiBubble}>
                  <Text style={styles.emojiGlyph}>{story.emoji}</Text>
                </View>
              )
            )}

            <View style={styles.progressRow}>
              <Text style={styles.progText}>Question {currentIdx + 1} of {questions.length}</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.max(((currentIdx + (picked ? 1 : 0)) / questions.length) * 100, 6)}%` },
                  ]}
                />
              </View>
            </View>

            <View style={[styles.questionCard, coloredShadow(stage.accent, 'md')]}>
              <View style={[styles.questionCardDecor, { backgroundColor: stage.accent + '14' }]} pointerEvents="none" />
              <View style={[styles.questionBadge, { backgroundColor: stage.accent }]}>
                <Text style={styles.questionBadgeText}>Q{currentIdx + 1}</Text>
              </View>
              <Text style={styles.questionText}>{currentQuestion.q}</Text>
              <View style={styles.questionAudio}>
                <SpeakButton
                  text={currentQuestion.q}
                  language="en-US"
                  color={stage.accent}
                  label="🔊 Hear again"
                  size="sm"
                />
              </View>
            </View>

            <View style={styles.optionsGrid}>
              {currentQuestion.options.map((option, idx) => {
                let state = 'idle';
                if (picked) {
                  if (option.isCorrect) state = 'correct';
                  else if (option === picked) state = 'wrong';
                  else state = 'dim';
                }
                return (
                  <View key={`${round}-${currentIdx}-${idx}`} style={styles.optionCell}>
                    <QuizOptionButton
                      label={option.text}
                      state={state}
                      disabled={!!picked}
                      onPress={() => handleAnswer(option)}
                      colors={colors}
                      compact
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}
    </GameStage>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  quizContent: {
    alignItems: 'center',
    width: '100%',
  },
  // Same banner artwork as the story detail screen — the source art is
  // square, so it's framed as a squared, medallion-style hero (not
  // stretched into a wide banner) with a plain dark fade for the caption.
  heroSquareWrap: {
    width: 178,
    height: 178,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 18,
    justifyContent: 'flex-end',
  },
  heroSquareImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroSquareOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroSquareRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  heroSquareBadge: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  heroSquareBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 17,
  },
  // The story's own emoji, shown big — fallback anchor for stories with no
  // banner artwork left to assign.
  emojiBubble: {
    width: 112,
    height: 112,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  emojiGlyph: { fontSize: 64, lineHeight: 76, textAlign: 'center' },
  progressRow: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 18,
  },
  progText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: 26,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 26,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  questionCardDecor: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  questionBadge: {
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  questionBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  questionText: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
  },
  questionAudio: {
    marginTop: 14,
    alignItems: 'center',
  },
  // 2x2 grid instead of a tall stack — keeps all four options on screen
  // together (and readable at a glance) instead of forcing a scroll.
  optionsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  optionCell: {
    width: '48%',
  },
  btnRow: {
    width: '100%',
    gap: 12,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  btnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});

export default StoryQuizScreen;
