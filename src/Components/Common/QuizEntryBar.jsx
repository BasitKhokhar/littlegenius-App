import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Radius, Spacing, textStyles, coloredShadow } from '../../Theme';

const QuizEntryBar = ({ onPress, color = '#FB7185', compact = false }) => {
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactBtn, coloredShadow(color, 'sm'), { backgroundColor: color }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text style={styles.compactText}>🧠 Quiz</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.fullBtn, coloredShadow(color, 'md'), { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <Text style={styles.fullEmoji}>🧠</Text>
      <View style={styles.fullTextWrap}>
        <Text style={styles.fullTitle}>Take Quiz Challenge</Text>
        <Text style={styles.fullSub}>10 random questions from 100+</Text>
      </View>
      <Text style={styles.fullArrow}>→</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  compactBtn: {
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  compactText: {
    color: '#FFF',
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 12,
  },
  fullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
  },
  fullEmoji: { fontSize: 28, marginRight: 12 },
  fullTextWrap: { flex: 1 },
  fullTitle: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 15,
    marginBottom: 2,
  },
  fullSub: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    fontSize: 11,
  },
  fullArrow: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 18,
  },
});

export default QuizEntryBar;
