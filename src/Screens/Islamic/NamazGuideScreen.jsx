import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Header } from '../../Components/UI';
import { useThemeColors } from '../../Context/ThemeContext';
import { useTabBarClearance } from '../../Hooks';
import { Fonts } from '../../Theme/fonts';
import SpeechEngine from '../../Utils/speechEngine';
import SpeakButton from '../../Components/Common/SpeakButton';
import PostureFigure from '../../Components/Islamic/PostureFigure';
import namazGuideData from '../../Data/namazGuideData';
import juzAmmaData from '../../Data/juzAmmaData';
import { QURAN_AUDIO } from '../../Utils/quranAudioManifest.generated';

// For a namaz step that recites a full surah (Fatiha / a short surah), build
// the ordered list of that surah's bundled Qari clips so the 🔊 button plays it
// ayah by ayah with correct tajweed. Returns null when there's no linked surah.
const surahClips = (surahId) => {
  if (!surahId) return null;
  const surah = juzAmmaData.find((s) => s.id === surahId);
  if (!surah) return null;
  const clips = surah.ayahs.map((a) => QURAN_AUDIO[`${surahId}:${a.n}`]).filter(Boolean);
  return clips.length ? clips : null;
};

const STEP_COLORS = ['#10B981', '#0EA5E9', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

const NamazGuideScreen = ({ navigation }) => {
  const colors = useThemeColors();
  // Tight clearance (small `extra`) so the Back/Next bar sits just above the
  // floating tab bar instead of leaving a large gap beneath it.
  const bottomPad = useTabBarClearance(6);
  const styles = makeStyles(colors);
  const [stepIdx, setStepIdx] = useState(0);

  const step = namazGuideData[stepIdx];
  // When this step is a full-surah recitation, play the real Qari clips ayah by
  // ayah; otherwise the single-phrase button (Arabic TTS → transliteration).
  const recitationClips = surahClips(step.surahId);
  const accent = STEP_COLORS[stepIdx % STEP_COLORS.length];
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === namazGuideData.length - 1;

  // Silence any recitation when changing step or leaving the screen
  useEffect(() => {
    return () => {
      SpeechEngine.stop();
    };
  }, [stepIdx]);

  const goTo = (next) => {
    SpeechEngine.stop();
    setStepIdx(next);
  };

  return (
    <View style={styles.container}>
      <Header title="Namaz Guide 🕌" showBack onBackPress={() => navigation.goBack()} />

      {/* Step dots */}
      <View style={styles.dotsRow}>
        {namazGuideData.map((s, i) => (
          <TouchableOpacity
            key={s.id}
            onPress={() => goTo(i)}
            hitSlop={{ top: 8, bottom: 8, left: 2, right: 2 }}
            style={[
              styles.dot,
              i === stepIdx && { backgroundColor: accent, width: 22 },
              i < stepIdx && { backgroundColor: accent, opacity: 0.4 },
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Posture illustration */}
        <View style={[styles.heroCard, { borderColor: accent }]}>
          <View style={[styles.stepBadge, { backgroundColor: accent }]}>
            <Text style={styles.stepBadgeText}>Step {stepIdx + 1} of {namazGuideData.length}</Text>
          </View>
          <PostureFigure posture={step.posture} color={accent} size={170} />
          <Text style={styles.stepName}>{step.name}</Text>
          <Text style={styles.stepUrduName}>{step.urduName}</Text>
        </View>

        {/* Recitation */}
        {step.arabic ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>📖 Recite</Text>
            <Text style={styles.arabic}>{step.arabic}</Text>
            {step.transliteration ? (
              <Text style={styles.transliteration}>{step.transliteration}</Text>
            ) : null}
            <SpeakButton text={step.arabic} language="ar-SA" fallbackText={step.transliteration} audioClips={recitationClips} label="🔊 Hear Recitation" color={accent} />
          </View>
        ) : null}

        {/* Instructions */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>✅ What to do</Text>
          <Text style={styles.instruction}>{step.englishInstruction}</Text>
          <Text style={styles.urduInstruction}>{step.urduInstruction}</Text>
          <SpeakButton text={step.urduInstruction} language="ur-PK" fallbackText={step.englishInstruction} label="🔊 اردو میں سنیں" color={accent} />
        </View>
      </ScrollView>

      {/* Prev / Next bar — kept in normal flow so it never overlaps content */}
      <View style={[styles.navBar, { paddingBottom: 12 }]}>
        <TouchableOpacity
          style={[styles.navBtn, isFirst && styles.navBtnDisabled]}
          disabled={isFirst}
          onPress={() => goTo(stepIdx - 1)}
          activeOpacity={0.85}
        >
          <Text style={styles.navBtnText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnPrimary, { backgroundColor: accent }]}
          onPress={() => (isLast ? navigation.goBack() : goTo(stepIdx + 1))}
          activeOpacity={0.85}
        >
          <Text style={[styles.navBtnText, { color: '#FFF' }]}>{isLast ? 'Done 🎉' : 'Next →'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 10,
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 0 },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  stepBadge: {
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  stepBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '900', letterSpacing: 0.4 },
  stepName: { fontSize: 18, fontWeight: '900', color: colors.textPrimary, marginTop: 8, textAlign: 'center' },
  stepUrduName: {
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: Fonts.urdu,
    lineHeight: 34,
    textAlign: 'center',
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  arabic: {
    fontSize: 22,
    color: colors.textPrimary,
    lineHeight: 46,
    textAlign: 'right',
    fontFamily: Fonts.arabicBold,
    marginBottom: 8,
  },
  transliteration: {
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  instruction: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, lineHeight: 20, marginBottom: 8 },
  urduInstruction: {
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: Fonts.urdu,
    lineHeight: 32,
    textAlign: 'right',
    marginBottom: 12,
  },

  navBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  navBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  navBtnPrimary: { borderWidth: 0 },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 14, fontWeight: '900', color: colors.textPrimary },
});

export default NamazGuideScreen;
