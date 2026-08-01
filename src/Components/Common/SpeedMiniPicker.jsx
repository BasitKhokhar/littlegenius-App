import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { useSpeech } from '../../Context';

// Compact inline speed selector for detail screens (alphabet / haroof word
// rows) — shows the actual multipliers (0.5×, 1×, 2×…) so a grown-up can see
// exactly what each option is, not just an icon. Reads/writes the SAME global
// speed as Settings ▸ Speaking Speed, so a pick made here changes narration
// everywhere, not just on this screen.
const SpeedMiniPicker = ({ accentColor, style }) => {
  const colors = useThemeColors();
  const { speed, setSpeed, options } = useSpeech();
  const accent = accentColor || colors.primary;

  return (
    <View style={[styles.row, style]}>
      {options.map((opt) => {
        const active = opt.value === speed;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setSpeed(opt.value)}
            style={[
              styles.chip,
              { borderColor: colors.border, backgroundColor: colors.surface },
              active && { borderColor: accent, backgroundColor: accent },
            ]}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`Set speaking speed to ${opt.hint} (${opt.label})`}
            accessibilityState={{ selected: active }}
          >
            <Text
              style={[
                styles.label,
                { color: active ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 3,
  },
  chip: {
    minWidth: 26,
    height: 20,
    paddingHorizontal: 3,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
  },
});

export default SpeedMiniPicker;
