import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { Radius } from '../../Theme';

// ──────────────────────────────────────────────────────────────
// SketchButton — premium call-to-action that opens the tracing
// canvas for the current letter / number / haroof.
// Drop it into any detail view and wire onPress to open SketchCanvas.
// ──────────────────────────────────────────────────────────────
const SketchButton = ({ color = '#8A6FF0', onPress, label = 'Practice Writing' }) => {
  const colors = useThemeColors();
  const styles = makeStyles(colors);

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.iconBubble}>
        <Text style={styles.icon}>✏️</Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>Sketch</Text>
        <Text style={styles.subtitle}>{label} — trace the dots ✨</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: Radius.xl,
      paddingVertical: 16,
      paddingHorizontal: 18,
      gap: 14,
      elevation: 6,
      shadowColor: '#1E1B4B',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      borderBottomWidth: 4,
      borderBottomColor: 'rgba(0,0,0,0.18)',
    },
    iconBubble: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      fontSize: 24,
    },
    textWrap: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 12,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.9)',
      marginTop: 1,
    },
    chevron: {
      fontSize: 28,
      fontWeight: '900',
      color: 'rgba(255,255,255,0.85)',
    },
  });

export default SketchButton;
