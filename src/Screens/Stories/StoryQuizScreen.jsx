import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { storiesData } from '../../Data/storiesData';
import islamicStoriesData from '../../Data/islamicStoriesData';
import { Header } from '../../Components/UI';
import { GameStage, CelebrationOverlay } from '../../Components/Games';
import SpeakButton from '../../Components/Common/SpeakButton';
import QuizOptionButton from '../../Components/Common/QuizOptionButton';
import { useAuth, useProgress } from '../../Context';
import { useTheme } from '../../Context/ThemeContext';
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

  const story =
    storiesData.find((s) => s.id === storyId) ||
    islamicStoriesData.find((s) => s.id === storyId);

  // Themed gradient stage built from the story's own accent colour — same
  // full-bleed "cartoon premium" treatment as the mini-games, so the quiz
  // still feels like part of the story instead of a plain form screen.
  const accent = story?.color || colors.primary;
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
      recordLessonComplete({ xpAmount: reward });
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
            <Text style={styles.progText}>Question {currentIdx + 1} of {questions.length}</Text>

            {!!story.emoji && (
              <View style={styles.emojiBubble}>
                <Text style={styles.emojiGlyph}>{story.emoji}</Text>
              </View>
            )}

            <View style={styles.questionCard}>
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

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, idx) => {
                let state = 'idle';
                if (picked) {
                  if (option.isCorrect) state = 'correct';
                  else if (option === picked) state = 'wrong';
                  else state = 'dim';
                }
                return (
                  <QuizOptionButton
                    key={`${round}-${currentIdx}-${idx}`}
                    label={option.text}
                    state={state}
                    disabled={!!picked}
                    onPress={() => handleAnswer(option)}
                    colors={colors}
                  />
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
  progText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 14,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  // The story's own emoji, shown big — a friendly anchor for the quiz that
  // doubles as a reminder of which story this is.
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
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: 26,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 26,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
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
  optionsContainer: {
    width: '100%',
    gap: 12,
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
