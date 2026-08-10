import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { quizPacksByModule } from '../../Data/quizPacksData';
import { getQuizBank } from '../../Utils/quizGenerators';
import { createQuizSession, QUIZ_QUESTION_COUNT, splitTrailingEmoji } from '../../Utils/quizHelpers';
import { calculateStarReward } from '../../Utils/dataHelpers';
import { gradientStageFromAccent } from '../../Utils/colorHelpers';
import { moduleColors } from '../../Theme/colors';
import { Header } from '../../Components/UI';
import { GameStage, CelebrationOverlay } from '../../Components/Games';
import SpeakButton from '../../Components/Common/SpeakButton';
import QuizOptionButton from '../../Components/Common/QuizOptionButton';
import { useAuth, useProgress } from '../../Context';
import SpeechEngine from '../../Utils/speechEngine';
import { SPEECH_PHRASES } from '../../Data/speechCatalog';
import { useTheme } from '../../Context/ThemeContext';

const ModuleQuizScreen = ({ navigation, route }) => {
  const { module, packId } = route.params;
  const { addStars } = useAuth();
  const { recordLessonComplete } = useProgress();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const pack = useMemo(() => {
    const config = quizPacksByModule[module];
    return config?.packs.find((p) => p.id === packId);
  }, [module, packId]);

  // Themed gradient stage, built from the pack's own accent colour so the
  // detail screen matches the gradient the pack's card showed in the list
  // (QuizListScreen colours each card from pack.color) — falling back to the
  // module-wide accent only when a pack has no colour of its own.
  const accent = pack?.color || moduleColors[module]?.solid || colors.primary;
  const stage = useMemo(
    () => ({ bg: gradientStageFromAccent(accent, isDark), accent, deco: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.16)' }),
    [accent, isDark]
  );

  const buildSession = useCallback(() => {
    if (!pack) return [];
    const bank = getQuizBank(pack.bankKey);
    return createQuizSession(bank, QUIZ_QUESTION_COUNT);
  }, [pack]);

  const [questions, setQuestions] = useState(buildSession);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameState, setGameState] = useState('playing');
  const [picked, setPicked] = useState(null); // selected option text, for right/wrong tile colouring

  const question = questions[currentIdx];
  // Question banks tuck the picture emoji on the end of `q` (see
  // quizGenerators.js) — pull it off so it can be shown BIG in its own
  // bubble instead of tiny and inline with the sentence.
  const { text: questionText, emoji: questionEmoji } = useMemo(
    () => splitTrailingEmoji(question?.q),
    [question]
  );

  // Read each question aloud as it appears — many players are still learning to
  // read, so a silent question is unanswerable for them. Declared above the
  // early return below to keep the hook order stable.
  useEffect(() => {
    if (gameState !== 'playing') return;
    const line = question?.speech;
    if (!line?.text) return;
    SpeechEngine.speak(line.text, line.language);
  }, [question, gameState]);

  // Never let a question keep talking after the player has left the screen.
  useEffect(() => () => { SpeechEngine.stop(); }, []);

  if (!pack || questions.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Quiz" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>No quiz questions available.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentQuestion = question;
  const total = questions.length;

  const handleAnswer = (selected) => {
    if (picked) return; // already answered this question — ignore extra taps
    setPicked(selected);
    const isCorrect = selected === currentQuestion.answer;
    const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
    Haptics.notificationAsync(
      isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});

    const advance = () => {
      setPicked(null);
      if (currentIdx < total - 1) {
        setCurrentIdx((prev) => prev + 1);
        return;
      }
      const reward = calculateStarReward(nextCorrect, total, 5);
      addStars(reward);
      recordLessonComplete({ xpAmount: reward, mod: module, packId, packTitle: pack.title });
      setGameState('finished');
      // Fixed praise phrase (pre-baked teacher voice); the exact score/stars are
      // shown on the results screen rather than read as dynamic numbers.
      SpeechEngine.speak(SPEECH_PHRASES.QUIZ_COMPLETE, 'en-US');
    };

    // Move on only once the feedback has finished speaking. A fixed delay would
    // cut it off, because starting the next question's audio stops whatever is
    // already playing — and "Not quite! The correct answer is …" is exactly the
    // line the child most needs to hear in full. SpeechEngine guarantees one of
    // onDone/onError fires, so `advance` runs exactly once either way; the short
    // pause is just breathing room before the next question.
    let advanced = false;
    const then = () => {
      if (advanced) return;
      advanced = true;
      setTimeout(advance, 400);
    };

    if (isCorrect) setCorrectCount(nextCorrect);
    if (isCorrect) {
      SpeechEngine.speak(SPEECH_PHRASES.CORRECT_BRILLIANT, 'en-US', { onDone: then, onError: then });
    } else {
      // Two pre-baked clips so the whole thing stays in the teacher voice:
      // "Not quite! The correct answer is" → the answer word (baked separately).
      const sayAnswer = () =>
        SpeechEngine.speak(`${currentQuestion.answer}`, currentQuestion.answerLanguage || 'en-US', {
          onDone: then,
          onError: then,
        });
      SpeechEngine.speak(SPEECH_PHRASES.INCORRECT_LEAD, 'en-US', {
        onDone: sayAnswer,
        onError: sayAnswer,
      });
    }
  };

  const restartQuiz = () => {
    setQuestions(buildSession());
    setCurrentIdx(0);
    setCorrectCount(0);
    setPicked(null);
    setGameState('playing');
  };

  return (
    <GameStage theme={stage}>
      <Header
        title={pack.title}
        showBack
        variant="transparent"
        onBackPress={() => navigation.goBack()}
      />

      {gameState === 'finished' ? (
        <CelebrationOverlay
          title="Quiz Completed!"
          scoreLabel={`Score: ${correctCount} / ${total}`}
          reward={calculateStarReward(correctCount, total, 5)}
          accent={stage.accent}
          onReplay={restartQuiz}
          onExit={() => navigation.goBack()}
          replayLabel="Try Again 🔁"
          exitLabel="Back to Quizzes ➔"
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.quizContent}>
            <Text style={styles.progText}>
              Question {currentIdx + 1} of {total}
            </Text>

            {!!questionEmoji && (
              <View style={styles.emojiBubble}>
                <Text style={styles.emojiGlyph}>{questionEmoji}</Text>
                {currentQuestion.speech?.text ? (
                  <View style={styles.emojiSpeakBadge}>
                    <SpeakButton
                      text={currentQuestion.speech.text}
                      language={currentQuestion.speech.language}
                      color={stage.accent}
                      variant="icon"
                      size="sm"
                      accessibilityLabel="Hear the question again"
                    />
                  </View>
                ) : null}
              </View>
            )}

            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{questionText}</Text>
              {!questionEmoji && currentQuestion.speech?.text ? (
                <View style={styles.questionAudio}>
                  <SpeakButton
                    text={currentQuestion.speech.text}
                    language={currentQuestion.speech.language}
                    color={stage.accent}
                    label="🔊 Hear again"
                    size="sm"
                  />
                </View>
              ) : null}
            </View>

            <View style={styles.optionsContainer}>
              {currentQuestion.shuffledOptions.map((option, idx) => {
                let state = 'idle';
                if (picked) {
                  if (option === currentQuestion.answer) state = 'correct';
                  else if (option === picked) state = 'wrong';
                  else state = 'dim';
                }
                return (
                  <QuizOptionButton
                    key={`${currentIdx}-${idx}-${option}`}
                    label={option}
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
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  quizContent: { alignItems: 'center', width: '100%' },
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
  // Big picture bubble — the emoji is the question's subject, so it gets
  // room to actually read at a glance instead of riding inline with text.
  emojiBubble: {
    width: 128,
    height: 128,
    borderRadius: 40,
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
  emojiGlyph: { fontSize: 76, lineHeight: 90, textAlign: 'center' },
  emojiSpeakBadge: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: 24,
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
  questionAudio: { marginTop: 14 },
  optionsContainer: { width: '100%', gap: 12 },
  btnRow: { width: '100%', gap: 12 },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  btnText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default ModuleQuizScreen;
