import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const QuizEntryBar = ({ onPress, color = '#F85A9B', compact = false }) => {
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactBtn, { backgroundColor: color }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text style={styles.compactText}>🧠 Quiz</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.fullBtn, { backgroundColor: color }]}
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
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  compactText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 12,
  },
  fullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginTop: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.18)',
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
