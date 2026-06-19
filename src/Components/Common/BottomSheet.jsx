import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../Context/ThemeContext';
import { Spacing, Radius, textStyles, Elevation } from '../../Theme';

// ──────────────────────────────────────────────────────────────
// BottomSheet — reusable slide-up sheet with a grab handle + scrim.
// Generalises the one-off age-picker modal in ProfileSetup.
//
//   <BottomSheet visible={open} title="Select Age 🎂" onClose={…}>
//     …rows…
//   </BottomSheet>
// ──────────────────────────────────────────────────────────────
const BottomSheet = ({ visible, title, onClose, children, maxHeightRatio = 0.7 }) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={[styles.scrim, { backgroundColor: colors.overlay }]}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.sheet,
            Elevation.xl,
            {
              backgroundColor: colors.surface,
              paddingBottom: Math.max(insets.bottom, Spacing.lg),
              maxHeight: `${maxHeightRatio * 100}%`,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
          {!!title && (
            <Text style={[textStyles.h3, styles.title, { color: colors.textPrimary }]}>{title}</Text>
          )}
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: { textAlign: 'center', marginBottom: Spacing.lg },
});

export default BottomSheet;
