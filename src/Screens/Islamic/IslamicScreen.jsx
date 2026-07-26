import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { Fonts } from '../../Theme/fonts';
import { Spacing, Radius, Elevation, coloredShadow } from '../../Theme';
import {
  duasData,
  kalmasData,
  pillarsData,
  namesOfAllahData,
  namesOfMuhammadData,
  prophetsData,
  mannersData,
  wuduSteps,
  salahSteps,
} from '../../Data';
import { Header } from '../../Components/UI';
import { useTabBarClearance } from '../../Hooks';
import IslamicCard from '../../Components/Islamic/IslamicCard';
import QuizEntryBar from '../../Components/Common/QuizEntryBar';

// ──────────────────────────────────────────────────────────────
// IslamicScreen — every study section (Duas, Kalmas, Pillars, 99
// Names, Names of the Prophet ﷺ, Prophets, Manners, Wudu & Salah)
// rendered through the shared <IslamicCard>, so the whole section
// reads as one premium design: oversized emoji medallion, framed
// Arabic panel, labelled Urdu/English meaning blocks.
// ──────────────────────────────────────────────────────────────

const TABS = [
  { key: 'duas', emoji: '🤲', label: 'Duas' },
  { key: 'kalmas', emoji: '☪️', label: 'Kalmas' },
  { key: 'pillars', emoji: '🕋', label: 'Pillars' },
  { key: 'names', emoji: '💜', label: '99 Names of Allah' },
  { key: 'namesMuhammad', emoji: '💚', label: 'Names of Prophet ﷺ' },
  { key: 'prophets', emoji: '⭐', label: 'Prophets' },
  { key: 'manners', emoji: '😊', label: 'Manners' },
  { key: 'salah', emoji: '🚿', label: 'Wudu & Salah' },
];

// The 6 Kalmas carry no emoji in the data — one picture each, so a
// child can find "the shield one" before they can read "Rad-de-Kufr".
const KALMA_EMOJI = ['☪️', '🤝', '✨', '☝️', '🤲', '🛡️'];

// Titles in the data pack the Urdu inside brackets — e.g.
// "Before Eating (کھانے سے پہلے)". Split it so each script gets its
// own line and its own font instead of colliding on one row.
const splitTitle = (raw = '') => {
  const m = raw.match(/^(.*?)\s*[(（]([^)）]*)[)）]\s*$/);
  return m
    ? { title: m[1].trim(), urdu: m[2].trim() }
    : { title: raw.trim(), urdu: '' };
};

// "First Kalma: Tayyab" → "Tayyab" (the eyebrow already says "Kalma 1").
const kalmaName = (title) => title.replace(/^\w+\s+Kalma:\s*/i, '');

