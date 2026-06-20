import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Fonts } from '../../Theme/fonts';
import { useThemeColors } from '../../Context/ThemeContext';
import { Spacing, Radius, textStyles, Elevation, coloredShadow } from '../../Theme';
import learnModules from '../../Data/learnModulesData';
import { Header } from '../../Components/UI';
import SpeakButton from '../../Components/Common/SpeakButton';

// Generic, data-driven general-knowledge screen. The module to show is
// chosen by route.params.moduleKey (see learnModulesData.js).
const LearnScreen = ({ navigation, route }) => {
  const colors = useThemeColors();
  const moduleKey = route?.params?.moduleKey;
  const data = learnModules[moduleKey];

  const tabs = data?.tabs || [];
  const initialTab = route?.params?.initialTab;
  const defaultTab = tabs.some((t) => t.key === initialTab) ? initialTab : tabs[0]?.key;
  const [activeTab, setActiveTab] = useState(defaultTab);

  const s = makeStyles(colors);

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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {current?.items.map((item) => (
          <View key={item.en} style={[s.card, { borderLeftWidth: 4, borderLeftColor: item.color }]}>
            <View style={styles.row}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <View style={styles.flex}>
                <Text style={[styles.value, { color: colors.textPrimary }]}>{item.en}</Text>
                <Text style={[styles.urduValue, { color: colors.textPrimary }]}>{item.ur}</Text>
              </View>
            </View>
            <Text style={[styles.fact, { color: colors.textSecondary }]}>{item.fact}</Text>
            <Text style={[styles.urduFact, { color: colors.textSecondary }]}>{item.urFact}</Text>
            <SpeakButton text={item.speak || `${item.en}. ${item.fact}`} language="en-US" label="🔊 Hear" color={item.color} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: Radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      ...Elevation.sm,
    },
  });

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
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  flex: { flex: 1 },
  emoji: { fontSize: 34 },
  value: { fontSize: 17, fontFamily: Fonts.extraBold },
  urduValue: { fontSize: 16, fontFamily: Fonts.urdu, textAlign: 'right', lineHeight: 30 },
  fact: { fontSize: 13, fontFamily: Fonts.medium, marginBottom: 4, lineHeight: 18 },
  urduFact: { fontSize: 14, fontFamily: Fonts.urdu, textAlign: 'right', lineHeight: 28, marginBottom: 6 },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});

export default LearnScreen;
