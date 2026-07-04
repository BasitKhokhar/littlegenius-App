import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../Components/UI';
import { useThemeColors } from '../../Context/ThemeContext';
import { useTabBarClearance } from '../../Hooks';
import { Fonts } from '../../Theme/fonts';

// ──────────────────────────────────────────────────────────────
// IslamicHubScreen — "Islamic Prayer Companion" home. A grid of
// feature cards: prayer tools (Namaz guide, Tasbeeh, Juz Amma),
// stories, and all the classic study sections.
// ──────────────────────────────────────────────────────────────

const FEATURED = [
  {
    key: 'namaz',
    emoji: '🕌',
    title: 'Namaz Guide',
    urdu: 'نماز گائیڈ',
    desc: 'Step-by-step prayer with pictures',
    colors: ['#10B981', '#059669'],
    nav: (n) => n.navigate('NamazGuide'),
  },
  {
    key: 'tasbeeh',
    emoji: '📿',
    title: 'Tasbeeh Counter',
    urdu: 'تسبیح',
    desc: 'Count your dhikr with targets',
    colors: ['#8B5CF6', '#7C3AED'],
    nav: (n) => n.navigate('Tasbeeh'),
  },
  {
    key: 'juzamma',
    emoji: '📖',
    title: 'Juz Amma',
    urdu: 'جز عم',
    desc: 'Short surahs with Urdu & repeat mode',
    colors: ['#0EA5E9', '#0284C7'],
    nav: (n) => n.navigate('JuzAmma'),
  },
  {
    key: 'stories',
    emoji: '🌙',
    title: 'Islamic Stories',
    urdu: 'اسلامی کہانیاں',
    desc: 'Prophets & Sahaba for kids',
    colors: ['#F59E0B', '#D97706'],
    nav: (n) => n.navigate('IslamicStories'),
  },
];

const SECTIONS = [
  { key: 'duas', emoji: '🤲', title: 'Daily Duas', color: '#10B981', tab: 'duas' },
  { key: 'kalmas', emoji: '☪️', title: '6 Kalmas', color: '#0EA5E9', tab: 'kalmas' },
  { key: 'pillars', emoji: '🕋', title: '5 Pillars', color: '#F59E0B', tab: 'pillars' },
  { key: 'names', emoji: '💜', title: '99 Names of Allah', color: '#6366F1', tab: 'names' },
  { key: 'namesM', emoji: '💚', title: 'Names of Prophet ﷺ', color: '#14B8A6', tab: 'namesMuhammad' },
  { key: 'prophets', emoji: '⭐', title: 'Prophets', color: '#EC4899', tab: 'prophets' },
  { key: 'manners', emoji: '😊', title: 'Manners', color: '#EF4444', tab: 'manners' },
  { key: 'salah', emoji: '🚿', title: 'Wudu & Salah', color: '#8B5CF6', tab: 'salah' },
];

const IslamicHubScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const bottomPad = useTabBarClearance();
  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <Header title="Islamic Companion" showBack={navigation.canGoBack()} onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>🕌 Prayer Companion</Text>
        <View style={styles.grid}>
          {FEATURED.map((f) => (
            <TouchableOpacity key={f.key} style={styles.featureWrap} onPress={() => f.nav(navigation)} activeOpacity={0.88}>
              <LinearGradient colors={f.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featureCard}>
                <View style={styles.featureDecor} />
                <Text style={styles.featureEmoji}>{f.emoji}</Text>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureUrdu}>{f.urdu}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.heading}>📚 Learn & Explore</Text>
        <View style={styles.grid}>
          {SECTIONS.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.sectionCard, { borderLeftColor: s.color }]}
              onPress={() => navigation.navigate('IslamicSection', { tab: s.tab })}
              activeOpacity={0.88}
            >
              <View style={[styles.sectionEmojiBubble, { backgroundColor: s.color + '22' }]}>
                <Text style={styles.sectionEmoji}>{s.emoji}</Text>
              </View>
              <Text style={styles.sectionTitle} numberOfLines={2}>{s.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quiz CTA */}
        <TouchableOpacity
          style={styles.quizBar}
          onPress={() => navigation.navigate('QuizList', { module: 'islamic' })}
          activeOpacity={0.88}
        >
          <Text style={styles.quizBarEmoji}>🧠</Text>
          <View style={styles.quizBarInfo}>
            <Text style={styles.quizBarTitle}>Islamic Quizzes</Text>
            <Text style={styles.quizBarDesc}>Test what you learned & earn stars!</Text>
          </View>
          <Text style={styles.quizBarArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, paddingTop: 14 },
  heading: { fontSize: 15, fontWeight: '900', color: colors.textPrimary, marginBottom: 12, marginTop: 4 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  featureWrap: { width: '48.5%', marginBottom: 12 },
  featureCard: {
    borderRadius: 20,
    padding: 14,
    minHeight: 150,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  featureDecor: {
    position: 'absolute',
    top: -26,
    right: -26,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  featureEmoji: { fontSize: 32, marginBottom: 8 },
  featureTitle: { fontSize: 14, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.2 },
  featureUrdu: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
    fontFamily: Fonts.urdu,
    lineHeight: 26,
  },
  featureDesc: { fontSize: 10.5, fontWeight: '600', color: 'rgba(255,255,255,0.85)', lineHeight: 14, marginTop: 2 },

  sectionCard: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  sectionEmojiBubble: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionEmoji: { fontSize: 20 },
  sectionTitle: { flex: 1, fontSize: 12, fontWeight: '900', color: colors.textPrimary, lineHeight: 16 },

  quizBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00897B',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    marginTop: 4,
    elevation: 4,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
  },
  quizBarEmoji: { fontSize: 28 },
  quizBarInfo: { flex: 1 },
  quizBarTitle: { fontSize: 14, fontWeight: '900', color: '#FFFFFF' },
  quizBarDesc: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  quizBarArrow: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
});

export default IslamicHubScreen;
