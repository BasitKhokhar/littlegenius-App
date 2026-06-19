import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { Layout } from '../../Theme';

// ──────────────────────────────────────────────────────────────
// Screen — the standard page wrapper. Replaces the repeated
//   <View style={{ flex:1, backgroundColor:'#...' }}> blocks.
//
//   <Screen>                      → plain, padded, theme bg
//   <Screen scroll>               → scrollable body
//   <Screen edges={['bottom']}>   → which safe-area edges to pad
//   <Screen background="surface"> → use the card colour instead of bg
//
// Header components manage the TOP inset themselves, so Screen pads
// horizontal + bottom by default (edge-to-edge friendly).
// ──────────────────────────────────────────────────────────────
const Screen = ({
  children,
  scroll = false,
  padded = true,
  background = 'bg',
  style,
  contentContainerStyle,
  ...rest
}) => {
  const colors = useThemeColors();
  const bg = colors[background] || colors.bg;

  const padStyle = padded ? { paddingHorizontal: Layout.screenPadding } : null;

  if (scroll) {
    return (
      <View style={[styles.flex, { backgroundColor: bg }, style]}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[padStyle, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          {...rest}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: bg }, padStyle, style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

export default Screen;
