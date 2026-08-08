import React, { useRef, useEffect } from 'react';
import { Animated, Text, TouchableOpacity, StyleSheet } from 'react-native';

// ──────────────────────────────────────────────────────────────
// QuizOptionButton — shared answer tile for quiz screens (module
// quizzes, story quizzes). Mirrors the feedback language already
// used in GamePlayScreen's OptionTile: the correct answer flashes
// green, a wrong tap flashes red and shakes, the rest dim out — so
// a child gets the same "right/wrong" read whether they're tapping
// a game or a quiz.
//
//   state: 'idle' | 'correct' | 'wrong' | 'dim'
// ──────────────────────────────────────────────────────────────
const QuizOptionButton = ({ label, state = 'idle', onPress, colors, disabled }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state === 'wrong') {
      shake.setValue(0);
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 1, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 55, useNativeDriver: true }),
      ]).start();
    }
  }, [state, shake]);

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 24, bounciness: 10 }).start();

  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] });

  const stateStyle =
    state === 'correct'
      ? { backgroundColor: colors.success, borderColor: colors.successDeep, borderBottomColor: colors.successDeep }
      : state === 'wrong'
      ? { backgroundColor: colors.error, borderColor: colors.errorDeep, borderBottomColor: colors.errorDeep }
      : null;

  const isFilled = state === 'correct' || state === 'wrong';
  const styles = makeStyles(colors);

  return (
    <Animated.View
      style={{
        opacity: state === 'dim' ? 0.45 : 1,
        transform: [{ scale }, { translateX: shakeX }],
      }}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={disabled}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
        style={[styles.optionBtn, stateStyle]}
      >
        <Text style={[styles.optionText, isFilled && styles.optionTextFilled]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
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
    optionTextFilled: { color: '#FFFFFF' },
  });

export default QuizOptionButton;
