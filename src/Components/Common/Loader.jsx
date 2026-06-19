import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';

const Loader = ({ size = 'large', color, overlay = false }) => {
  const colors = useThemeColors();
  const tint = color || colors.primary;

  if (overlay) {
    return (
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <ActivityIndicator size={size} color={tint} />
      </View>
    );
  }

  return (
    <View style={[styles.center, { backgroundColor: colors.bg }]}>
      <ActivityIndicator size={size} color={tint} />
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});

export default Loader;
