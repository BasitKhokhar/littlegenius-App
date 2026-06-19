import React, { useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated } from 'react-native';
import SpeakButton from '../Common/SpeakButton';
import { Colors } from '../../Data/colorsTheme';
import { useThemeColors } from '../../Context/ThemeContext';
import { Radius, Spacing, textStyles, Elevation, Motion } from '../../Theme';

const VocabularyCard = ({
  emoji = '🍎',
  word = 'Apple',
  category = 'Fruits',
  categoryColor = Colors.pink,
  onPress = () => {},
  onSpeak = () => {},
}) => {
  const colors = useThemeColors();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: Motion.pressScale, useNativeDriver: true, ...Motion.spring.soft }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, ...Motion.spring.soft }).start();

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={[styles.card, Elevation.sm, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Left color accent */}
        <View style={[styles.accentBar, { backgroundColor: categoryColor }]} />

        {/* Emoji bubble */}
        <View style={[styles.emojiBubble, { backgroundColor: categoryColor + '18' }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '18', borderColor: categoryColor + '40' }]}>
            <Text style={[styles.category, { color: categoryColor }]}>{category}</Text>
          </View>
          <Text style={[styles.word, { color: colors.textPrimary }]}>{word}</Text>
        </View>

        {/* Speak button */}
        <SpeakButton
          text={word}
          language="en-US"
          color={categoryColor}
          label="🔊"
          size="sm"
          onPress={onSpeak}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
  },
  card: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: Radius.md,
    borderBottomLeftRadius: Radius.md,
  },
  emojiBubble: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 12,
  },
  emoji: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
    gap: 5,
  },
  categoryBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  category: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  word: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
    lineHeight: 20,
  },
});

export default VocabularyCard;
