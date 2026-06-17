import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors } from '../../Data/colorsTheme';
import { quizPacksByModule } from '../../Data/quizPacksData';
import { getQuizBank } from '../../Utils/quizGenerators';
import { createQuizSession, QUIZ_QUESTION_COUNT } from '../../Utils/quizHelpers';
import { calculateStarReward } from '../../Utils/dataHelpers';
import { Header } from '../../Components/UI';
import { useAuth } from '../../Context';
import SpeechEngine from '../../Utils/speechEngine';

const ModuleQuizScreen = ({ navigation, route }) => {
  const { module, packId } = route.params;
  const { addStars } = useAuth();

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

  const currentQuestion = questions[currentIdx];
  const total = questions.length;

  const handleAnswer = (selected) => {
    const isCorrect = selected === currentQuestion.answer;
    const nextCorrect = isCorrect ? correctCount + 1 : correctCount;

    if (isCorrect) {
      setCorrectCount(nextCorrect);
      SpeechEngine.speak('Correct! Brilliant!', 'en-US');
    } else {
      SpeechEngine.speak(`Not quite! The correct answer is ${currentQuestion.answer}`, 'en-US');
    }

    if (currentIdx < total - 1) {
      setTimeout(() => setCurrentIdx((prev) => prev + 1), 1000);
    } else {
      setTimeout(() => {
        const reward = calculateStarReward(nextCorrect, total, 5);
        addStars(reward);
        setGameState('finished');
        SpeechEngine.speak(
          `Quiz finished! You answered ${nextCorrect} out of ${total} correctly and earned ${reward} stars!`,
          'en-US'
        );
      }, 1000);
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
                style={[styles.btn, { backgroundColor: Colors.secondary }]}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgMain },
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
    color: Colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.borderLight,
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
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsContainer: { width: '100%', gap: 12 },
  optionBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.borderLight,
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
    color: Colors.textDark,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    padding: 28,
    alignItems: 'center',
    elevation: 3,
  },
  resultEmoji: { fontSize: 72, marginBottom: 16 },
  resultTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textDark,
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textLight,
    marginBottom: 32,
  },
  btnRow: { width: '100%', gap: 12 },
  btn: {
    backgroundColor: Colors.primary,
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
    color: Colors.textLight,
    textAlign: 'center',
  },
});

export default ModuleQuizScreen;
