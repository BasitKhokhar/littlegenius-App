import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';

// ──────────────────────────────────────────────────────────────
// ColorPalette — horizontal row of colour swatches with optional
// eraser and stroke-width picker. Fully controlled.
//
// Props:
//   colors        array of hex strings
//   value         currently selected colour (or ERASER)
//   onChange(c)   colour tapped
//   eraser        bool — show an eraser swatch (emits ERASER)
//   widths        optional array of stroke widths to pick from
//   width         current stroke width
//   onWidthChange(w)
// ──────────────────────────────────────────────────────────────

export const ERASER = '__eraser__';

const ColorPalette = ({
  colors: swatches,
  value,
  onChange,
  eraser = false,
  widths,
  width,
  onWidthChange,
}) => (
  <View style={styles.container}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {swatches.map((c) => (
        <TouchableOpacity
          key={c}
          style={[styles.swatch, { backgroundColor: c }, value === c && styles.swatchActive]}
          onPress={() => onChange(c)}
          activeOpacity={0.85}
        />
      ))}
      {eraser ? (
        <TouchableOpacity
          style={[styles.swatch, styles.eraser, value === ERASER && styles.swatchActive]}
          onPress={() => onChange(ERASER)}
          activeOpacity={0.85}
        >
          <Text style={styles.eraserIcon}>🧽</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>

    {widths ? (
      <View style={styles.widthRow}>
        {widths.map((w) => (
          <TouchableOpacity
            key={w}
            style={[styles.widthBtn, width === w && styles.widthBtnActive]}
            onPress={() => onWidthChange?.(w)}
            activeOpacity={0.85}
          >
            <View
              style={{
                width: Math.min(w * 1.6, 24),
                height: Math.min(w * 1.6, 24),
                borderRadius: 12,
                backgroundColor: value === ERASER ? '#9CA3AF' : value,
              }}
            />
          </TouchableOpacity>
        ))}
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: { width: '100%' },
  row: { gap: 10, paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center' },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.65)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  swatchActive: {
    transform: [{ scale: 1.18 }],
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  eraser: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eraserIcon: { fontSize: 16 },
  widthRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  widthBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148,163,184,0.18)',
  },
  widthBtnActive: {
    backgroundColor: 'rgba(148,163,184,0.4)',
  },
});

export default ColorPalette;
