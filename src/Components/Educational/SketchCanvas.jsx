import React, { useMemo, useReducer, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Path, Text as SvgText, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../../Context/ThemeContext';
import { Radius, Spacing } from '../../Theme';

const { width: SCREEN_W } = Dimensions.get('window');

// ──────────────────────────────────────────────────────────────
// SketchCanvas — a premium "trace the dotted character" surface.
//
// Shows the target character (letter / number / Urdu haroof) as a
// dotted outline guide, then lets the child draw over it with their
// finger. Tapping "Done" celebrates with a star reward + haptics.
//
// Props:
//   visible      bool      — controls the modal
//   onClose      fn        — called to dismiss
//   character    string    — the glyph to trace (e.g. "A", "7", "ا")
//   label        string    — friendly name shown in the header
//   color        string    — accent colour (per-item theme colour)
//   fontFamily   string?   — optional font (Urdu Nastaliq, etc.)
// ──────────────────────────────────────────────────────────────
const SketchCanvas = ({
  visible,
  onClose,
  character = '',
  label = '',
  color = '#8A6FF0',
  fontFamily,
}) => {
  const colors = useThemeColors();
  const styles = makeStyles(colors);

  // Square drawing surface, capped so it always fits on screen.
  const CANVAS = useMemo(() => Math.min(SCREEN_W - 48, 320), []);

  // Stroke storage. Refs hold the live data (so the PanResponder closure
  // always reads fresh values); a forced re-render paints them.
  const pathsRef = useRef([]);      // completed stroke path strings
  const currentRef = useRef('');    // the stroke currently being drawn
  const [, forceRender] = useReducer((x) => x + 1, 0);
  const [strokeCount, setStrokeCount] = useState(0);
  const [celebrating, setCelebrating] = useState(false);

  // Celebration animation values.
  const popScale = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        currentRef.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        forceRender();
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        currentRef.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        forceRender();
      },
      onPanResponderRelease: () => {
        if (currentRef.current) {
          pathsRef.current.push(currentRef.current);
          setStrokeCount((c) => c + 1);
        }
        currentRef.current = '';
        forceRender();
      },
    })
  ).current;

  const handleClear = () => {
    pathsRef.current = [];
    currentRef.current = '';
    setStrokeCount(0);
    forceRender();
  };

  const handleDone = () => {
    if (strokeCount === 0) {
      // Nudge them to trace first.
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setCelebrating(true);
    popScale.setValue(0);
    Animated.spring(popScale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseCelebration = () => {
    setCelebrating(false);
    handleClear();
  };

  const handleClose = () => {
    handleClear();
    setCelebrating(false);
    onClose?.();
  };

  // Earn 1–3 stars based on effort (number of strokes drawn).
  const earnedStars = Math.max(1, Math.min(3, Math.ceil(strokeCount / 2)));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.glyphChip, { backgroundColor: color + '1A', borderColor: color }]}>
              <Text style={[styles.glyphChipText, { color }, fontFamily && { fontFamily }]}>
                {character}
              </Text>
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Trace “{label || character}”
              </Text>
              <Text style={styles.headerSub}>Follow the dots with your finger ✏️</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Drawing surface */}
          <View
            style={[styles.canvasWrap, { width: CANVAS, height: CANVAS, borderColor: color + '55' }]}
            {...panResponder.panHandlers}
          >
            <Svg width={CANVAS} height={CANVAS}>
              {/* soft baseline grid */}
              <Rect x="0" y="0" width={CANVAS} height={CANVAS} fill="transparent" />
              {/* faint solid ghost of the glyph */}
              <SvgText
                x={CANVAS / 2}
                y={CANVAS * 0.74}
                fontSize={CANVAS * 0.66}
                fontWeight="900"
                fontFamily={fontFamily}
                fill={color + '14'}
                textAnchor="middle"
              >
                {character}
              </SvgText>
              {/* dotted outline guide on top */}
              <SvgText
                x={CANVAS / 2}
                y={CANVAS * 0.74}
                fontSize={CANVAS * 0.66}
                fontWeight="900"
                fontFamily={fontFamily}
                fill="none"
                stroke={color}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="1,14"
                textAnchor="middle"
              >
                {character}
              </SvgText>

              {/* completed strokes */}
              {pathsRef.current.map((d, i) => (
                <Path
                  key={i}
                  d={d}
                  stroke={color}
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.9}
                />
              ))}
              {/* live stroke */}
              {currentRef.current ? (
                <Path
                  d={currentRef.current}
                  stroke={color}
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.9}
                />
              ) : null}
            </Svg>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear} activeOpacity={0.85}>
              <Text style={styles.clearBtnText}>↺  Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.doneBtn,
                { backgroundColor: color },
                strokeCount === 0 && styles.doneBtnDisabled,
              ]}
              onPress={handleDone}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>✓  Done</Text>
            </TouchableOpacity>
          </View>

          {/* Celebration overlay */}
          {celebrating && (
            <View style={styles.celebrate}>
              <Animated.View style={[styles.celebrateCard, { transform: [{ scale: popScale }] }]}>
                <Text style={styles.celebrateEmoji}>🎉</Text>
                <Text style={styles.celebrateTitle}>Great writing!</Text>
                <View style={styles.starsRow}>
                  {[0, 1, 2].map((i) => (
                    <Text key={i} style={styles.star}>
                      {i < earnedStars ? '⭐' : '☆'}
                    </Text>
                  ))}
                </View>
                <Text style={styles.celebrateSub}>You traced “{label || character}” 🙌</Text>
                <View style={styles.celebrateBtns}>
                  <TouchableOpacity
                    style={styles.againBtn}
                    onPress={handleCloseCelebration}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.againBtnText}>Try again</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.finishBtn, { backgroundColor: color }]}
                    onPress={handleClose}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.finishBtnText}>Finish</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(15, 13, 40, 0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderRadius: 32,
      padding: Spacing.xl,
      width: '100%',
      maxWidth: 380,
      alignItems: 'center',
      elevation: 12,
      shadowColor: '#1E1B4B',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      overflow: 'hidden',
    },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginBottom: Spacing.lg,
      gap: Spacing.md,
    },
    glyphChip: {
      width: 52,
      height: 52,
      borderRadius: 16,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    glyphChipText: {
      fontSize: 26,
      fontWeight: '900',
      lineHeight: 40,
    },
    headerTextWrap: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '900',
      color: colors.textPrimary,
      letterSpacing: -0.3,
    },
    headerSub: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      marginTop: 2,
    },
    closeBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeBtnText: {
      fontSize: 15,
      fontWeight: '900',
      color: colors.textMuted,
    },

    // Canvas
    canvasWrap: {
      borderRadius: 24,
      borderWidth: 2,
      borderStyle: 'dashed',
      backgroundColor: colors.surfaceAlt,
      overflow: 'hidden',
    },

    // Controls
    controls: {
      flexDirection: 'row',
      width: '100%',
      gap: Spacing.md,
      marginTop: Spacing.lg,
    },
    clearBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    clearBtnText: {
      fontSize: 14,
      fontWeight: '900',
      color: colors.textMuted,
    },
    doneBtn: {
      flex: 1.4,
      paddingVertical: 14,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
    },
    doneBtnDisabled: {
      opacity: 0.5,
    },
    doneBtnText: {
      fontSize: 15,
      fontWeight: '900',
      color: '#FFFFFF',
    },

    // Celebration
    celebrate: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255,255,255,0.92)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
    },
    celebrateCard: {
      alignItems: 'center',
    },
    celebrateEmoji: {
      fontSize: 64,
      marginBottom: 8,
    },
    celebrateTitle: {
      fontSize: 24,
      fontWeight: '900',
      color: colors.textPrimary,
      letterSpacing: -0.4,
    },
    starsRow: {
      flexDirection: 'row',
      gap: 6,
      marginVertical: 12,
    },
    star: {
      fontSize: 34,
    },
    celebrateSub: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textMuted,
      marginBottom: 20,
      textAlign: 'center',
    },
    celebrateBtns: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    againBtn: {
      paddingVertical: 12,
      paddingHorizontal: 22,
      borderRadius: Radius.md,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    againBtnText: {
      fontSize: 14,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    finishBtn: {
      paddingVertical: 12,
      paddingHorizontal: 28,
      borderRadius: Radius.md,
    },
    finishBtnText: {
      fontSize: 14,
      fontWeight: '900',
      color: '#FFFFFF',
    },
  });

export default SketchCanvas;
