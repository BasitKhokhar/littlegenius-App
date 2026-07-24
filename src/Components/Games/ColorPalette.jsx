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
  large = false,
  // `wrap` lays the swatches out as a centred two-row grid (like a real
  // coloring app's palette) instead of a single horizontally-scrolling row.
  // `compact` shrinks the circles so a fuller palette still fits neatly.
  wrap = false,
  compact = false,
}) => {
  // Bigger swatches on the coloring book — easier for little fingers to hit.
  const dim = compact ? 34 : large ? 48 : 36;
  const sizeStyle = { width: dim, height: dim, borderRadius: dim / 2 };

  const items = (
    <>
      {swatches.map((c) => (
        <TouchableOpacity
          key={c}
          style={[styles.swatch, sizeStyle, { backgroundColor: c }, value === c && styles.swatchActive]}
          onPress={() => onChange(c)}
          activeOpacity={0.85}
        >
          {value === c ? <Text style={[styles.check, large && styles.checkLarge]}>✓</Text> : null}
        </TouchableOpacity>
      ))}
      {eraser ? (
        <TouchableOpacity
          style={[styles.swatch, sizeStyle, styles.eraser, value === ERASER && styles.swatchActive]}
          onPress={() => onChange(ERASER)}
          activeOpacity={0.85}
        >
          <Text style={[styles.eraserIcon, large && { fontSize: 22 }]}>🧽</Text>
        </TouchableOpacity>
      ) : null}
    </>
  );

  return (
  <View style={styles.container}>
    {wrap ? (
      <View style={styles.wrapRow}>{items}</View>
    ) : (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.row, large && styles.rowLarge]}>
        {items}
      </ScrollView>
    )}

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
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  row: { gap: 10, paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center' },
  rowLarge: { gap: 14, paddingVertical: 6 },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: 10,
    rowGap: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  check: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  checkLarge: { fontSize: 20 },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
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
