import React, { useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../Data/colorsTheme';
import { useThemeColors } from '../../Context/ThemeContext';
import { Radius, Elevation, Motion } from '../../Theme';
import useSpeak from '../../Hooks/useSpeak';

// ──────────────────────────────────────────────────────────────
// VocabularyTile — square vocabulary card for grid layouts:
// big emoji on top, word, category badge, and a 🔊 pill.
// The whole tile speaks on press (the pill is the visible cue for
// it), so there is only ever one speaking source per tile.
// Pass `style={{ flex: 1 }}` to let a row divide the width evenly.
// See VocabularyCard for the wide single-column row variant.
// ──────────────────────────────────────────────────────────────
const VocabularyTile = ({
  emoji = '🍎',
  word = 'Apple',
  category = 'Fruits',
  categoryColor = Colors.pink,
  // Non-English tiles (e.g. Urdu haroof) speak the native script under their
  // own locale and fall back to the romanization when the device has no voice
  // pack; `wordStyle` carries the script font (Nastaliq needs a taller line).
  language = 'en-US',
  fallbackText = null,
  // Full phrase to actually SPEAK (e.g. "A for Apple" / "ا سے انار") while `word` stays
  // the short label shown on the tile — teaches the letter-sound link. Falls back to
  // `word` when omitted, so any other caller keeps today's bare-word behavior.
  speakText = null,
  speakFallbackText = null,
  wordStyle = null,
  style,
}) => {
  const colors = useThemeColors();
  const scale = useRef(new Animated.Value(1)).current;
  const { isSpeaking, toggle } = useSpeak();

  const speak = () =>
    toggle(speakText ?? word, language, {
      clipRate: 0.7,
      rate: 0.75,
      // Urdu clips reported (2026-08-01) sounding distorted at the default
      // 0.7 * 0.75 globalSpeed ≈ 0.525x effective rate — floor it so Urdu
      // playback never drops below a legible speed. English wasn't reported
      // as affected, so it keeps the old unfloored behavior.
      minClipRate: language === 'ur-PK' ? 0.85 : undefined,
      fallbackText: speakFallbackText ?? fallbackText,
    });

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: Motion.pressScale, useNativeDriver: true, ...Motion.spring.soft }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, ...Motion.spring.soft }).start();

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={[
          styles.tile,
          Elevation.sm,
          { backgroundColor: colors.surface, borderColor: isSpeaking ? categoryColor : colors.border },
        ]}
        onPress={speak}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`${word}, ${category}. Tap to hear`}
      >
        {/* Top color accent */}
        <View style={[styles.accentBar, { backgroundColor: categoryColor }]} />

        {/* Emoji */}
        <View style={[styles.emojiBubble, { backgroundColor: categoryColor + '18' }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        {/* Word — shrinks rather than truncating ("Watermelon") */}
        <Text
          style={[styles.word, { color: colors.textPrimary }, wordStyle]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {word}
        </Text>

        {/* Category — full name, never truncated ("Sea Creatures") */}
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: categoryColor + '18', borderColor: categoryColor + '40' },
          ]}
        >
          <Text
            style={[styles.category, { color: categoryColor }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {category}
          </Text>
        </View>

        {/* Speak pill — mirrors SpeakButton size="sm", driven by useSpeak */}
        <View style={[styles.speakPill, { backgroundColor: categoryColor }]} pointerEvents="none">
          {isSpeaking ? (
            <View style={styles.waveRow}>
              <View style={styles.waveBar} />
              <View style={styles.waveBar} />
              <View style={styles.waveBar} />
            </View>
          ) : (
            <Text style={styles.speakGlyph}>🔊</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // The stack below (bubble + word + badge + pill) has to fit inside the row's
  // capped height, or `overflow: hidden` shears the speak pill off the bottom.
  // Equal top/bottom padding keeps the gap under the pill matching the gap
  // above the emoji bubble.
  tile: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  emojiBubble: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 38,
    lineHeight: 44,
  },
  word: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  categoryBadge: {
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: '100%',
  },
  category: {
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  speakPill: {
    minWidth: 40,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakGlyph: {
    fontSize: 12,
    lineHeight: 14,
    textAlign: 'center',
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 14,
  },
  waveBar: {
    width: 3,
    height: 10,
    backgroundColor: '#FFF',
    borderRadius: 2,
    marginHorizontal: 2,
  },
});

export default VocabularyTile;
