import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Header } from '../../Components/UI';
import { useThemeColors } from '../../Context/ThemeContext';
import { useTabBarClearance } from '../../Hooks';
import { Fonts } from '../../Theme/fonts';
import SpeechEngine from '../../Utils/speechEngine';
import juzAmmaData from '../../Data/juzAmmaData';

// ──────────────────────────────────────────────────────────────
// SurahScreen — large Arabic text + Urdu translation per ayah,
// with recitation (TTS today, `ayah.audio` MP3s drop in later)
// and a memorization repeat mode (each ayah ×3/×5/×10).
// ──────────────────────────────────────────────────────────────

const REPEAT_OPTIONS = [3, 5, 10];
const IDLE = { idx: null, rep: 0, mode: 'idle' }; // idle | single | repeat | all

const SurahScreen = ({ navigation, route }) => {
  const colors = useThemeColors();
  const bottomPad = useTabBarClearance();
  const styles = makeStyles(colors);

  const surah = juzAmmaData.find((s) => s.id === route.params?.surahId) || juzAmmaData[0];

  const [play, setPlay] = useState(IDLE);
  const [repeatTarget, setRepeatTarget] = useState(3);
  const sessionRef = useRef(0);
  const listRef = useRef(null);

  // Token-guarded chain: SpeechEngine.speak() internally calls
  // Speech.stop(), which can fire the PREVIOUS utterance's onDone on
  // some platforms — the token makes stale callbacks no-ops.
  const speakAyah = (idx, rep, mode, token) => {
    if (idx >= surah.ayahs.length) return stopAll();
    setPlay({ idx, rep, mode });
    try {
      listRef.current?.scrollToIndex({ index: idx, viewPosition: 0.25, animated: true });
    } catch (e) {
      // scrollToIndex can throw before layout — harmless
    }
    SpeechEngine.speak(surah.ayahs[idx].arabic, 'ar-SA', {
      rate: 0.8,
      onDone: () => {
        if (token !== sessionRef.current) return;
        if (mode === 'repeat' && rep < repeatTarget) return speakAyah(idx, rep + 1, mode, token);
        if (mode === 'all' && idx + 1 < surah.ayahs.length) return speakAyah(idx + 1, 1, mode, token);
        setPlay(IDLE);
      },
      onError: () => {
        if (token === sessionRef.current) setPlay(IDLE);
      },
    });
  };

  const start = (idx, mode) => speakAyah(idx, 1, mode, ++sessionRef.current);

  const stopAll = () => {
    sessionRef.current++;
    SpeechEngine.stop();
    setPlay(IDLE);
  };

  // Silence recitation when leaving the screen
  useEffect(() => stopAll, []);

  const isPlaying = play.mode !== 'idle';

  const renderAyah = ({ item, index }) => {
    const active = play.idx === index;
    return (
      <View style={[styles.ayahCard, active && styles.ayahCardActive]}>
        <View style={styles.ayahTopRow}>
          <View style={[styles.ayahBadge, active && { backgroundColor: colors.primary }]}>
            <Text style={[styles.ayahBadgeText, active && { color: '#FFF' }]}>{item.n}</Text>
          </View>
          {active && play.mode === 'repeat' ? (
            <Text style={styles.repChip}>🔁 {play.rep} / {repeatTarget}</Text>
          ) : null}
          <View style={styles.flexSpacer} />
          <TouchableOpacity
            style={[styles.ayahPlayBtn, active && { backgroundColor: colors.primary }]}
            onPress={() => (active && isPlaying ? stopAll() : start(index, 'single'))}
            activeOpacity={0.85}
          >
            <Text style={styles.ayahPlayText}>{active && isPlaying ? '⏸' : '🔊'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ayahRepeatBtn}
            onPress={() => start(index, 'repeat')}
            activeOpacity={0.85}
          >
            <Text style={styles.ayahRepeatText}>🔁 ×{repeatTarget}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.arabic}>{item.arabic}</Text>
        <Text style={styles.transliteration}>{item.transliteration}</Text>
        <View style={styles.divider} />
        <Text style={styles.urdu}>{item.urdu}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title={surah.name} showBack onBackPress={() => navigation.goBack()} />

      {/* Surah intro + controls */}
      <View style={styles.controls}>
        <View style={styles.introRow}>
          <View style={styles.introText}>
            <Text style={styles.introName}>{surah.arabicName}</Text>
            <Text style={styles.introMeta}>{surah.meaning} • {surah.ayahCount} Ayahs • {surah.urduName}</Text>
          </View>
        </View>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlBtn, styles.controlPrimary]}
            onPress={() => (play.mode === 'all' ? stopAll() : start(0, 'all'))}
            activeOpacity={0.85}
          >
            <Text style={styles.controlPrimaryText}>{play.mode === 'all' ? '⏹ Stop' : '▶️ Play All'}</Text>
          </TouchableOpacity>
          <View style={styles.repeatPicker}>
            <Text style={styles.repeatLabel}>Repeat</Text>
            {REPEAT_OPTIONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.repeatChip, repeatTarget === r && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => setRepeatTarget(r)}
                activeOpacity={0.85}
              >
                <Text style={[styles.repeatChipText, repeatTarget === r && { color: '#FFF' }]}>×{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={surah.ayahs}
        keyExtractor={(a) => `${surah.id}-${a.n}`}
        renderItem={renderAyah}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={() => {}}
      />
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  controls: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  introRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  introText: { flex: 1, alignItems: 'center' },
  introName: { fontSize: 24, fontFamily: Fonts.arabicBold, color: colors.textPrimary, lineHeight: 46 },
  introMeta: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  controlRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  controlBtn: { borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16 },
  controlPrimary: { backgroundColor: colors.primary },
  controlPrimaryText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
  repeatPicker: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'flex-end' },
  repeatLabel: { fontSize: 11, fontWeight: '800', color: colors.textSecondary, marginRight: 2 },
  repeatChip: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  repeatChipText: { fontSize: 12, fontWeight: '900', color: colors.textSecondary },

  list: { paddingHorizontal: 16, paddingTop: 12 },
  ayahCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  ayahCardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.surfaceAlt,
  },
  ayahTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  ayahBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brandSurface + '22',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahBadgeText: { fontSize: 12, fontWeight: '900', color: colors.textPrimary },
  repChip: { fontSize: 11, fontWeight: '800', color: colors.primary },
  flexSpacer: { flex: 1 },
  ayahPlayBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  ayahPlayText: { fontSize: 14 },
  ayahRepeatBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  ayahRepeatText: { fontSize: 11, fontWeight: '900', color: colors.textPrimary },

  arabic: {
    fontSize: 28,
    color: colors.textPrimary,
    lineHeight: 58,
    textAlign: 'right',
    fontFamily: Fonts.arabicBold,
    marginVertical: 6,
  },
  transliteration: {
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  urdu: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 32,
    textAlign: 'right',
    fontFamily: Fonts.urdu,
  },
});

export default SurahScreen;
