import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Path, Text as SvgText, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../../Context/ThemeContext';
import { useAuth } from '../../Context';
import { Radius, Spacing } from '../../Theme';
import { DrawCanvas, MarksBadge } from '../Games';
import traceSkeletons from '../../Data/traceSkeletons';
import { densifySkeleton, skeletonToPath, scoreTrace, scoreFreeform } from '../../Utils/traceScoring';
import SpeechEngine from '../../Utils/speechEngine';
import { SPEECH_PHRASES } from '../../Data/speechCatalog';

const { width: SCREEN_W } = Dimensions.get('window');

// How many times the child writes the glyph in one practice session.
const ATTEMPTS = 5;
// A pass mark: below this we call the writing "wrong" and offer a retry.
const PASS = 5;

// ──────────────────────────────────────────────────────────────
// SketchCanvas — a premium multi-attempt "practice writing" screen.
//
// Opened from the Sketch button on any letter / number / haroof detail
// view. The child writes the glyph several times over a dotted guide.
// Every attempt is GRADED FOR REAL out of 10 (accuracy vs the writing
// skeleton, not just effort) so a careless scribble scores low and a
// careful trace scores high. Wrong attempts can be retried, and stars
// are awarded from the actual total at the end.
//
// Props:
//   visible      bool      — controls the modal
//   onClose      fn        — called to dismiss
//   character    string    — the glyph to write (e.g. "A", "7", "ا")
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
  const { addStars } = useAuth();

  // Square drawing surface, capped so it always fits on screen.
  const CANVAS = useMemo(() => Math.min(SCREEN_W - 48, 320), []);
  const PAD = useMemo(() => Math.round(CANVAS * 0.14), [CANVAS]);

  // A real writing skeleton exists for A–Z and 0–9. Urdu haroof fall back
  // to the font-glyph guide + a placement/effort heuristic score.
  const skeleton = useMemo(() => {
    const key = String(character);
    return traceSkeletons[key] || traceSkeletons[key.toUpperCase()] || null;
  }, [character]);
  const hasSkeleton = !!(skeleton && skeleton.length);

  const guidePts = useMemo(
    () => (hasSkeleton ? densifySkeleton(skeleton, CANVAS, PAD) : []),
    [skeleton, hasSkeleton, CANVAS, PAD]
  );
  const guidePaths = useMemo(
    () => (hasSkeleton ? skeleton.map((line) => skeletonToPath(line, CANVAS, PAD)) : []),
    [skeleton, hasSkeleton, CANVAS, PAD]
  );

  const canvasRef = useRef(null);
  const [attemptIdx, setAttemptIdx] = useState(0);
  const [results, setResults] = useState(() => Array(ATTEMPTS).fill(null)); // (number|null)[]
  const [phase, setPhase] = useState('draw'); // 'draw' | 'graded' | 'done'
  const [lastMarks, setLastMarks] = useState(0);
  const [starsAwarded, setStarsAwarded] = useState(0);

  const totalMarks = results.reduce((sum, m) => sum + (m || 0), 0);
  const lastGood = lastMarks >= PASS;

  const resetSession = useCallback(() => {
    setAttemptIdx(0);
    setResults(Array(ATTEMPTS).fill(null));
    setPhase('draw');
    setLastMarks(0);
    setStarsAwarded(0);
    canvasRef.current?.clear();
  }, []);

  const handleClose = () => {
    resetSession();
    onClose?.();
  };

  const handleClear = () => canvasRef.current?.clear();

  const rewardFor = (total) => {
    const ratio = total / (ATTEMPTS * 10);
    if (ratio >= 0.9) return 15;
    if (ratio >= 0.7) return 10;
    if (ratio >= 0.5) return 6;
    return 3;
  };

  const handleCheck = () => {
    const strokes = canvasRef.current?.getStrokes() || [];
    if (strokes.length === 0) {
      // Nudge them to write first.
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }

    const { marks } = hasSkeleton
      ? scoreTrace(guidePts, strokes, CANVAS)
      : scoreFreeform(strokes, CANVAS);

    Haptics.notificationAsync(
      marks >= PASS
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});

    // Kid-paced praise: a touch slower than normal so a young child clearly
    // hears the encouragement. Still scales with the grown-up's global speed.
    SpeechEngine.speak(
      marks >= 8
        ? SPEECH_PHRASES.TRACE_AMAZING
        : marks >= PASS
        ? SPEECH_PHRASES.TRACE_GOOD
        : SPEECH_PHRASES.TRACE_WRONG,
      'en-US',
      { clipRate: 0.8, rate: 0.8 }
    );

    setLastMarks(marks);
    setPhase('graded');
  };

  // Record the just-graded attempt and move on (or finish the session).
  const commitAndAdvance = () => {
    const marks = lastMarks;
    const isLast = attemptIdx === ATTEMPTS - 1;

    setResults((prev) => {
      const next = [...prev];
      next[attemptIdx] = marks;
      if (isLast) {
        const total = next.reduce((sum, m) => sum + (m || 0), 0);
        const reward = rewardFor(total);
        setStarsAwarded(reward);
        addStars(reward);
        // Fixed praise phrase (pre-baked teacher voice); the score/stars are
        // shown on the summary screen rather than read as dynamic numbers.
        SpeechEngine.speak(SPEECH_PHRASES.SKETCH_COMPLETE, 'en-US', { clipRate: 0.8, rate: 0.8 });
      }
      return next;
    });

    canvasRef.current?.clear();
    if (isLast) {
      setPhase('done');
    } else {
      setAttemptIdx(attemptIdx + 1);
      setPhase('draw');
    }
  };

  // Redo the SAME attempt (offered when the writing was wrong).
  const handleRetry = () => {
    canvasRef.current?.clear();
    setPhase('draw');
  };

  // ─── Guide rendering (drawn UNDER the child's ink) ─────────────
  const renderGuide = () => {
    if (hasSkeleton) {
      return (
        <>
          {guidePaths.map((d, i) => (
            <Path
              key={i}
              d={d}
              stroke={color}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1,12"
              fill="none"
              opacity={0.85}
            />
          ))}
          {skeleton[0] ? (
            <Circle
              cx={PAD + skeleton[0][0][0] * (CANVAS - PAD * 2)}
              cy={PAD + skeleton[0][0][1] * (CANVAS - PAD * 2)}
              r={7}
              fill={color}
            />
          ) : null}
        </>
      );
    }
    // Font-glyph fallback (Urdu): faint solid ghost + dotted outline.
    return (
      <>
        <SvgText
          x={CANVAS / 2}
          y={CANVAS * 0.74}
          fontSize={CANVAS * 0.6}
          fontWeight="900"
          fontFamily={fontFamily}
          fill={color + '14'}
          textAnchor="middle"
        >
          {character}
        </SvgText>
        <SvgText
          x={CANVAS / 2}
          y={CANVAS * 0.74}
          fontSize={CANVAS * 0.6}
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
      </>
    );
  };

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
                Write “{label || character}”
              </Text>
              <Text style={styles.headerSub}>
                {phase === 'done'
                  ? 'Practice complete! 🎉'
                  : `Attempt ${attemptIdx + 1} of ${ATTEMPTS} — follow the dots ✏️`}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Attempt progress dots (each shows its earned marks) */}
          <View style={styles.progressRow}>
            {results.map((m, i) => {
              const active = i === attemptIdx && phase !== 'done';
              const filled = m !== null;
              return (
                <View
                  key={i}
                  style={[
                    styles.progressDot,
                    { borderColor: color + '66' },
                    filled && { backgroundColor: color, borderColor: color },
                    active && { borderColor: color, borderWidth: 2.5 },
                  ]}
                >
                  <Text style={[styles.progressDotText, filled && { color: '#FFF' }]}>
                    {filled ? m : i + 1}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Drawing surface */}
          {phase === 'done' ? (
            <View style={[styles.canvasWrap, styles.summaryWrap, { width: CANVAS, height: CANVAS, borderColor: color + '55' }]}>
              <MarksBadge marks={totalMarks} outOf={ATTEMPTS * 10} />
              <Text style={styles.summaryStars}>+{starsAwarded} ⭐ earned!</Text>
              <Text style={styles.summarySub}>
                You wrote “{label || character}” {ATTEMPTS} times 🙌
              </Text>
            </View>
          ) : (
            <View style={[styles.canvasWrap, { width: CANVAS, height: CANVAS, borderColor: color + '55' }]}>
              <DrawCanvas
                ref={canvasRef}
                width={CANVAS}
                height={CANVAS}
                strokeColor={color}
                strokeWidth={10}
              >
                {renderGuide()}
              </DrawCanvas>

              {/* Inline grade after checking an attempt */}
              {phase === 'graded' && (
                <View style={styles.gradeOverlay} pointerEvents="none">
                  <MarksBadge marks={lastMarks} />
                </View>
              )}
            </View>
          )}

          {/* Controls */}
          {phase === 'draw' && (
            <View style={styles.controls}>
              <TouchableOpacity style={styles.clearBtn} onPress={handleClear} activeOpacity={0.85}>
                <Text style={styles.clearBtnText}>↺  Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: color }]}
                onPress={handleCheck}
                activeOpacity={0.85}
              >
                <Text style={styles.doneBtnText}>✓  Check</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'graded' && (
            <View style={styles.controls}>
              {lastGood ? (
                <TouchableOpacity
                  style={[styles.doneBtn, { backgroundColor: color, flex: 1 }]}
                  onPress={commitAndAdvance}
                  activeOpacity={0.85}
                >
                  <Text style={styles.doneBtnText}>
                    {attemptIdx === ATTEMPTS - 1 ? 'See results →' : 'Next attempt →'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity style={styles.clearBtn} onPress={commitAndAdvance} activeOpacity={0.85}>
                    <Text style={styles.clearBtnText}>Keep it</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.doneBtn, { backgroundColor: color }]}
                    onPress={handleRetry}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.doneBtnText}>✏️  Try again</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {phase === 'done' && (
            <View style={styles.controls}>
              <TouchableOpacity style={styles.clearBtn} onPress={resetSession} activeOpacity={0.85}>
                <Text style={styles.clearBtnText}>🔁  Practice again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: color }]}
                onPress={handleClose}
                activeOpacity={0.85}
              >
                <Text style={styles.doneBtnText}>Finish</Text>
              </TouchableOpacity>
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
      marginBottom: Spacing.md,
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

    // Attempt progress
    progressRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: Spacing.md,
    },
    progressDot: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceAlt,
    },
    progressDotText: {
      fontSize: 13,
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
    summaryWrap: {
      borderStyle: 'solid',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: Spacing.lg,
    },
    summaryStars: {
      fontSize: 18,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    summarySub: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      textAlign: 'center',
    },
    gradeOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
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
    doneBtnText: {
      fontSize: 15,
      fontWeight: '900',
      color: '#FFFFFF',
    },
  });

export default SketchCanvas;
