import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { storiesData } from '../../Data/storiesData';
import islamicStoriesData from '../../Data/islamicStoriesData';
import { Header } from '../../Components/UI';
import { useAuth } from '../../Context';
import { useThemeColors } from '../../Context/ThemeContext';
import SpeechEngine from '../../Utils/speechEngine';
import { SPEECH_PHRASES } from '../../Data/speechCatalog';
import { calculateStarReward, shuffleArray } from '../../Utils/dataHelpers';

const StoryQuizScreen = ({ navigation, route }) => {
  const { story: storyId } = route.params;
  const { addStars } = useAuth();
  const colors = useThemeColors();
  const styles = makeStyles(colors);

  const story =
    storiesData.find((s) => s.id === storyId) ||
    islamicStoriesData.find((s) => s.id === storyId);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, finished
  const [round, setRound] = useState(0);

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

  const currentQuestion = questions[currentIdx];

  const handleAnswer = (option) => {
    const isCorrect = option.isCorrect;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      SpeechEngine.speak(SPEECH_PHRASES.CORRECT_EXCELLENT, 'en-US');
    } else {
      const correctText = currentQuestion.options.find(o => o.isCorrect)?.text;
      SpeechEngine.speak(`Not quite! The right answer is ${correctText}`, 'en-US');
    }

    if (currentIdx < questions.length - 1) {
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
      }, 1000);
    } else {
      setTimeout(() => {
        const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
        const reward = calculateStarReward(finalCorrect, questions.length, 5);
        addStars(reward);
        setGameState('finished');
        SpeechEngine.speak(`Story Quiz completed! You got ${finalCorrect} out of ${questions.length} right and earned ${reward} stars!`, 'en-US');
      }, 1000);
    }
  };

  const restartQuiz = () => {
    setRound(r => r + 1); // regenerates question + option shuffle
    setCurrentIdx(0);
    setCorrectCount(0);
    setGameState('playing');
  };

  return (
    <View style={styles.container}>
      <Header
        title={`${story.title} Quiz`}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {gameState === 'playing' ? (
          <View style={styles.quizContent}>
            <Text style={styles.progText}>Question {currentIdx + 1} of {questions.length}</Text>
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{currentQuestion.q}</Text>
            </View>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, idx) => (
                <TouchableOpacity
                  key={`${round}-${currentIdx}-${idx}`}
                  style={styles.optionBtn}
                  onPress={() => handleAnswer(option)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.optionText}>{option.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>🏆</Text>
            <Text style={styles.resultTitle}>Quiz Completed!</Text>
            <Text style={styles.scoreText}>Score: {correctCount} / {questions.length}</Text>
            <Text style={styles.rewardText}>
              You earned +{calculateStarReward(correctCount, questions.length, 5)} Stars!
            </Text>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btn} onPress={restartQuiz}>
                <Text style={styles.btnText}>Try Again 🔁</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.secondary }]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.btnText}>Back to Stories ➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  quizContent: {
    alignItems: 'center',
    width: '100%',
  },
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
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '800',
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
  resultEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
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
