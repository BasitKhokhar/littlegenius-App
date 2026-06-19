import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { Spacing, textStyles } from '../../Theme';

// ──────────────────────────────────────────────────────────────
// SectionHeader — consistent "📖 Learning Modules" row with an
// optional action ("See all"). Replaces inline `sectionTitle` styles.
// ──────────────────────────────────────────────────────────────
const SectionHeader = ({ title, emoji, actionLabel, onActionPress, style }) => {
  const colors = useThemeColors();
  return (
    <View style={[styles.row, style]}>
      <Text style={[textStyles.h3, { color: colors.textPrimary }]}>
        {emoji ? `${emoji}  ` : ''}
        {title}
      </Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onActionPress} hitSlop={8} activeOpacity={0.7}>
          <Text style={[textStyles.caption, { color: colors.primary }]}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
});

export default SectionHeader;
