import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors } from '../../Data/colorsTheme';
import { alphabetQuizData } from '../../Data/alphabetData';
import { Header } from '../../Components/UI';
import { useAuth } from '../../Context';
import SpeechEngine from '../../Utils/speechEngine';
import { calculateStarReward } from '../../Utils/dataHelpers';

const AlphabetQuizScreen = ({ navigation, route }) => {
  const { addStars } = useAuth();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, finished

  const currentQuestion = alphabetQuizData[currentIdx];

  const handleAnswer = (selected) => {
    const isCorrect = selected === currentQuestion.answer;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      SpeechEngine.speak('Correct! Brilliant!', 'en-US');
    } else {
      SpeechEngine.speak(`Not quite! The correct answer is ${currentQuestion.answer}`, 'en-US');
    }

    if (currentIdx < alphabetQuizData.length - 1) {
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
      }, 1000);
    } else {
      setTimeout(() => {
        const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
        const reward = calculateStarReward(finalCorrect, alphabetQuizData.length, 5);
        addStars(reward);
        setGameState('finished');
        SpeechEngine.speak(`Quiz finished! You answered ${finalCorrect} out of ${alphabetQuizData.length} correctly and earned ${reward} stars!`, 'en-US');
      }, 1000);
    }
  };

  const restartQuiz = () => {
    setCurrentIdx(0);
    setCorrectCount(0);
    setGameState('playing');
  };

  return (
    <View style={styles.container}>
      <Header
        title="Alphabet Quiz"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {gameState === 'playing' ? (
          <View style={styles.quizContent}>
            <Text style={styles.progText}>Question {currentIdx + 1} of {alphabetQuizData.length}</Text>
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{currentQuestion.q}</Text>
            </View>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, idx) => (
                <TouchableOpacity
                  key={idx}
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
            <Text style={styles.scoreText}>Score: {correctCount} / {alphabetQuizData.length}</Text>
            <Text style={styles.rewardText}>
              You earned +{calculateStarReward(correctCount, alphabetQuizData.length, 5)} Stars!
            </Text>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btn} onPress={restartQuiz}>
                <Text style={styles.btnText}>Try Again 🔁</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: Colors.secondary }]} 
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.btnText}>Back to Module ➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgMain,
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
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textDark,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textDark,
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
  resultEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
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
  btnRow: {
    width: '100%',
    gap: 12,
  },
  btn: {
    backgroundColor: Colors.primary,
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
});

export default AlphabetQuizScreen;
