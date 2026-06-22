import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { Fonts } from '../../Theme/fonts';
import {
  duasData,
  kalmasData,
  pillarsData,
  namesOfAllahData,
  prophetsData,
  mannersData,
  wuduSteps,
  salahSteps,
} from '../../Data';
import { Header } from '../../Components/UI';
import SpeakButton from '../../Components/Common/SpeakButton';
import QuizEntryBar from '../../Components/Common/QuizEntryBar';

const TABS = [
  { key: 'duas', label: 'Duas' },
  { key: 'kalmas', label: 'Kalmas' },
  { key: 'pillars', label: 'Pillars' },
  { key: 'names', label: '99 Names' },
  { key: 'prophets', label: 'Prophets' },
  { key: 'manners', label: 'Manners' },
  { key: 'salah', label: 'Wudu & Salah' },
];

const IslamicScreen = ({ navigation, route }) => {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const [activeTab, setActiveTab] = useState('duas');

  const renderDuaCard = (dua) => (
    <View key={dua.title} style={styles.islamicCard}>
      <View style={styles.duaHeader}>
        <Text style={styles.duaEmoji}>{dua.emoji}</Text>
        <Text style={styles.duaTitle}>{dua.title}</Text>
      </View>
      <Text style={styles.arabic}>{dua.arabic}</Text>
      <Text style={styles.transliteration}>{dua.transliteration}</Text>
      <View style={styles.divider} />
      <Text style={styles.urdu}>{dua.urdu}</Text>
      <Text style={styles.english}>{dua.english}</Text>
      <SpeakButton text={dua.arabic} language="ar-SA" label="🔊 Hear" color={dua.color} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Islamic Studies"
        showBack={navigation.canGoBack()}
        onBackPress={() => navigation.goBack()}
        stars={route?.params?.stars || 0}
      />

      {/* Tab Navigation (scrollable) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabContainer}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key ? styles.tabActive : styles.tabInactive,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              numberOfLines={1}
              style={[styles.tabText, { color: activeTab === tab.key ? '#FFF' : colors.textSecondary }]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'duas' && duasData.map(renderDuaCard)}
        {activeTab === 'kalmas' &&
          kalmasData.map((kalma) => (
            <View key={kalma.number} style={[styles.islamicCard, { borderLeftWidth: 4, borderLeftColor: kalma.color }]}>
              <Text style={styles.kalmaNumber}>Kalma {kalma.number}</Text>
              <Text style={styles.kalmaTitle}>{kalma.title}</Text>
              <Text style={styles.arabic}>{kalma.arabic}</Text>
              <Text style={styles.transliteration}>{kalma.transliteration}</Text>
              <View style={styles.divider} />
              <Text style={styles.urdu}>{kalma.urdu}</Text>
              <Text style={styles.english}>{kalma.english}</Text>
              <SpeakButton text={kalma.arabic} language="ar-SA" label="🔊 Hear" color={kalma.color} />
            </View>
          ))}
        {activeTab === 'pillars' &&
          pillarsData.map((pillar) => (
            <View key={pillar.number} style={styles.islamicCard}>
              <Text style={styles.pillarEmoji}>{pillar.emoji}</Text>
              <Text style={styles.pillarTitle}>{pillar.title}</Text>
              <Text style={styles.pillarUrdu}>{pillar.urdu}</Text>
              <Text style={styles.pillarDesc}>{pillar.desc}</Text>
              <Text style={styles.pillarDetail}>{pillar.detailedDesc}</Text>
              {pillar.whenToSay ? (
                <View style={styles.pillarWhenBox}>
                  <Text style={styles.pillarWhenLabel}>📅 When:</Text>
                  <Text style={styles.pillarWhenText}>{pillar.whenToSay}</Text>
                </View>
              ) : null}
              {pillar.urduDetail ? (
                <Text style={styles.pillarUrduDetail}>{pillar.urduDetail}</Text>
              ) : null}
            </View>
          ))}

        {activeTab === 'names' &&
          namesOfAllahData.map((name) => (
            <View key={name.number} style={[styles.islamicCard, { borderLeftWidth: 4, borderLeftColor: name.color }]}>
              <View style={styles.duaHeader}>
                <View style={[styles.nameBadge, { backgroundColor: name.color }]}>
                  <Text style={styles.nameBadgeText}>{name.number}</Text>
                </View>
                <Text style={styles.duaTitle}>{name.transliteration}</Text>
              </View>
              <Text style={styles.arabic}>{name.arabic}</Text>
              <View style={styles.divider} />
              <Text style={styles.english}>{name.english}</Text>
              <Text style={styles.urdu}>{name.urdu}</Text>
              <SpeakButton text={name.transliteration} language="en-US" label="🔊 Hear" color={name.color} />
            </View>
          ))}

        {activeTab === 'prophets' &&
          prophetsData.map((p) => (
            <View key={p.id} style={[styles.islamicCard, { borderLeftWidth: 4, borderLeftColor: p.color }]}>
              <View style={styles.duaHeader}>
                <Text style={styles.pillarEmoji}>{p.emoji}</Text>
                <Text style={styles.pillarTitle}>{p.name}</Text>
              </View>
              <Text style={styles.pillarUrdu}>{p.arabicName}</Text>
              <Text style={styles.pillarDetail}>{p.story}</Text>
              <Text style={styles.pillarUrduDetail}>{p.urduStory}</Text>
              <View style={styles.pillarWhenBox}>
                <Text style={styles.pillarWhenLabel}>⭐ Lesson:</Text>
                <Text style={styles.pillarWhenText}>{p.lesson}</Text>
              </View>
              <SpeakButton text={p.speak} language="en-US" label="🔊 Hear" color={p.color} />
            </View>
          ))}

        {activeTab === 'manners' &&
          mannersData.map((m) => (
            <View key={m.id} style={[styles.islamicCard, { borderLeftWidth: 4, borderLeftColor: m.color }]}>
              <View style={styles.duaHeader}>
                <Text style={styles.pillarEmoji}>{m.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pillarTitle}>{m.title}</Text>
                  <Text style={styles.pillarUrdu}>{m.urduTitle}</Text>
                </View>
              </View>
              <Text style={styles.pillarDetail}>{m.tip}</Text>
              <Text style={styles.pillarUrduDetail}>{m.urduTip}</Text>
              <SpeakButton text={m.speak} language="en-US" label="🔊 Hear" color={m.color} />
            </View>
          ))}

        {activeTab === 'salah' && (
          <>
            <Text style={styles.sectionHeading}>🚿 Wudu (Ablution) Steps</Text>
            {wuduSteps.map((s) => (
              <View key={`w${s.step}`} style={[styles.islamicCard, styles.stepCard]}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>{s.step}</Text>
                </View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepEmoji}>{s.emoji}</Text>
                  <Text style={styles.pillarTitle}>{s.title}</Text>
                  <Text style={styles.pillarUrdu}>{s.urduTitle}</Text>
                  <Text style={styles.pillarDetail}>{s.detail}</Text>
                  <Text style={styles.pillarUrduDetail}>{s.urduDetail}</Text>
                </View>
              </View>
            ))}
            <Text style={styles.sectionHeading}>🕌 Salah (Prayer) Steps</Text>
            {salahSteps.map((s) => (
              <View key={`s${s.step}`} style={[styles.islamicCard, styles.stepCard]}>
                <View style={[styles.stepNumber, { backgroundColor: colors.secondary }]}>
                  <Text style={styles.stepNumberText}>{s.step}</Text>
                </View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepEmoji}>{s.emoji}</Text>
                  <Text style={styles.pillarTitle}>{s.title}</Text>
                  <Text style={styles.pillarUrdu}>{s.urduTitle}</Text>
                  <Text style={styles.pillarDetail}>{s.detail}</Text>
                  <Text style={styles.pillarUrduDetail}>{s.urduDetail}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <QuizEntryBar
          color="#00897B"
          onPress={() => navigation.navigate('QuizList', { module: 'islamic' })}
        />
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  tabScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  tabContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginRight: 8,
    flexShrink: 0,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  tabText: {
    fontWeight: '700',
    fontSize: 13,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textDark,
    marginTop: 8,
    marginBottom: 12,
  },
  nameBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  stepCard: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  stepBody: {
    flex: 1,
  },
  stepEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 130,
  },
  islamicCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.borderLight,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  duaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  duaEmoji: {
    fontSize: 28,
  },
  duaTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textDark,
    flex: 1,
  },
  arabic: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textDark,
    lineHeight: 40,
    textAlign: 'right',
    marginVertical: 8,
    fontFamily: Fonts.arabicBold, // Noto Naskh Arabic
  },
  transliteration: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 10,
  },
  urdu: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
    lineHeight: 30,
    marginBottom: 8,
    textAlign: 'right',
    fontFamily: Fonts.urdu, // Nastaliq Urdu
  },
  english: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
    lineHeight: 18,
    marginBottom: 12,
  },
  kalmaNumber: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  kalmaTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.textDark,
    marginBottom: 8,
  },
  pillarEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  pillarTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textDark,
    marginBottom: 6,
  },
  pillarUrdu: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    lineHeight: 30,
    marginBottom: 6,
    fontFamily: Fonts.urdu, // Nastaliq Urdu
  },
  pillarDesc: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 10,
  },
  pillarDetail: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
    lineHeight: 18,
    marginBottom: 10,
  },
  pillarWhenBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  pillarWhenLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#15803D',
    marginBottom: 4,
  },
  pillarWhenText: {
    fontSize: 12,
    fontWeight: '600',
    // Box bg is a fixed light green in both themes — keep text dark so it stays readable.
    color: '#1E1B4B',
    lineHeight: 18,
  },
  pillarUrduDetail: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
    lineHeight: 32,
    textAlign: 'right',
    fontFamily: Fonts.urdu, // Nastaliq Urdu
  },
});

export default IslamicScreen;
