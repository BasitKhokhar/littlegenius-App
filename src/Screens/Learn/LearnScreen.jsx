import React, { useState, useCallback } from 'react';
import { View, ScrollView, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Fonts } from '../../Theme/fonts';
import { useThemeColors } from '../../Context/ThemeContext';
import { useTabBarClearance } from '../../Hooks';
import { Spacing, Radius, textStyles, coloredShadow } from '../../Theme';
import learnModules from '../../Data/learnModulesData';
import { Header } from '../../Components/UI';
import TopicCard from '../../Components/Common/TopicCard';

// Generic, data-driven general-knowledge screen. The module to show is
// chosen by route.params.moduleKey (see learnModulesData.js).
const LearnScreen = ({ navigation, route }) => {
  const colors = useThemeColors();
  const bottomPad = useTabBarClearance();
  const moduleKey = route?.params?.moduleKey;
  const data = learnModules[moduleKey];

  const tabs = data?.tabs || [];
  const initialTab = route?.params?.initialTab;
  const defaultTab = tabs.some((t) => t.key === initialTab) ? initialTab : tabs[0]?.key;
  const [activeTab, setActiveTab] = useState(defaultTab);

  const renderItem = useCallback(
    ({ item, index }) => (
      <TopicCard
        index={index}
        emoji={item.emoji}
        color={item.color}
        title={item.en}
        titleUrdu={item.ur}
        subtitle={item.fact}
        subtitleUrdu={item.urFact}
        speakText={item.speak || `${item.en}. ${item.fact}`}
        speakLanguage="en-US"
      />
    ),
    []
  );

  if (!data) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Header title="Learn" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.errorWrap}>
          <Text style={[textStyles.body, { color: colors.textMuted, textAlign: 'center' }]}>
            This topic is coming soon! 🚀
          </Text>
        </View>
      </View>
    );
  }

  const accent = data.color || colors.primary;
  const current = tabs.find((t) => t.key === activeTab) || tabs[0];
  const count = current?.items?.length || 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header title={data.title} showBack onBackPress={() => navigation.goBack()} />

      <View style={styles.tabBarWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.85}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.tab,
                  { backgroundColor: isActive ? accent : colors.surface, borderColor: isActive ? accent : colors.border },
                  isActive && coloredShadow(accent, 'sm'),
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[styles.tabText, { color: isActive ? '#FFFFFF' : colors.textSecondary }]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={current?.items || []}
        keyExtractor={(item) => item.en}
        renderItem={renderItem}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          /* Section intro — premium little header above the cards */
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{current?.label}</Text>
            <View style={[styles.countPill, { backgroundColor: accent + '1A', borderColor: accent + '33' }]}>
              <Text style={[styles.countText, { color: accent }]}>{count} to explore</Text>
            </View>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBarWrap: { flexGrow: 0 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, paddingVertical: Spacing.md },
  tab: {
    minHeight: 40,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    letterSpacing: 0.3,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xs },

  // Section intro
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  sectionTitle: { fontFamily: Fonts.extraBold, fontSize: 20, letterSpacing: -0.3 },
  countPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  countText: { fontFamily: Fonts.bold, fontSize: 12, letterSpacing: 0.2 },

  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});

export default LearnScreen;