const IslamicScreen = ({ navigation, route }) => {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const bottomPad = useTabBarClearance();
  const initialTab = TABS.some((t) => t.key === route?.params?.tab) ? route.params.tab : 'duas';
  const [activeTab, setActiveTab] = useState(initialTab);

  // The hub re-navigates to this screen with a different tab param —
  // sync when that happens (navigate() updates params without remount).
  useEffect(() => {
    const t = route?.params?.tab;
    if (t && TABS.some((x) => x.key === t)) setActiveTab(t);
  }, [route?.params?.tab]);

  const renderSectionHeading = (emoji, text, urdu) => (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{text}</Text>
        {!!urdu && <Text style={styles.sectionUrdu}>{urdu}</Text>}
      </View>
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
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                active ? [styles.tabActive, coloredShadow(colors.primary, 'sm')] : styles.tabInactive,
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.85}
            >
              <Text style={styles.tabEmoji}>{tab.emoji}</Text>
              <Text
                numberOfLines={1}
                style={[styles.tabText, { color: active ? '#FFFFFF' : colors.textSecondary }]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'duas' &&
          duasData.map((dua, i) => {
            const { title, urdu } = splitTitle(dua.title);
            return (
              <IslamicCard
                key={dua.title}
                index={i}
                accent={dua.color}
                emoji={dua.emoji}
                eyebrow="Daily Dua"
                title={title}
                titleUrdu={urdu}
                arabic={dua.arabic}
                transliteration={dua.transliteration}
                meaningUr={dua.urdu}
                meaningEn={dua.english}
                speakArabic={{
                  text: dua.arabic,
                  language: 'ar-SA',
                  fallback: dua.speak || dua.transliteration,
                }}
                speakUrdu={{ text: dua.urdu, language: 'ur-PK', fallback: dua.english }}
              />
            );
          })}

        {activeTab === 'kalmas' &&
          kalmasData.map((kalma, i) => {
            const { title, urdu } = splitTitle(kalma.title);
            return (
              <IslamicCard
                key={kalma.number}
                index={i}
                accent={kalma.color}
                emoji={KALMA_EMOJI[(kalma.number - 1) % KALMA_EMOJI.length]}
                number={kalma.number}
                eyebrow={`Kalma ${kalma.number}`}
                title={kalmaName(title)}
                titleUrdu={urdu}
                arabic={kalma.arabic}
                transliteration={kalma.transliteration}
                meaningUr={kalma.urdu}
                meaningEn={kalma.english}
                speakArabic={{
                  text: kalma.arabic,
                  language: 'ar-SA',
                  fallback: kalma.speak || kalma.transliteration,
                }}
                speakUrdu={{ text: kalma.urdu, language: 'ur-PK', fallback: kalma.english }}
              />
            );
          })}

        {activeTab === 'pillars' &&
          pillarsData.map((pillar, i) => (
            <IslamicCard
              key={pillar.number}
              index={i}
              accent={pillar.color}
              emoji={pillar.emoji}
              number={pillar.number}
              eyebrow={`Pillar ${pillar.number} of 5`}
              title={pillar.title}
              titleUrdu={pillar.urdu}
              meaningEn={pillar.desc}
              detail={pillar.detailedDesc}
              detailUr={pillar.urduDetail}
              note={pillar.whenToSay ? { label: '📅 When', text: pillar.whenToSay } : null}
              speakUrdu={{ text: pillar.urduDetail, language: 'ur-PK', fallback: pillar.desc }}
              speak={{ text: pillar.detailedDesc, language: 'en-US' }}
            />
          ))}

        {activeTab === 'names' &&
          namesOfAllahData.map((name, i) => (
            <IslamicCard
              key={name.number}
              index={i}
              accent={name.color}
              emoji="💜"
              number={name.number}
              eyebrow={`Name ${name.number} of 99`}
              title={name.transliteration}
              arabic={name.arabic}
              meaningUr={name.urdu}
              meaningEn={name.english}
              speakArabic={{
                text: name.arabic,
                language: 'ar-SA',
                fallback: name.speak || name.transliteration,
              }}
              speakUrdu={{ text: name.urdu, language: 'ur-PK', fallback: name.english }}
            />
          ))}

        {activeTab === 'namesMuhammad' &&
          namesOfMuhammadData.map((name, i) => (
            <IslamicCard
              key={name.number}
              index={i}
              accent={name.color}
              emoji="💚"
              number={name.number}
              eyebrow={`Name ${name.number} · Prophet ﷺ`}
              title={name.transliteration}
              arabic={name.arabic}
              meaningUr={name.urdu}
              meaningEn={name.english}
              speakArabic={{
                text: name.arabic,
                language: 'ar-SA',
                fallback: name.speak || name.transliteration,
              }}
              speakUrdu={{ text: name.urdu, language: 'ur-PK', fallback: name.english }}
            />
          ))}

        {activeTab === 'prophets' &&
          prophetsData.map((p, i) => (
            <IslamicCard
              key={p.id}
              index={i}
              accent={p.color}
              emoji={p.emoji}
              eyebrow="Prophet Story"
              title={p.name}
              titleUrdu={p.arabicName}
              detail={p.story}
              detailUr={p.urduStory}
              note={{ label: '⭐ Lesson', text: p.lesson }}
              speakUrdu={{ text: p.urduStory, language: 'ur-PK', fallback: p.speak }}
              speak={{ text: p.speak, language: 'en-US' }}
            />
          ))}

        {activeTab === 'manners' &&
          mannersData.map((m, i) => (
            <IslamicCard
              key={m.id}
              index={i}
              accent={m.color}
              emoji={m.emoji}
              eyebrow="Good Manners"
              title={m.title}
              titleUrdu={m.urduTitle}
              detail={m.tip}
              detailUr={m.urduTip}
              speakUrdu={{ text: m.urduTip, language: 'ur-PK', fallback: m.speak }}
              speak={{ text: m.speak, language: 'en-US' }}
            />
          ))}

        {activeTab === 'salah' && (
          <>
            {renderSectionHeading('🚿', 'Wudu (Ablution) Steps', 'وضو کے مراحل')}
            {wuduSteps.map((s, i) => (
              <IslamicCard
                key={`w${s.step}`}
                index={i}
                accent={colors.primary}
                emoji={s.emoji}
                number={s.step}
                eyebrow={`Step ${s.step} of ${wuduSteps.length}`}
                title={s.title}
                titleUrdu={s.urduTitle}
                detail={s.detail}
                detailUr={s.urduDetail}
                speakUrdu={{ text: s.urduDetail, language: 'ur-PK', fallback: s.detail }}
                speak={{ text: s.detail, language: 'en-US', label: '🔊 Hear Step' }}
              />
            ))}

            {renderSectionHeading('🕌', 'Salah (Prayer) Steps', 'نماز کے مراحل')}
            {salahSteps.map((s, i) => (
              <IslamicCard
                key={`s${s.step}`}
                index={i}
                accent={colors.secondary}
                emoji={s.emoji}
                number={s.step}
                eyebrow={`Step ${s.step} of ${salahSteps.length}`}
                title={s.title}
                titleUrdu={s.urduTitle}
                detail={s.detail}
                detailUr={s.urduDetail}
                speakUrdu={{ text: s.urduDetail, language: 'ur-PK', fallback: s.detail }}
                speak={{ text: s.detail, language: 'en-US', label: '🔊 Hear Step' }}
              />
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
    flexShrink: 0,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    ...Elevation.sm,
  },
  tabEmoji: { fontSize: 15, lineHeight: 20 },
  tabText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    lineHeight: 18,
  },

  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  sectionEmoji: { fontSize: 26, lineHeight: 34 },
  sectionTitle: {
    fontFamily: Fonts.extraBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  sectionUrdu: {
    fontFamily: Fonts.urdu,
    fontSize: 13,
    lineHeight: 26,
    color: colors.textSecondary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
  },
});

export default IslamicScreen;
