import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { useProgress } from '../../Context';
import { moduleColors } from '../../Theme/colors';
import { alphabetData } from '../../Data/alphabetData';
import { Header } from '../../Components/UI';
import AlphabetCard, { COLUMN_GAP } from '../../Components/Educational/AlphabetCard';
import { VocabularyTile, SketchCanvas } from '../../Components/Educational';
import SpeakButton from '../../Components/Common/SpeakButton';
import SpeedMiniPicker from '../../Components/Common/SpeedMiniPicker';
import QuizEntryBar from '../../Components/Common/QuizEntryBar';
import SpeechEngine from '../../Utils/speechEngine';
import { useTabBarClearance } from '../../Hooks';

const AlphabetScreen = ({ navigation, route }) => {
  const colors = useThemeColors();
  // Tight clearance so the Prev/Next bar hugs the bottom edge. This route is
  // pushed inside HomeStack (tab bar hidden), so the hook returns just the
  // safe-area inset plus this extra.
  const bottomPad = useTabBarClearance(6);
  const { height: winHeight } = useWindowDimensions();
  // Everything in the detail view is laid out with flex so it always fits the
  // viewport; this factor only keeps the type/emoji proportional on very short
  // or very tall devices.
  const scale = Math.min(1.1, Math.max(0.8, winHeight / 800));
  const styles = makeStyles(colors, scale);
  const { updateLastPosition } = useProgress();
  const [selectedLetter, setSelectedLetter] = useState(route?.params?.initialIndex ?? null);
  const [sketchOpen, setSketchOpen] = useState(false);
  const letter = selectedLetter !== null ? alphabetData[selectedLetter] : null;

  // Silence any clip when moving to another letter or leaving the detail view.
  useEffect(() => {
    return () => {
      SpeechEngine.stop();
    };
  }, [selectedLetter]);

  // Remember wherever the child stops, so Home's Continue Learning can
  // resume straight into this letter later.
  useEffect(() => {
    if (selectedLetter !== null) updateLastPosition('alphabet', selectedLetter);
  }, [selectedLetter]);

  // ─── Detail view ──────────────────────────────────────────
  if (selectedLetter !== null && letter) {
    const total = alphabetData.length;
    const upper = letter.letter;
    const lower = letter.letter.toLowerCase();
    const hero = letter.vocabulary[0];
    // 3 tiles per row — 6 words fill two rows exactly.
    const wordRows = [letter.vocabulary.slice(0, 3), letter.vocabulary.slice(3, 6)];
    // Wrap around at both ends so no button is ever dead: Z → A, A → Z.
    const prevIdx = (selectedLetter - 1 + total) % total;
    const nextIdx = (selectedLetter + 1) % total;

    const goToLetter = (idx) => {
      SpeechEngine.stop();
      setSelectedLetter(idx);
    };

    return (
      <View style={styles.container}>
        <Header
          title={`Letter ${upper}`}
          showBack={true}
          onBackPress={() => setSelectedLetter(null)}
          rightAction={
            <QuizEntryBar
              compact
              color={moduleColors.alphabet.solid}
              onPress={() => navigation.navigate('QuizList', { module: 'alphabet' })}
            />
          }
        />

        <View style={styles.stage}>
          {/* Hero — emoji beside the letter pair, with both actions inside it
              so the card stays short and the word grid gets the height. */}
          <View
            style={[
              styles.hero,
              { backgroundColor: letter.color, borderBottomColor: letter.borderColor },
            ]}
          >
            <View style={styles.heroDecor} />

            <View style={styles.heroTop}>
              <View style={styles.heroEmojiBubble}>
                <Text style={styles.heroEmoji}>{hero.emoji}</Text>
              </View>
              <View style={styles.heroTextCol}>
                <View style={styles.letterPair}>
                  <Text style={styles.heroBig}>{upper}</Text>
                  <Text style={styles.heroSmall}>{lower}</Text>
                </View>
                <Text style={styles.heroWord} numberOfLines={1}>
                  {hero.word}
                </Text>
              </View>
            </View>

            <View style={styles.heroActions}>
              <View style={styles.heroAction}>
                {/* Speaks the letter NAME ("Bee", "Cee", "Dee", …) via
                    LETTER_IPA in generateAudio.mjs — matches how the SAME
                    letter is pronounced in the "B for Ball" word tiles below.
                    A phonics-sound variant ("æ" not "ay") was tried 2026-08-01
                    and reverted the same day: distorted in isolation, and not
                    what was wanted anyway. Renders at normal rate (0%); the
                    floor here only cushions playback-time slowdown from the
                    global speed setting, it isn't compensating for a baked
                    slow rate anymore. */}
                <SpeakButton
                  text={upper}
                  language="en-US"
                  color="rgba(0,0,0,0.22)"
                  label={`🔊 Hear "${upper}"`}
                  size="sm"
                  clipRate={1}
                  minClipRate={0.85}
                  rate={0.85}
                />
              </View>
              <TouchableOpacity
                style={styles.sketchPill}
                onPress={() => setSketchOpen(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Practice writing letter ${upper}`}
              >
                <Text style={styles.sketchPillText}>✏️ Write {upper}{lower}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Six words — 3 per row, 2 rows, sized to fill the leftover height */}
          <View style={styles.wordsSection}>
            <View style={styles.wordsTitleRow}>
              <Text style={styles.wordsTitle}>
                📚 Words with <Text style={{ color: letter.color }}>"{upper}"</Text>
              </Text>
              <SpeedMiniPicker accentColor={letter.color} />
            </View>
            <View style={styles.wordsGrid}>
              {wordRows.map((row, rowIdx) => (
                <View key={`row-${rowIdx}`} style={styles.wordsRow}>
                  {row.map((vocab, idx) => (
                    <VocabularyTile
                      key={`${vocab.word}-${idx}`}
                      style={styles.wordTile}
                      emoji={vocab.emoji}
                      word={vocab.word}
                      category={vocab.category}
                      categoryColor={letter.color}
                      // Teaches the letter-sound link: "A for Apple", not just "Apple".
                      speakText={`${upper} for ${vocab.word}`}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Move between letters without going back to the grid */}
        <View style={[styles.navBar, { paddingBottom: 12 }]}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => goToLetter(prevIdx)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Previous letter ${alphabetData[prevIdx].letter}`}
          >
            <Text style={styles.navBtnText}>← {alphabetData[prevIdx].letter}</Text>
          </TouchableOpacity>

          <View style={styles.navCounter}>
            <Text style={[styles.navCounterText, { color: letter.color }]}>
              {selectedLetter + 1} / {total}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.navBtn, styles.navBtnPrimary, { backgroundColor: letter.color }]}
            onPress={() => goToLetter(nextIdx)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Next letter ${alphabetData[nextIdx].letter}`}
          >
            <Text style={[styles.navBtnText, styles.navBtnTextPrimary]}>
              {alphabetData[nextIdx].letter} →
            </Text>
          </TouchableOpacity>
        </View>

        <SketchCanvas
          visible={sketchOpen}
          onClose={() => setSketchOpen(false)}
          character={letter.letter}
          label={`Letter ${letter.letter}`}
          color={letter.color}
        />
      </View>
    );
  }

  // ─── Grid view ────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Header
        title="English ABC"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={alphabetData}
        keyExtractor={(item) => item.letter}
        numColumns={2}
        contentContainerStyle={[styles.gridContent, { paddingBottom: bottomPad }]}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <QuizEntryBar
            color={moduleColors.alphabet.solid}
            onPress={() => navigation.navigate('QuizList', { module: 'alphabet' })}
          />
        }
        renderItem={({ item, index }) => (
          <AlphabetCard
            letter={item.letter}
            color={item.color}
            gradientFrom={item.gradientFrom}
            gradientTo={item.gradientTo}
            emoji={item.vocabulary[0].emoji}
            word={item.vocabulary[0].word}
            onPress={() => setSelectedLetter(index)}
          />
        )}
      />
    </View>
  );
};

const makeStyles = (colors, s) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // Grid view
  gridContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    // rowGap only — horizontal spacing lives in columnWrapper because
    // AlphabetCard's CARD_SIZE is derived from it.
    rowGap: 12,
  },
  // No justifyContent: the cards + COLUMN_GAP fill the row exactly, so any
  // distribution rule would only add phantom spacing.
  columnWrapper: {
    gap: COLUMN_GAP,
  },

  // Detail view — one screen, no scrolling
  stage: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
  },
  // Short hero: it may grow into spare height but never past maxHeight, so
  // the word grid always keeps the bigger share of the screen.
  hero: {
    flex: 1,
    minHeight: 146,
    maxHeight: 190,
    borderRadius: 26,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    gap: 10,
    overflow: 'hidden',
    borderBottomWidth: 4,
    elevation: 8,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  heroDecor: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  heroEmojiBubble: {
    width: 90 * s,
    height: 90 * s,
    borderRadius: 45 * s,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 55 * s,
    lineHeight: 65 * s,
    textAlign: 'center',
  },
  heroTextCol: {
    flex: 1,
  },
  letterPair: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  heroBig: {
    fontSize: 46 * s,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 52 * s,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  heroSmall: {
    fontSize: 32 * s,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 38 * s,
  },
  heroWord: {
    fontSize: 15 * s,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroAction: {
    flex: 1,
  },
  // Mirrors SpeakButton size="sm" so both hero pills read as a pair.
  sketchPill: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sketchPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  wordsSection: {
    flex: 2,
  },
  wordsTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
    gap: 8,
  },
  wordsTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  wordsGrid: {
    flex: 1,
    gap: 10,
    // justifyContent: 'space-evenly',
  },
  // maxHeight keeps the tiles near-square on tall devices instead of
  // stretching them into columns; spare height becomes row spacing.
  wordsRow: {
    flex: 1,
    maxHeight: 180,
    flexDirection: 'row',
    gap: 10,
  },
  wordTile: {
    flex: 1,
  },

  // Prev / Next bar — stays in normal flow so it never overlaps content
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  navBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  navBtnPrimary: {
    borderWidth: 0,
  },
  navCounter: {
    minWidth: 56,
    alignItems: 'center',
  },
  navCounterText: {
    fontSize: 13,
    fontWeight: '900',
  },
  navBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  navBtnTextPrimary: {
    color: '#FFFFFF',
  },
});

export default AlphabetScreen;
