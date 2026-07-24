import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { quizPacksByModule } from '../../Data/quizPacksData';
import { getQuizBank } from '../../Utils/quizGenerators';
import { createQuizSession, QUIZ_QUESTION_COUNT } from '../../Utils/quizHelpers';
import { calculateStarReward } from '../../Utils/dataHelpers';
import { Header } from '../../Components/UI';
import SpeakButton from '../../Components/Common/SpeakButton';
import { useAuth } from '../../Context';
import SpeechEngine from '../../Utils/speechEngine';
import { SPEECH_PHRASES } from '../../Data/speechCatalog';
import { useThemeColors } from '../../Context/ThemeContext';

const ModuleQuizScreen = ({ navigation, route }) => {
  const { module, packId } = route.params;
  const { addStars } = useAuth();
  const colors = useThemeColors();
  const styles = makeStyles(colors);

  const pack = useMemo(() => {
    const config = quizPacksByModule[module];
    return config?.packs.find((p) => p.id === packId);
  }, [module, packId]);

  const buildSession = useCallback(() => {
    if (!pack) return [];
    const bank = getQuizBank(pack.bankKey);
    return createQuizSession(bank, QUIZ_QUESTION_COUNT);
  }, [pack]);

  const [questions, setQuestions] = useState(buildSession);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameState, setGameState] = useState('playing');

  const question = questions[currentIdx];

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
    const isCorrect = selected === currentQuestion.answer;
    const nextCorrect = isCorrect ? correctCount + 1 : correctCount;

    const advance = () => {
      if (currentIdx < total - 1) {
        setCurrentIdx((prev) => prev + 1);
        return;
      }
      const reward = calculateStarReward(nextCorrect, total, 5);
      addStars(reward);
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
        SpeechEngine.speak(`${currentQuestion.answer}`, 'en-US', { onDone: then, onError: then });
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
    setGameState('playing');
  };

  return (
    <View style={styles.container}>
      <Header
        title={pack.title}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {gameState === 'playing' ? (
          <View style={styles.quizContent}>
            <Text style={styles.progText}>
              Question {currentIdx + 1} of {total}
            </Text>
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{currentQuestion.q}</Text>
              {currentQuestion.speech?.text ? (
                <View style={styles.questionAudio}>
                  <SpeakButton
                    text={currentQuestion.speech.text}
                    language={currentQuestion.speech.language}
                    color={colors.primary}
                    label="🔊 Hear again"
                    size="sm"
                  />
                </View>
              ) : null}
            </View>

            <View style={styles.optionsContainer}>
              {currentQuestion.shuffledOptions.map((option, idx) => (
                <TouchableOpacity
                  key={`${currentIdx}-${idx}-${option}`}
                  style={styles.optionBtn}
                  onPress={() => handleAnswer(option)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>🏆</Text>
            <Text style={styles.resultTitle}>Quiz Completed!</Text>
            <Text style={styles.scoreText}>
              Score: {correctCount} / {total}
            </Text>
            <Text style={styles.rewardText}>
              You earned +{calculateStarReward(correctCount, total, 5)} Stars!
            </Text>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btn} onPress={restartQuiz}>
                <Text style={styles.btnText}>Try Again 🔁</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.secondary }]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.btnText}>Back to Quizzes ➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  quizContent: { alignItems: 'center', width: '100%' },
  progText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 32,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
    elevation: 1,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  questionAudio: { marginTop: 16 },
  optionsContainer: { width: '100%', gap: 12 },
  optionBtn: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 28,
    alignItems: 'center',
    elevation: 3,
  },
  resultEmoji: { fontSize: 72, marginBottom: 16 },
  resultTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 32,
  },
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
