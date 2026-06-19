import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { Spacing, textStyles, Radius } from '../../Theme';
import Button from './Button';

// ──────────────────────────────────────────────────────────────
// ErrorState — gentle, kid-friendly error with a retry CTA.
//   <ErrorState message="Something went wrong" onRetry={…} />
// ──────────────────────────────────────────────────────────────
const ErrorState = ({
  emoji = '😅',
  title = 'Oops! Something went wrong',
  message = 'Please try again.',
  retryLabel = 'Try Again',
  onRetry,
  style,
}) => {
  const colors = useThemeColors();
  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.ring, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={[textStyles.h3, styles.center, { color: colors.textPrimary }]}>{title}</Text>
      {!!message && (
        <Text style={[textStyles.body, styles.center, { color: colors.textMuted }]}>{message}</Text>
      )}
      {!!onRetry && (
        <Button title={retryLabel} variant="primary" size="md" onPress={onRetry} style={styles.btn} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: Spacing.xxxl, gap: Spacing.sm },
  ring: {
    width: 96,
    height: 96,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emoji: { fontSize: 44 },
  center: { textAlign: 'center' },
  btn: { marginTop: Spacing.md, alignSelf: 'center', paddingHorizontal: Spacing.xxxl },
});

export default ErrorState;
