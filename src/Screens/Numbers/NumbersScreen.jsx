import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../Context/ThemeContext';
import { numbersData } from '../../Data/numbersData';
import { Header } from '../../Components/UI';
import SpeakButton from '../../Components/Common/SpeakButton';
import QuizEntryBar from '../../Components/Common/QuizEntryBar';
import { SketchButton, SketchCanvas } from '../../Components/Educational';
import SpeechEngine from '../../Utils/speechEngine';
import { useTabBarClearance } from '../../Hooks';
import { Radius, Elevation, coloredShadow } from '../../Theme';

const NumbersScreen = ({ navigation, route }) => {
  const colors = useThemeColors();
  const bottomPad = useTabBarClearance();
  // Tight clearance so the footer hugs the bottom edge, matching the
  // alphabet detail screen's footer nav.
  const detailBottomPad = useTabBarClearance(10);
  const styles = makeStyles(colors);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [sketchOpen, setSketchOpen] = useState(false);
  const selectedNum = selectedIndex !== null ? numbersData[selectedIndex] : null;

  // Silence any clip when moving to another number or leaving the detail view.
  useEffect(() => {
    return () => {
      SpeechEngine.stop();
    };
  }, [selectedIndex]);

  const closeDetail = () => {
    SpeechEngine.stop();
    setSelectedIndex(null);
  };

  // ─── Detail view ──────────────────────────────────────────
  if (selectedNum) {
    const total = numbersData.length;
    // Wrap around at both ends so no button is ever dead: 100 → 1, 1 → 100.
    const prevIdx = (selectedIndex - 1 + total) % total;
    const nextIdx = (selectedIndex + 1) % total;

    const goToNumber = (idx) => {
      SpeechEngine.stop();
      setSelectedIndex(idx);
    };

    return (
      <View style={styles.container}>
        <Header
          title={`Number ${selectedNum.number}`}
          showBack={true}
          onBackPress={closeDetail}
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
          </LinearGradient>

          {/* Visual Counters */}
          <View style={[styles.countCard, Elevation.sm]}>
            <Text style={styles.countingTitle}>Let's Count! (آؤ گنیں!)</Text>
            <View style={styles.emojiGrid}>
              {selectedNum.objects.map((emoji, idx) => (
                <Text key={idx} style={styles.emojiItem}>
                  {emoji}
                </Text>
              ))}
            </View>
          </View>

          {/* Speech */}
          <View style={styles.audioSection}>
            <SpeakButton
              phrases={selectedNum.speech}
              color={selectedNum.color}
              label="🔊 Hear Pronunciation"
              clipRate={0.7}
              rate={0.75}
            />
          </View>
        </ScrollView>

        {/* Sketch + Prev/Next pinned together at the bottom */}
        <View style={[styles.footer, { paddingBottom: detailBottomPad }]}>
          <SketchButton
            color={selectedNum.color}
            label={`Write number ${selectedNum.number}`}
            onPress={() => setSketchOpen(true)}
          />

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
  }

  // ─── Grid view ────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Header
        title="Numbers 1-100 (گنتی)"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={numbersData}
        keyExtractor={(item) => item.number.toString()}
        numColumns={3}
        contentContainerStyle={[styles.gridContent, { paddingBottom: bottomPad }]}
        columnWrapperStyle={styles.gridRow}
        ListFooterComponent={
          <QuizEntryBar
            color="#3EC38B"
            onPress={() => navigation.navigate('QuizList', { module: 'numbers' })}
          />
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.card, { borderColor: item.color }]}
            onPress={() => setSelectedIndex(index)}
            activeOpacity={0.85}
          >
            <Text style={[styles.numText, { color: item.color }]}>
              {item.number}
            </Text>
            <Text style={styles.urduName}>{item.urdu}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  gridContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 10,
  },
  gridRow: {
    justifyContent: 'space-between',
    gap: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '31%',
    minHeight: 100,
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  numText: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  urduName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },

  // Detail view
  detailScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 16,
  },

  // Hero — gradient card with the big number + its names
  hero: {
    borderRadius: Radius.xl,
    paddingVertical: 28,
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
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  bigNumText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  englishLabel: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  urduLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.88)',
  },

  // "Let's Count" — its own card so it reads as a distinct module
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
  audioSection: {
    width: '100%',
  },

  // Footer — sketch CTA sits right above the Prev/Next bar, both pinned
  // to the bottom of the screen so they're reachable without scrolling.
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
