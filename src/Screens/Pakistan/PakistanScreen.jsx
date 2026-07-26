import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { useTabBarClearance } from '../../Hooks';
import { nationalSymbols, provinces, heroes, famousPlaces } from '../../Data';
import { Header } from '../../Components/UI';
import TopicCard from '../../Components/Common/TopicCard';
import QuizEntryBar from '../../Components/Common/QuizEntryBar';

const TABS = [
  { key: 'symbols', label: 'Symbols', emoji: '🏅' },
  { key: 'provinces', label: 'Provinces', emoji: '🗺️' },
  { key: 'heroes', label: 'Heroes', emoji: '🦸' },
  { key: 'places', label: 'Places', emoji: '📍' },
];

// Normalise each dataset into one shared card shape so a single premium
// card renders across every tab. `sentence` is the full spoken line the
// voice reads — it is not drawn on the card, since it just restates the
// primary/secondary lines above it.
const getItems = (tab) => {
  switch (tab) {
    case 'provinces':
      return provinces.map((p) => ({
        key: p.name,
        emoji: p.emoji,
        color: p.color,
        primary: p.name,
        primaryUrdu: p.urduName,
        secondary: `Capital: ${p.capital}`,
        secondaryUrdu: p.urduCapital,
        sentence: p.speak,
      }));
    case 'heroes':
      return heroes.map((h) => ({
        key: h.name,
        emoji: h.emoji,
        color: h.color,
        primary: h.name,
        primaryUrdu: h.urduName,
        secondary: h.role,
        secondaryUrdu: h.urduRole,
        sentence: h.speak,
      }));
    case 'places':
      return famousPlaces.map((item) => ({
        key: item.title,
        emoji: item.emoji,
        color: item.color,
        primary: item.title,
        primaryUrdu: item.urduTitle,
        secondary: item.value,
        secondaryUrdu: item.urduValue,
        sentence: item.speak,
      }));
    case 'symbols':
    default:
      return nationalSymbols.map((item) => ({
        key: item.title,
        emoji: item.emoji,
        color: item.color,
        primary: item.title,
        primaryUrdu: item.urduTitle,
        secondary: item.value,
        secondaryUrdu: item.urduValue,
        sentence: item.speak,
      }));
  }
};

const PakistanScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const bottomPad = useTabBarClearance();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState('symbols');

  const items = useMemo(() => getItems(activeTab), [activeTab]);

  const renderItem = useCallback(
    ({ item, index }) => (
      <TopicCard
        index={index}
        emoji={item.emoji}
        color={item.color}
        title={item.primary}
        titleUrdu={item.primaryUrdu}
        subtitle={item.secondary}
        subtitleUrdu={item.secondaryUrdu}
        speakText={item.sentence}
        speakLanguage="en-US"
      />
    ),
    []
  );

  return (
    <View style={styles.container}>
      <Header
        title="Pakistan (پاکستان)"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabContainer}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.85}
              style={[
                styles.tab,
                isActive
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={styles.tabEmoji}>{tab.emoji}</Text>
              <Text
                numberOfLines={1}
                style={[styles.tabText, { color: isActive ? '#FFF' : colors.textSecondary }]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={items}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <QuizEntryBar
            color="#059669"
            onPress={() => navigation.navigate('QuizList', { module: 'pakistan' })}
          />
        }
      />
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },

    tabScroll: { flexGrow: 0 },
    tabContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, paddingVertical: 12 },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      minHeight: 42,
      paddingVertical: 9,
      paddingHorizontal: 16,
      borderRadius: 999,
      borderWidth: 1,
      justifyContent: 'center',
      // No elevation/shadow here: Android draws the elevation shadow from a
      // rectangular outline behind the pill, which looked like a grey box.
      overflow: 'hidden',
    },
    tabEmoji: { fontSize: 15 },
    tabText: {
      fontWeight: '800',
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
      includeFontPadding: false,
      textAlignVertical: 'center',
    },

    content: { paddingHorizontal: 16, paddingTop: 14 },
  });

export default PakistanScreen;
