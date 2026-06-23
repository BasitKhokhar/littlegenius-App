import React, { useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Colors } from '../../Data/colorsTheme';
import { Radius, Spacing, textStyles, coloredShadow, Motion } from '../../Theme';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 12 * 3 - 32) / 2;

const AlphabetCard = ({
  letter = 'A',
  color = Colors.pink,
  emoji = '🍎',
  word = 'Apple',
  onPress = () => {},
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: Motion.pressScale, useNativeDriver: true, ...Motion.spring.soft }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, ...Motion.spring.soft }).start();

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={[styles.card, coloredShadow(color, 'md'), { backgroundColor: color }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Decorative circle */}
        <View style={styles.decorCircle} />

        <View style={styles.letterRow}>
          <Text style={styles.letter}>{letter}</Text>
          <Text style={styles.letterSmall}>{letter.toLowerCase()}</Text>
        </View>

        <Text style={styles.emoji}>{emoji}</Text>

        <View style={styles.wordRow}>
          <Text style={styles.word} numberOfLines={1}>{word}</Text>
          <View style={styles.arrowBubble}>
            <Text style={styles.arrow}>→</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: CARD_SIZE,
    maxWidth: CARD_SIZE,
  },
  card: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    minHeight: 160,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  letterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  letter: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 40,
  },
  letterSmall: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 28,
    marginBottom: 2,
  },
  emoji: {
    fontSize: 50,
    marginVertical: 4,
    alignSelf: 'center',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  word: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
  },
  arrowBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '900',
  },
});

export default AlphabetCard;
