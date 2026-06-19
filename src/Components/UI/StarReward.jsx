import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Radius, Spacing, Elevation } from '../../Theme';

const StarReward = ({ stars = 0 }) => {
  return (
    <View style={[styles.container, Elevation.sm]}>
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
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
  },
  starIcon: { fontSize: 16 },
  starsText: {
    fontFamily: 'Baloo2_800ExtraBold',
    color: '#92670B',
    fontSize: 13,
    letterSpacing: 0.3,
  },
});

export default StarReward;
