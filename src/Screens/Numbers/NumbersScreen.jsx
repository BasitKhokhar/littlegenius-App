import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../Context/ThemeContext';
import { useProgress } from '../../Context';
import { numbersData } from '../../Data/numbersData';
import { Header } from '../../Components/UI';
import SpeakButton from '../../Components/Common/SpeakButton';
import QuizEntryBar from '../../Components/Common/QuizEntryBar';
import { SketchCanvas } from '../../Components/Educational';
import SpeechEngine from '../../Utils/speechEngine';
import { Radius, Elevation, coloredShadow, moduleColors } from '../../Theme';

// The count grid has to hold anywhere from 1 to 100 emoji in the same card,
// so the glyph shrinks in tiers as the number grows — otherwise 100 items at
// the size that suits "3" would blow well past the screen.
const getCountItemStyle = (n) => {
  if (n <= 12) return { fontSize: 26, gap: 8 };
  if (n <= 20) return { fontSize: 22, gap: 7 };
  if (n <= 30) return { fontSize: 18, gap: 6 };
  if (n <= 50) return { fontSize: 15, gap: 5 };
  if (n <= 70) return { fontSize: 13, gap: 4 };
  return { fontSize: 11, gap: 3 };
};

const NumbersScreen = ({ navigation, route }) => {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const { updateLastPosition } = useProgress();
  const [selectedIndex, setSelectedIndex] = useState(route?.params?.initialIndex ?? 0);
  const [sketchOpen, setSketchOpen] = useState(false);
  const selectedNum = numbersData[selectedIndex];
  const total = numbersData.length;
  const countItemStyle = getCountItemStyle(selectedNum.number);
  // Wrap around at both ends so no button is ever dead: 100 → 1, 1 → 100.
  const prevIdx = (selectedIndex - 1 + total) % total;
  const nextIdx = (selectedIndex + 1) % total;

  // Silence any clip when moving to another number or leaving the screen.
  useEffect(() => {
    return () => {
      SpeechEngine.stop();
    };
  }, [selectedIndex]);

  // Remember wherever the child stops, so Home's Continue Learning can
  // resume straight into this number later.
  useEffect(() => {
    updateLastPosition('numbers', selectedIndex);
  }, [selectedIndex]);

  const goToNumber = (idx) => {
    SpeechEngine.stop();
    setSelectedIndex(idx);
  };

  return (
    <View style={styles.container}>
      <Header
        title={`Number ${selectedNum.number}`}
        showBack={true}
        onBackPress={() => {
          SpeechEngine.stop();
          navigation.goBack();
        }}
        rightAction={
          <QuizEntryBar
            compact
            color={moduleColors.numbers.solid}
            onPress={() => navigation.navigate('QuizList', { module: 'numbers' })}
          />
        }
      />

      <ScrollView
        contentContainerStyle={styles.detailScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero — gradient showcase for the number + its names */}
        <LinearGradient
          colors={[selectedNum.color, selectedNum.color + 'B3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, coloredShadow(selectedNum.color, 'lg')]}
        >
          <View style={styles.heroDecorTop} />
          <View style={styles.heroDecorBottom} />

          <View style={styles.bubble}>
            <Text style={styles.bigNumText}>{selectedNum.number}</Text>
          </View>

          <Text style={styles.englishLabel}>{selectedNum.english}</Text>
          <Text style={styles.urduLabel}>{selectedNum.urdu}</Text>

          {/* Both actions live inside the hero so the count grid below gets
              to keep the rest of the screen, no matter how many items it
              has to fit. */}
          <View style={styles.heroActions}>
            <View style={styles.heroAction}>
              <SpeakButton
                phrases={selectedNum.speech}
                color="rgba(0,0,0,0.22)"
                label="🔊 Hear It"
                size="sm"
                clipRate={0.7}
                rate={0.75}
              />
            </View>
            <TouchableOpacity
              style={styles.sketchPill}
              onPress={() => setSketchOpen(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Practice writing number ${selectedNum.number}`}
            >
              <Text style={styles.sketchPillText}>✏️ Write {selectedNum.number}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Visual Counters — glyph size shrinks in tiers as the count grows
            so all of them (up to 100) fit without overrunning the card. */}
        <View style={[styles.countCard, Elevation.sm]}>
          <Text style={styles.countingTitle}>Let's Count! (آؤ گنیں!)</Text>
          <View style={[styles.emojiGrid, { gap: countItemStyle.gap }]}>
            {selectedNum.objects.map((emoji, idx) => (
              <Text key={idx} style={[styles.emojiItem, { fontSize: countItemStyle.fontSize }]}>
                {emoji}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Prev/Next pinned to the bottom */}
      <View style={[styles.footer, { paddingBottom: 10}]}>
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => goToNumber(prevIdx)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Previous number ${numbersData[prevIdx].number}`}
          >
            <Text style={styles.navBtnText}>← {numbersData[prevIdx].number}</Text>
          </TouchableOpacity>

          <View style={styles.navCounter}>
            <Text style={[styles.navCounterText, { color: selectedNum.color }]}>
              {selectedIndex + 1} / {total}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.navBtn, styles.navBtnPrimary, { backgroundColor: selectedNum.color }]}
            onPress={() => goToNumber(nextIdx)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Next number ${numbersData[nextIdx].number}`}
          >
            <Text style={[styles.navBtnText, styles.navBtnTextPrimary]}>
              {numbersData[nextIdx].number} →
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <SketchCanvas
        visible={sketchOpen}
        onClose={() => setSketchOpen(false)}
        character={String(selectedNum.number)}
        label={`Number ${selectedNum.number}`}
        color={selectedNum.color}
      />
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // Detail view
  detailScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 16,
  },

  // Hero — gradient card with the big number, its names, and both actions
  hero: {
    borderRadius: Radius.xl,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  heroDecorTop: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroDecorBottom: {
    position: 'absolute',
    bottom: -60,
    left: -50,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bubble: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  bigNumText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  englishLabel: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  urduLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.88)',
  },

  // Sound + Sketch, side by side inside the hero — mirrors AlphabetScreen's
  // pairing so both pills read as one action row.
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    width: '100%',
  },
  heroAction: {
    flex: 1,
  },
  sketchPill: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sketchPillText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // "Let's Count" — its own card so it reads as a distinct module. No fixed
  // height: the emoji grid below shrinks its glyph size as the count grows
  // (see getCountItemStyle) so 1-100 items all fit without scrolling.
  countCard: {
    backgroundColor: colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  countingTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
    textAlign: 'center',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  emojiItem: {
    fontSize: 26,
  },

  // Footer — Prev/Next pinned to the bottom of the screen. Sound and Sketch
  // now live in the hero card, so this row is all that's left down here.
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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

export default NumbersScreen;
