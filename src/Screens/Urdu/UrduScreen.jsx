import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../Context/ThemeContext';
import { useProgress } from '../../Context';
import { Fonts } from '../../Theme/fonts';
import { moduleColors } from '../../Theme/colors';
import { urduData } from '../../Data/urduData';
import { Header } from '../../Components/UI';
import { VocabularyTile, SketchCanvas } from '../../Components/Educational';
import SpeakButton from '../../Components/Common/SpeakButton';
import SpeedMiniPicker from '../../Components/Common/SpeedMiniPicker';
import QuizEntryBar from '../../Components/Common/QuizEntryBar';
import SpeechEngine from '../../Utils/speechEngine';

const UrduScreen = ({ navigation, route }) => {
  const colors = useThemeColors();
  const { height: winHeight } = useWindowDimensions();
  // Keeps the glyph/emoji proportional on very short or very tall devices;
  // everything else is flex, so the detail view always fits without scrolling.
  const scale = Math.min(1.1, Math.max(0.8, winHeight / 800));
  const styles = makeStyles(colors, scale);
  const { updateLastPosition } = useProgress();
  const [selectedLetter, setSelectedLetter] = useState(route?.params?.initialIndex ?? 0);
  const [sketchOpen, setSketchOpen] = useState(false);
  const letter = urduData[selectedLetter];
  const total = urduData.length;
  const hero = letter.vocabulary[0];
  // 3 tiles per row — 6 words fill two rows exactly.
  const wordRows = [letter.vocabulary.slice(0, 3), letter.vocabulary.slice(3, 6)];
  // Wrap around at both ends so no button is ever dead.
  const prevIdx = (selectedLetter - 1 + total) % total;
  const nextIdx = (selectedLetter + 1) % total;

  // Silence any clip when moving to another letter or leaving the screen.
  useEffect(() => {
    return () => {
      SpeechEngine.stop();
    };
  }, [selectedLetter]);

  // Remember wherever the child stops, so Home's Continue Learning can
  // resume straight into this letter later.
  useEffect(() => {
    updateLastPosition('urdu', selectedLetter);
  }, [selectedLetter]);

  const goToLetter = (idx) => {
    SpeechEngine.stop();
    setSelectedLetter(idx);
  };

  return (
    <View style={styles.container}>
      <Header
        title={`Haroof - ${letter.name}`}
        showBack={true}
        onBackPress={() => {
          SpeechEngine.stop();
          navigation.goBack();
        }}
        rightAction={
          <QuizEntryBar
            compact
            color={moduleColors.urdu.solid}
            onPress={() => navigation.navigate('QuizList', { module: 'urdu' })}
          />
        }
      />

      <View style={styles.stage}>
        {/* Hero — emoji beside the glyph, with both actions inside it so the
            card stays short and the word grid gets the height. */}
        <LinearGradient
          colors={[letter.gradientFrom, letter.gradientTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroDecor} />

          <View style={styles.heroTop}>
            <View style={styles.heroEmojiBubble}>
              <Text style={styles.heroEmoji}>{hero.emoji}</Text>
            </View>
            <View style={styles.heroTextCol}>
              <View style={styles.letterPair}>
                <Text style={styles.heroBig}>{letter.letter}</Text>
                <Text style={styles.heroSmall}>{letter.name}</Text>
              </View>
              <Text style={styles.heroWord} numberOfLines={1}>
                {hero.word}
              </Text>
            </View>
          </View>

          <View style={styles.heroActions}>
            <View style={styles.heroAction}>
              {/* Speak the Urdu glyph (not the romanized name) so the
                  pre-baked Urdu voice pronounces it correctly; the romanized
                  name is the no-voice-pack fallback. */}
              <SpeakButton
                text={letter.letter}
                language="ur-PK"
                fallbackText={letter.name}
                color="rgba(0,0,0,0.22)"
                label="🔊 Hear letter"
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
              accessibilityLabel={`Practice writing letter ${letter.name}`}
            >
              <Text style={styles.sketchPillText}>✏️ Write {letter.name}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Six words — 3 per row, 2 rows, sized to fill the leftover height */}
        <View style={styles.wordsSection}>
          <View style={styles.wordsTitleRow}>
            <Text style={styles.wordsTitle}>
              📚 Words with{' '}
              <Text style={[styles.wordsTitleGlyph, { color: letter.color }]}>
                {letter.letter}
              </Text>{' '}
              • ذخیرہ الفاظ
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
                    // The English meaning takes the badge slot the English
                    // deck uses for the category.
                    category={vocab.meaning}
                    categoryColor={letter.color}
                    // Speak the Urdu WORD, not its romanization: the pre-baked
                    // clip is an Urdu neural voice, which pronounces native
                    // script correctly and Latin ("Anaar") unreliably.
                    language="ur-PK"
                    fallbackText={vocab.speak}
                    wordStyle={styles.tileWord}
                    // Qaida-style "Alif se Anaar" — teaches the letter-sound link,
                    // not just the bare word. Fallback is the romanized approximation
                    // for devices with no Urdu voice pack, spoken in English.
                    speakText={`${letter.letter} سے ${vocab.word}`}
                    speakFallbackText={`${letter.name} se ${vocab.speak}`}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Move between letters without going back to the grid */}
      <View style={[styles.navBar, { paddingBottom: 10 }]}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => goToLetter(prevIdx)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Previous letter ${urduData[prevIdx].name}`}
        >
          {/* Arrow and glyph are separate Texts so the RTL script cannot
              reorder the arrow to the wrong side of the button. */}
          <Text style={styles.navBtnText}>←</Text>
          <Text style={styles.navBtnGlyph}>{urduData[prevIdx].letter}</Text>
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
          accessibilityLabel={`Next letter ${urduData[nextIdx].name}`}
        >
          <Text style={[styles.navBtnGlyph, styles.navBtnTextPrimary]}>
            {urduData[nextIdx].letter}
          </Text>
          <Text style={[styles.navBtnText, styles.navBtnTextPrimary]}>→</Text>
        </TouchableOpacity>
      </View>

      <SketchCanvas
        visible={sketchOpen}
        onClose={() => setSketchOpen(false)}
        character={letter.letter}
        label={letter.name}
        color={letter.color}
        fontFamily={Fonts.urduBold}
      />
    </View>
  );
};

const makeStyles = (colors, s) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // Detail view — one screen, no scrolling
  stage: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
  },
  // Short hero: it may grow into spare height but never past maxHeight, so
  // the word grid always keeps the bigger share of the screen. Nastaliq needs
  // a taller box than the Latin hero, hence the larger min/max.
  hero: {
    flex: 1,
    minHeight: 168,
    maxHeight: 212,
    borderRadius: 26,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    gap: 10,
    overflow: 'hidden',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.18)',
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
    marginBottom: 10,
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
    alignItems: 'center',
    gap: 8,
  },
  heroBig: {
    fontSize: 44 * s,
    fontWeight: '900',
    color: '#FFFFFF',
    // Nastaliq draws well below the baseline — ~1.6x or the glyph is clipped.
    lineHeight: 70 * s,
    fontFamily: Fonts.urduBold,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  heroSmall: {
    fontSize: 17 * s,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 24 * s,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    flexShrink: 1,
  },
  heroWord: {
    fontSize: 16 * s,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 28 * s,
    fontFamily: Fonts.urduBold,
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
  wordsTitleGlyph: {
    fontSize: 16,
    fontFamily: Fonts.urduBold,
  },
  wordsGrid: {
    flex: 1,
    gap: 10,
  },
  // maxHeight keeps the tiles near-square on tall devices instead of
  // stretching them into columns; spare height becomes row spacing.
  wordsRow: {
    flex: 1,
    maxHeight: 175,
    flexDirection: 'row',
    gap: 10,
  },
  wordTile: {
    flex: 1,
  },
  // Nastaliq inside the tile: bigger than the Latin word style and with ~1.6x
  // headroom the script needs, or the descenders get cut off. Kept lean so the
  // tile's speak pill still fits above the card's bottom padding.
  tileWord: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: Fonts.urduBold,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 8,
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
  navBtnGlyph: {
    fontSize: 20,
    lineHeight: 34,
    fontWeight: '900',
    fontFamily: Fonts.urduBold,
    color: colors.textPrimary,
  },
  navBtnTextPrimary: {
    color: '#FFFFFF',
  },
});

export default UrduScreen;
