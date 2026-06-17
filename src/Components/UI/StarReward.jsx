import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../Data/colorsTheme';

const StarReward = ({ stars = 0 }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.starIcon}>⭐</Text>
      <Text style={styles.starsText}>{stars}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFD699',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  starIcon: {
    fontSize: 16,
    fontWeight: '900',
  },
  starsText: {
    fontWeight: '900',
    color: '#8B6914',
    fontSize: 13,
    letterSpacing: 0.3,
  },
});

export default StarReward;
