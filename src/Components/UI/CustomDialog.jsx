import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { Spacing, Radius, textStyles, Elevation } from '../../Theme';
import Button from '../Common/Button';

// Per-variant accent + default emoji so callers just pass a variant.
const VARIANT_META = {
  info: { key: 'primary', emoji: '🎓' },
  success: { key: 'success', emoji: '🎉' },
  error: { key: 'error', emoji: '😅' },
  confirm: { key: 'primary', emoji: '🤔' },
};

const CustomDialog = ({
  visible = false,
  title = '',
  description = '',
  emoji,
  variant = 'info',
  primaryButtonLabel = 'Awesome!',
  secondaryButtonLabel = null,
  onPrimaryPress = () => {},
  onSecondaryPress = () => {},
  onDismiss = () => {},
}) => {
  const colors = useThemeColors();
  const meta = VARIANT_META[variant] || VARIANT_META.info;
  const accent = colors[meta.key] || colors.primary;
  const shownEmoji = emoji || meta.emoji;
  const isConfirm = !!secondaryButtonLabel;

  const hexToRgba = (hex, a) => {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View
          style={[styles.modalView, Elevation.xl, { backgroundColor: colors.surface }]}
        >
          <View
            style={[
              styles.emojiRing,
              { backgroundColor: hexToRgba(accent, 0.12), borderColor: hexToRgba(accent, 0.4) },
            ]}
          >
            <Text style={styles.emoji}>{shownEmoji}</Text>
          </View>
          <Text style={[textStyles.h2, styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {!!description && (
            <Text style={[textStyles.body, styles.description, { color: colors.textSecondary }]}>
              {description}
            </Text>
          )}

          <View style={[styles.buttonContainer, isConfirm && styles.buttonRow]}>
            {secondaryButtonLabel && (
              <Button
                title={secondaryButtonLabel}
                variant="tonal"
                size="md"
                fullWidth={!isConfirm}
                style={isConfirm && styles.flexBtn}
                onPress={() => {
                  onSecondaryPress();
                  onDismiss();
                }}
              />
            )}
            <Button
              title={primaryButtonLabel}
              variant={variant === 'error' ? 'danger' : 'primary'}
              size="md"
              fullWidth={!isConfirm}
              style={[isConfirm && styles.flexBtn, variant === 'success' && { backgroundColor: colors.success }]}
              onPress={() => {
                onPrimaryPress();
                onDismiss();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  modalView: {
    width: '100%',
    maxWidth: 340,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  emojiRing: {
    width: 76,
    height: 76,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emoji: { fontSize: 38 },
  title: { textAlign: 'center', marginBottom: Spacing.sm },
  description: { textAlign: 'center', marginBottom: Spacing.xl },
  buttonContainer: { width: '100%', gap: Spacing.sm },
  buttonRow: { flexDirection: 'row' },
  flexBtn: { flex: 1 },
});

export default CustomDialog;
