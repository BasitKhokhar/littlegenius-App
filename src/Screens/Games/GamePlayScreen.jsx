import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Colors } from '../../Data/colorsTheme';
import { patternData, memoryCardsList, oddOneOutData, colorMatchData, shapeQuizData } from '../../Data/gamesData';
import { Header } from '../../Components/UI';
import { useAuth } from '../../Context';
import SpeechEngine from '../../Utils/speechEngine';
import { generateMathProblem, shuffleArray } from '../../Utils/dataHelpers';

const { width } = Dimensions.get('window');

const GamePlayScreen = ({ navigation, route }) => {
  const { gameId } = route.params;
  const { addStars } = useAuth();
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, won

  // Pattern Match Game State
  const [patternIdx, setPatternIdx] = useState(0);

  // Memory Game State
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);

  // Odd One Out Game State
  const [oddIdx, setOddIdx] = useState(0);
  const [oddExplain, setOddExplain] = useState(null);

  // Math Race Game State
  const [mathIdx, setMathIdx] = useState(0);
  const [mathProblem, setMathProblem] = useState(null);

  // Color Match Game State
  const [colorIdx, setColorIdx] = useState(0);

  // Shape Quiz Game State
  const [shapeIdx, setShapeIdx] = useState(0);

  // Initialize game
  useEffect(() => {
    initGame();
  }, [gameId]);

  const initGame = () => {
    setScore(0);
    setGameState('playing');
    if (gameId === 1) {
      // Pattern Match
      setPatternIdx(0);
      SpeechEngine.speak('Pattern Match! Find the emoji that fits next!', 'en-US');
    } else if (gameId === 2) {
      // Memory Game
      const shuffled = shuffleArray(memoryCardsList).map((emoji, index) => ({
        id: index,
        emoji,
      }));
      setCards(shuffled);
      setSelectedCards([]);
      setMatchedCards([]);
      SpeechEngine.speak('Memory Game! Match all pairs of emojis!', 'en-US');
    } else if (gameId === 3) {
      // Odd One Out
      setOddIdx(0);
      setOddExplain(null);
      SpeechEngine.speak('Odd One Out! Tap the item that does not fit!', 'en-US');
    } else if (gameId === 4) {
      // Math Race
      setMathIdx(0);
      setMathProblem(generateMathProblem('+'));
      SpeechEngine.speak('Math Race! Solve the math questions quickly!', 'en-US');
    } else if (gameId === 5) {
      setColorIdx(0);
      SpeechEngine.speak('Color Match! Pick the right color name!', 'en-US');
    } else if (gameId === 6) {
      setShapeIdx(0);
      SpeechEngine.speak('Shape Quiz! Name the shapes correctly!', 'en-US');
    }
  };

  const handleGameWin = (starsReward = 15) => {
    setGameState('won');
    addStars(starsReward);
    SpeechEngine.speak(`Congratulations! You won the game and earned ${starsReward} stars!`, 'en-US');
  };

  // --- Pattern Match Logic ---
  const handlePatternAnswer = (selected) => {
    const current = patternData[patternIdx];
    if (selected === current.answer) {
      SpeechEngine.speak('Correct! Nice job!', 'en-US');
      if (patternIdx < patternData.length - 1) {
        setPatternIdx(prev => prev + 1);
      } else {
        handleGameWin(15);
      }
    } else {
      SpeechEngine.speak('Oops! Try again!', 'en-US');
    }
  };

  // --- Memory Game Logic ---
  const handleCardPress = (cardIndex) => {
    if (selectedCards.length >= 2 || selectedCards.includes(cardIndex) || matchedCards.includes(cardIndex)) {
      return;
    }

    const newSelected = [...selectedCards, cardIndex];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const firstCard = cards[newSelected[0]];
      const secondCard = cards[newSelected[1]];

      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        setMatchedCards(prev => {
          const nextMatched = [...prev, newSelected[0], newSelected[1]];
          if (nextMatched.length === cards.length) {
            setTimeout(() => handleGameWin(15), 500);
          }
          return nextMatched;
        });
        setSelectedCards([]);
        SpeechEngine.speak('Matched!', 'en-US');
      } else {
        // Not a match, flip back
        SpeechEngine.speak('No match!', 'en-US');
        setTimeout(() => {
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  // --- Odd One Out Logic ---
  const handleOddAnswer = (idx) => {
    const current = oddOneOutData[oddIdx];
    if (idx === current.odd) {
      setOddExplain(current.explain);
      SpeechEngine.speak(`Excellent! ${current.explain}`, 'en-US');
    } else {
      SpeechEngine.speak('Try again!', 'en-US');
    }
  };

  const nextOddQuestion = () => {
    setOddExplain(null);
    if (oddIdx < oddOneOutData.length - 1) {
      setOddIdx(prev => prev + 1);
    } else {
      handleGameWin(15);
    }
  };

  // --- Math Race Logic ---
  const handleMathAnswer = (selected) => {
    if (selected === mathProblem.answer) {
      SpeechEngine.speak('Correct!', 'en-US');
      if (mathIdx < 9) {
        setMathIdx(prev => prev + 1);
        const op = Math.random() > 0.5 ? '+' : '-';
        setMathProblem(generateMathProblem(op));
      } else {
        handleGameWin(15);
      }
    } else {
      SpeechEngine.speak('Try again!', 'en-US');
    }
  };

  // --- Color Match Logic ---
  const handleColorAnswer = (selected) => {
    const current = colorMatchData[colorIdx];
    if (selected === current.name) {
      SpeechEngine.speak('Correct!', 'en-US');
      if (colorIdx < colorMatchData.length - 1) {
        setColorIdx((prev) => prev + 1);
      } else {
        handleGameWin(15);
      }
    } else {
      SpeechEngine.speak('Try again!', 'en-US');
    }
  };

  // --- Shape Quiz Logic ---
  const handleShapeAnswer = (selected) => {
    const current = shapeQuizData[shapeIdx];
    if (selected === current.name) {
      SpeechEngine.speak('Correct!', 'en-US');
      if (shapeIdx < shapeQuizData.length - 1) {
        setShapeIdx((prev) => prev + 1);
      } else {
        handleGameWin(15);
      }
    } else {
      SpeechEngine.speak('Try again!', 'en-US');
    }
  };

  // --- Render Functions ---
  const renderPatternGame = () => {
    const current = patternData[patternIdx];
    return (
      <View style={styles.gameContent}>
        <Text style={styles.questionText}>What comes next in the pattern?</Text>
        <Text style={styles.progText}>Pattern {patternIdx + 1} of {patternData.length}</Text>
        
        <View style={styles.patternBox}>
          {current.pattern.map((emoji, idx) => (
            <Text key={idx} style={styles.patternEmoji}>{emoji}</Text>
          ))}
          <View style={styles.questionMarkBox}>
            <Text style={styles.questionMark}>?</Text>
          </View>
        </View>

        <View style={styles.optionsGrid}>
          {current.options.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.optionCard}
              onPress={() => handlePatternAnswer(option)}
              activeOpacity={0.8}
            >
              <Text style={styles.optionEmoji}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderMemoryGame = () => {
    return (
      <View style={styles.gameContent}>
        <Text style={styles.questionText}>Match all the emoji pairs!</Text>
        <Text style={styles.progText}>Pairs Matched: {matchedCards.length / 2} / 8</Text>
        
        <View style={styles.memoryGrid}>
          {cards.map((card, index) => {
            const isFlipped = selectedCards.includes(index) || matchedCards.includes(index);
            return (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.memoryCard,
                  isFlipped && styles.memoryCardFlipped,
                ]}
                onPress={() => handleCardPress(index)}
                activeOpacity={0.8}
              >
                <Text style={styles.memoryEmoji}>
                  {isFlipped ? card.emoji : '⭐'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderOddGame = () => {
    const current = oddOneOutData[oddIdx];
    return (
      <View style={styles.gameContent}>
        <Text style={styles.questionText}>Find the odd item out!</Text>
        <Text style={styles.progText}>Puzzle {oddIdx + 1} of {oddOneOutData.length}</Text>

        <View style={styles.oddGrid}>
          {current.items.map((emoji, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.oddCard}
              onPress={() => handleOddAnswer(idx)}
              activeOpacity={0.8}
              disabled={oddExplain !== null}
            >
              <Text style={styles.oddEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {oddExplain && (
          <View style={styles.explainCard}>
            <Text style={styles.explainText}>🎉 {oddExplain}</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={nextOddQuestion}>
              <Text style={styles.nextBtnText}>Next Question ➔</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderMathGame = () => {
    if (!mathProblem) return null;
    return (
      <View style={styles.gameContent}>
        <Text style={styles.questionText}>Solve the math race!</Text>
        <Text style={styles.progText}>Equation {mathIdx + 1} of 10</Text>

        <View style={styles.mathBox}>
          <Text style={styles.mathText}>{mathProblem.question} = ?</Text>
        </View>

        <View style={styles.optionsGrid}>
          {mathProblem.options.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.optionCard, { paddingVertical: 18 }]}
              onPress={() => handleMathAnswer(option)}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionEmoji, { fontSize: 24 }]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderColorGame = () => {
    const current = colorMatchData[colorIdx];
    const shuffledOptions = shuffleArray(current.options);
    return (
      <View style={styles.gameContent}>
        <Text style={styles.questionText}>What color is this?</Text>
        <Text style={styles.progText}>Color {colorIdx + 1} of {colorMatchData.length}</Text>
        <View style={[styles.colorBox, { backgroundColor: current.color }]}>
          <Text style={styles.colorEmoji}>{current.emoji}</Text>
        </View>
        <View style={styles.optionsGrid}>
          {shuffledOptions.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.optionCard, { paddingVertical: 18 }]}
              onPress={() => handleColorAnswer(option)}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionEmoji, { fontSize: 16, fontWeight: '900' }]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderShapeGame = () => {
    const current = shapeQuizData[shapeIdx];
    const shuffledOptions = shuffleArray(current.options);
    return (
      <View style={styles.gameContent}>
        <Text style={styles.questionText}>What shape is this?</Text>
        <Text style={styles.progText}>Shape {shapeIdx + 1} of {shapeQuizData.length}</Text>
        <View style={styles.shapeBox}>
          <Text style={styles.shapeEmoji}>{current.shape}</Text>
          <Text style={styles.shapeUrdu}>{current.urdu}</Text>
        </View>
        <View style={styles.optionsGrid}>
          {shuffledOptions.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.optionCard, { paddingVertical: 18 }]}
              onPress={() => handleShapeAnswer(option)}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionEmoji, { fontSize: 16, fontWeight: '900' }]}>{option}</Text>
            </TouchableOpacity>
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

  return (
    <View style={styles.container}>
      <Header
        title={getHeaderTitle()}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {gameState === 'playing' ? (
          <>
            {gameId === 1 && renderPatternGame()}
            {gameId === 2 && renderMemoryGame()}
            {gameId === 3 && renderOddGame()}
            {gameId === 4 && renderMathGame()}
            {gameId === 5 && renderColorGame()}
            {gameId === 6 && renderShapeGame()}
          </>
        ) : (
          <View style={styles.victoryCard}>
            <Text style={styles.victoryEmoji}>🏆</Text>
            <Text style={styles.victoryTitle}>Awesome Job!</Text>
            <Text style={styles.victorySubtitle}>You completed the challenge and earned +15 Stars!</Text>
            
            <View style={styles.victoryButtons}>
              <TouchableOpacity style={styles.victoryBtn} onPress={initGame}>
                <Text style={styles.victoryBtnText}>Play Again 🔁</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.victoryBtn, { backgroundColor: Colors.secondary }]} 
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.victoryBtnText}>Back to Games ➔</Text>
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
    paddingVertical: 20,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },
  gameContent: {
    alignItems: 'center',
    width: '100%',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  progText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  // Pattern Matching
  patternBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 36,
    gap: 10,
    elevation: 1,
  },
  patternEmoji: {
    fontSize: 32,
  },
  questionMarkBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFEFEA',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionMark: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  optionCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    paddingVertical: 14,
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
  optionEmoji: {
    fontSize: 32,
  },
  // Memory Game
  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  memoryCard: {
    width: '22%',
    height: 70,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  memoryCardFlipped: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderBottomWidth: 2,
  },
  memoryEmoji: {
    fontSize: 26,
    color: '#FFF',
  },
  // Odd One Out
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
    height: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  oddEmoji: {
    fontSize: 48,
  },
  explainCard: {
    width: '100%',
    backgroundColor: '#EAF7F2',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.secondary,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  explainText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
  },
  nextBtn: {
    backgroundColor: Colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 1,
  },
  nextBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 12,
  },
  // Math Race
  mathBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: Colors.primary,
    paddingVertical: 24,
    paddingHorizontal: 40,
    marginBottom: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  mathText: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.textDark,
  },
  colorBox: {
    width: 120,
    height: 120,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    borderWidth: 3,
    borderColor: Colors.borderLight,
    elevation: 2,
  },
  colorEmoji: { fontSize: 48 },
  shapeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    paddingVertical: 28,
    paddingHorizontal: 40,
    marginBottom: 36,
    alignItems: 'center',
    elevation: 2,
  },
  shapeEmoji: { fontSize: 64, marginBottom: 8 },
  shapeUrdu: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textLight,
  },
  // Victory Screen
  victoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    padding: 28,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  victoryEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  victoryTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textDark,
    marginBottom: 8,
  },
  victorySubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  victoryButtons: {
    width: '100%',
    gap: 12,
  },
  victoryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  victoryBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14,
  },
});

export default GamePlayScreen;
