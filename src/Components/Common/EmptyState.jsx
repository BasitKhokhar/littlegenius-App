import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { Spacing, textStyles, Radius } from '../../Theme';
import Button from './Button';

// ──────────────────────────────────────────────────────────────
// EmptyState — friendly "nothing here yet" placeholder.
//   <EmptyState emoji="📭" title="No stories yet"
//               message="Check back soon!" actionLabel="Refresh" onAction={…} />
// ──────────────────────────────────────────────────────────────
const EmptyState = ({ emoji = '✨', title, message, actionLabel, onAction, style }) => {
  const colors = useThemeColors();
  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.ring, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      {!!title && (
        <Text style={[textStyles.h3, styles.center, { color: colors.textPrimary }]}>{title}</Text>
      )}
      {!!message && (
        <Text style={[textStyles.body, styles.center, { color: colors.textMuted }]}>{message}</Text>
      )}
      {!!actionLabel && (
        <Button
          title={actionLabel}
          variant="tonal"
          size="md"
          onPress={onAction}
          style={styles.btn}
        />
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

export default EmptyState;
