import React from 'react';
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
import juzAmmaData from '../../Data/juzAmmaData';

const SURAH_COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#6366F1', '#EF4444'];

const JuzAmmaScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const bottomPad = useTabBarClearance();
  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <Header title="Juz Amma 📖" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Short surahs with Urdu translation, recitation & memorization repeat mode • آسان سورتیں
        </Text>

        {juzAmmaData.map((surah, idx) => {
          const accent = SURAH_COLORS[idx % SURAH_COLORS.length];
          return (
            <TouchableOpacity
              key={surah.id}
              style={[styles.surahCard, { borderLeftColor: accent }]}
              onPress={() => navigation.navigate('Surah', { surahId: surah.id })}
              activeOpacity={0.88}
            >
              <View style={[styles.numberMedal, { backgroundColor: accent }]}>
                <Text style={styles.numberText}>{surah.number}</Text>
              </View>
              <View style={styles.surahInfo}>
                <Text style={styles.surahName}>{surah.name}</Text>
                <Text style={styles.surahMeaning}>{surah.meaning} • {surah.ayahCount} Ayahs</Text>
              </View>
              <Text style={[styles.surahArabic, { color: accent }]}>{surah.arabicName}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, paddingTop: 14 },
  subtitle: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 14, lineHeight: 18 },

  surahCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 5,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  numberMedal: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: { fontSize: 14, fontWeight: '900', color: '#FFFFFF' },
  surahInfo: { flex: 1 },
  surahName: { fontSize: 15, fontWeight: '900', color: colors.textPrimary },
  surahMeaning: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, marginTop: 2 },
  surahArabic: {
    fontSize: 20,
    fontFamily: Fonts.arabicBold,
    lineHeight: 40,
  },
});

export default JuzAmmaScreen;
