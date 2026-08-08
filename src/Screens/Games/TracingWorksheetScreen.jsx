import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Header } from '../../Components/UI';
import { useTheme } from '../../Context/ThemeContext';
import { getGameTheme } from '../../Theme/gameThemes';
import { useAuth, useProgress } from '../../Context';
import SpeechEngine from '../../Utils/speechEngine';
import { SPEECH_PHRASES } from '../../Data/speechCatalog';
import { DrawCanvas, MarksBadge, GameStage, Mascot } from '../../Components/Games';
import traceSkeletons, { TRACE_LETTERS, TRACE_NUMBERS } from '../../Data/traceSkeletons';
import { densifySkeleton, skeletonToPath, scoreTrace, scoreFreeform } from '../../Utils/traceScoring';
import { alphabetData } from '../../Data/alphabetData';
import { urduData } from '../../Data/urduData';
import { Fonts } from '../../Theme/fonts';

// ──────────────────────────────────────────────────────────────
// TracingWorksheetScreen — school-copybook writing practice.
// The same letter repeats across 4 boxes with progressively fainter
// guides. Each attempt is graded out of 10 (accuracy vs the guide)
// with an animated marks badge, then a row total like 32/40.
// ──────────────────────────────────────────────────────────────

const { width: SCREEN_W } = Dimensions.get('window');
const ATTEMPTS = 4;
const CELL = Math.floor((SCREEN_W - 16 * 2 - 12) / 2); // 2-column grid
const CELL_PAD = Math.round(CELL * 0.12);
const GUIDE_OPACITY = [0.9, 0.55, 0.35, 0.18]; // progressive fading

// Glyph keypad under the tabs: every glyph of the active set laid out in
// full-width wrapping rows (A B C D E F G / H I J …) instead of a cramped
// horizontal strip, so a child can see and reach the whole alphabet.
const GLYPH_COLS = 7;
const GLYPH_GAP = 6;
const PANEL_PAD = 8;
const GLYPH_SIZE = Math.floor(
  (SCREEN_W - 16 * 2 - PANEL_PAD * 2 - GLYPH_GAP * (GLYPH_COLS - 1)) / GLYPH_COLS
);

const TRACE_URDU = urduData.map((h) => h.letter);

const SETS = [
  { key: 'abc', label: 'ABC', glyphs: TRACE_LETTERS },
  { key: '123', label: '123', glyphs: TRACE_NUMBERS },
  // Urdu haroof have no hand-authored skeleton — they trace over a Nastaliq
  // ghost glyph and are graded with the freeform (placement/effort) scorer.
  { key: 'urdu', label: 'اردو', glyphs: TRACE_URDU, urdu: true },
];

const ACCENTS = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

// A picture that actually belongs to the glyph being written — A → 🍎,
// 7 → 🌈, ا → 🍎 (انار) — instead of one fixed mascot for every letter.
const NUMBER_EMOJI = ['🥚', '☝️', '✌️', '🌳', '🍀', '🖐️', '🎲', '🌈', '🐙', '🎈'];

const glyphEmoji = (setKey, glyph) => {
  if (setKey === '123') return NUMBER_EMOJI[Number(glyph)] || '🔢';
  const source = setKey === 'urdu' ? urduData : alphabetData;
  const entry = source.find((e) => e.letter === glyph);
  return entry?.vocabulary?.[0]?.emoji || '✏️';
};

const emptyCells = () => Array.from({ length: ATTEMPTS }, () => null); // null | { marks, paths }

const TracingWorksheetScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const gt = getGameTheme(7, isDark); // violet stage
  const { addStars } = useAuth();
  const { recordGameComplete } = useProgress();
  const styles = makeStyles(colors);

  const [setKey, setSetKey] = useState('abc');
  const [glyphIdx, setGlyphIdx] = useState(0);
  const [cells, setCells] = useState(emptyCells);
  const [activeIdx, setActiveIdx] = useState(0);
  const [feedback, setFeedback] = useState(null); // { marks, retry: bool }
  const [rowDone, setRowDone] = useState(false);
  const [starsAwarded, setStarsAwarded] = useState(0);
  const canvasRef = useRef(null);

  const set = SETS.find((s) => s.key === setKey) || SETS[0];
  const glyph = set.glyphs[glyphIdx];
  const accent = ACCENTS[glyphIdx % ACCENTS.length];
  const skeleton = traceSkeletons[glyph] || [];
  const hasSkeleton = skeleton.length > 0;
  const isUrdu = !!set.urdu;
  const glyphFont = isUrdu ? Fonts.urduBold : undefined;
  const picture = glyphEmoji(set.key, glyph);

  const guidePts = useMemo(() => densifySkeleton(skeleton, CELL, CELL_PAD), [skeleton]);
  const guidePaths = useMemo(() => skeleton.map((line) => skeletonToPath(line, CELL, CELL_PAD)), [skeleton]);

  const totalMarks = cells.reduce((sum, c) => sum + (c?.marks || 0), 0);

  const resetRow = (nextGlyphIdx = glyphIdx, nextSetKey = setKey) => {
    setSetKey(nextSetKey);
    setGlyphIdx(nextGlyphIdx);
    setCells(emptyCells());
    setActiveIdx(0);
    setFeedback(null);
    setRowDone(false);
    setStarsAwarded(0);
    canvasRef.current?.clear();
  };

  const handleCheck = () => {
    const strokes = canvasRef.current?.getStrokes() || [];
    if (strokes.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    const { marks } = hasSkeleton
      ? scoreTrace(guidePts, strokes, CELL)
      : scoreFreeform(strokes, CELL);
    Haptics.notificationAsync(
      marks >= 5 ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});

    const result = { marks, paths: strokes.map((s) => s.d) };
    setFeedback({ marks, cellIdx: activeIdx });

    if (marks >= 5) {
      SpeechEngine.speak(marks >= 8 ? SPEECH_PHRASES.TRACE_AMAZING : SPEECH_PHRASES.TRACE_GOOD, 'en-US');
      commitCell(result);
    } else {
      // Written wrong — show feedback, let them retry or keep it.
      SpeechEngine.speak(SPEECH_PHRASES.TRACE_WRONG, 'en-US');
      setCells((prev) => {
        const next = [...prev];
        next[activeIdx] = { ...result, pendingRetry: true };
        return next;
      });
    }
  };

  const commitCell = (result) => {
    setCells((prev) => {
      const next = [...prev];
      next[activeIdx] = result;

      if (activeIdx === ATTEMPTS - 1) {
        const total = next.reduce((sum, c) => sum + (c?.marks || 0), 0);
        const reward = calculateReward(total);
        setStarsAwarded(reward);
        addStars(reward);
        recordGameComplete({ xpAmount: reward });
        setRowDone(true);
        // Fixed praise phrase (pre-baked teacher voice); the score/stars show
        // on screen rather than being read as dynamic numbers.
        SpeechEngine.speak(SPEECH_PHRASES.WORKSHEET_COMPLETE, 'en-US');
      } else {
        setActiveIdx(activeIdx + 1);
      }
      return next;
    });
    canvasRef.current?.clear();
    setTimeout(() => setFeedback(null), 1600);
  };

  const handleRetryCell = () => {
    setCells((prev) => {
      const next = [...prev];
      next[activeIdx] = null;
      return next;
    });
    canvasRef.current?.clear();
    setFeedback(null);
  };

  const handleKeepAndContinue = () => {
    const cell = cells[activeIdx];
    if (!cell) return;
    commitCell({ marks: cell.marks, paths: cell.paths });
  };

  const calculateReward = (total) => {
    const ratio = total / (ATTEMPTS * 10);
    if (ratio >= 0.9) return 20;
    if (ratio >= 0.7) return 15;
    if (ratio >= 0.5) return 10;
    return 5;
  };

  const nextGlyph = () => resetRow((glyphIdx + 1) % set.glyphs.length);

  const renderGuide = (opacity) => {
    // Urdu haroof: a faint Nastaliq ghost + dotted outline of the same glyph,
    // matching the guide the Sketch practice sheet uses.
    if (!hasSkeleton) {
      const common = {
        x: CELL / 2,
        y: CELL * 0.74,
        fontSize: CELL * 0.58,
        fontWeight: '900',
        fontFamily: glyphFont,
        textAnchor: 'middle',
      };
      return (
        <>
          <SvgText {...common} fill={accent} opacity={opacity * 0.18}>
            {glyph}
          </SvgText>
          <SvgText
            {...common}
            fill="none"
            stroke={accent}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="1,12"
            opacity={opacity}
          >
            {glyph}
          </SvgText>
        </>
      );
    }
    return (
    <>
      {guidePaths.map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke={accent}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1,12"
          fill="none"
          opacity={opacity}
        />
      ))}
      {/* start dot on the first point of the first stroke */}
      {skeleton[0] ? (
        <Circle
          cx={CELL_PAD + skeleton[0][0][0] * (CELL - CELL_PAD * 2)}
          cy={CELL_PAD + skeleton[0][0][1] * (CELL - CELL_PAD * 2)}
          r={6}
          fill={accent}
          opacity={Math.min(1, opacity + 0.2)}
        />
      ) : null}
    </>
    );
  };

  const retryPending = cells[activeIdx]?.pendingRetry && !rowDone;

  return (
    <GameStage theme={gt}>
      <Header title="Tracing Worksheet ✍️" showBack variant="transparent" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* The picture belongs to the glyph on the sheet, so it changes with
            every letter/number/haroof instead of being one fixed mascot. */}
        <View style={styles.mascotWrap}>
          <Mascot key={`${setKey}-${glyph}`} emoji={picture} size={58} glow={gt.deco} style={styles.mascot} />
        </View>

        {/* Set tabs — the three sets share one row, equal width */}
        <View style={styles.setTabs}>
          {SETS.map((s) => {
            const active = setKey === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                style={[styles.setTab, active && { backgroundColor: accent, borderColor: accent }]}
                onPress={() => resetRow(0, s.key)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.setTabText,
                    s.urdu && styles.urduTabText,
                    active && styles.setTabTextActive,
                  ]}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Every glyph of the tapped tab, wrapped across full rows */}
        <View style={styles.glyphPanel}>
          {set.glyphs.map((g, i) => {
            const active = i === glyphIdx;
            return (
              <TouchableOpacity
                key={g}
                style={[
                  styles.glyphChip,
                  active && { backgroundColor: accent, borderColor: accent },
                ]}
                onPress={() => resetRow(i)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.glyphChipText,
                    isUrdu && styles.urduChipText,
                    active && styles.glyphChipTextActive,
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.hint}>
          Write “<Text style={glyphFont && { fontFamily: glyphFont }}>{glyph}</Text>” in every box — follow the
          {hasSkeleton ? ' dots' : ' shape'}! Each box is marked out of 10. 📝
        </Text>

        {/* Copybook grid */}
        <View style={styles.grid}>
          {cells.map((cell, i) => {
            const isActive = i === activeIdx && !rowDone;
            return (
              <View
                key={i}
                style={[
                  styles.cell,
                  { width: CELL, height: CELL },
                  isActive && { borderColor: accent, borderStyle: 'solid', borderWidth: 2.5 },
                ]}
              >
                {isActive ? (
                  <DrawCanvas
                    ref={canvasRef}
                    width={CELL - 5}
                    height={CELL - 5}
                    strokeColor={accent}
                    strokeWidth={9}
                  >
                    {renderGuide(GUIDE_OPACITY[i])}
                  </DrawCanvas>
                ) : (
                  <Svg width={CELL - 5} height={CELL - 5}>
                    {renderGuide(cell ? 0.12 : GUIDE_OPACITY[i])}
                    {cell?.paths?.map((d, k) => (
                      <Path
                        key={k}
                        d={d}
                        stroke={accent}
                        strokeWidth={9}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        opacity={0.9}
                      />
                    ))}
                  </Svg>
                )}

                {/* per-cell mark */}
                {cell && !cell.pendingRetry ? (
                  <View style={styles.cellMark}>
                    <MarksBadge marks={cell.marks} size="sm" />
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* Controls / feedback */}
        {rowDone ? (
          <View style={styles.resultCard}>
            <MarksBadge marks={totalMarks} outOf={ATTEMPTS * 10} />
            <Text style={styles.resultStars}>+{starsAwarded} ⭐ earned!</Text>
            <View style={styles.resultBtns}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => resetRow()} activeOpacity={0.85}>
                <Text style={styles.secondaryBtnText}>
                  Practice “<Text style={glyphFont && { fontFamily: glyphFont }}>{glyph}</Text>” again 🔁
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: accent }]} onPress={nextGlyph} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Next letter →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : retryPending ? (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>😅 You wrote it wrong — {cells[activeIdx].marks}/10</Text>
            <Text style={styles.feedbackSub}>Follow the dotted lines slowly, you can do it!</Text>
            <View style={styles.resultBtns}>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: accent }]} onPress={handleRetryCell} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Try this box again ✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleKeepAndContinue} activeOpacity={0.85}>
                <Text style={styles.secondaryBtnText}>Keep it & continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.controls}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => canvasRef.current?.clear()} activeOpacity={0.85}>
              <Text style={styles.secondaryBtnText}>↺ Clear box</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: accent }]} onPress={handleCheck} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Check ✓</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </GameStage>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  // Footer buttons sit 10px off the bottom — no tab-bar clearance is needed
  // here because the bar is hidden on this pushed game screen.
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10 },
  mascotWrap: { marginVertical: 6 },
  mascot: { alignSelf: 'center', marginBottom: 6 },

  setTabs: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  setTab: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  setTabText: { fontSize: 14, fontWeight: '900', color: colors.textSecondary },
  setTabTextActive: { color: '#FFF' },
  // Nastaliq needs a taller line box or the glyph clips.
  urduTabText: { fontFamily: Fonts.urduBold, fontSize: 17, lineHeight: 30 },

  glyphPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GLYPH_GAP,
    padding: PANEL_PAD,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  glyphChip: {
    width: GLYPH_SIZE,
    height: GLYPH_SIZE,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphChipText: { fontSize: 15, fontWeight: '900', color: colors.textSecondary },
  glyphChipTextActive: { color: '#FFF' },
  urduChipText: { fontFamily: Fonts.urduBold, fontSize: 16, lineHeight: 30 },

  hint: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 17,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  cell: {
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellMark: { position: 'absolute', top: 6, right: 6 },

  controls: { flexDirection: 'row', gap: 12, marginTop: 16 },
  primaryBtn: {
    flex: 1.3,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 3,
  },
  primaryBtnText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
  secondaryBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  secondaryBtnText: { color: colors.textPrimary, fontWeight: '900', fontSize: 13 },

  feedbackCard: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  feedbackTitle: { fontSize: 15, fontWeight: '900', color: colors.textPrimary },
  feedbackSub: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },

  resultCard: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 18,
    alignItems: 'center',
    gap: 10,
  },
  resultStars: { fontSize: 15, fontWeight: '900', color: colors.textPrimary },
  resultBtns: { flexDirection: 'row', gap: 10, marginTop: 4, width: '100%' },
});

export default TracingWorksheetScreen;
