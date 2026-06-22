import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { Fonts } from '../../Theme/fonts';
import { nationalSymbols, provinces, heroes, famousPlaces } from '../../Data';
import { Header } from '../../Components/UI';
import SpeakButton from '../../Components/Common/SpeakButton';
import QuizEntryBar from '../../Components/Common/QuizEntryBar';

const TABS = [
  { key: 'symbols', label: 'Symbols' },
  { key: 'provinces', label: 'Provinces' },
  { key: 'heroes', label: 'Heroes' },
  { key: 'places', label: 'Places' },
];

const PakistanScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const [activeTab, setActiveTab] = useState('symbols');

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
              style={[
                styles.tab,
                { backgroundColor: isActive ? colors.primary : colors.surface, borderColor: isActive ? colors.primary : colors.border },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'symbols' &&
          nationalSymbols.map((item) => (
            <View key={item.title} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: item.color }]}>
              <View style={styles.row}>
                <Text style={styles.emoji}>{item.emoji}</Text>
                <View style={styles.flex}>
                  <Text style={styles.label}>{item.title}</Text>
                  <Text style={styles.urduLabel}>{item.urduTitle}</Text>
                </View>
              </View>
              <Text style={styles.value}>{item.value}</Text>
              <Text style={styles.urduValue}>{item.urduValue}</Text>
              <SpeakButton text={item.speak} language="en-US" label="🔊 Hear" color={item.color} />
            </View>
          ))}

        {activeTab === 'provinces' &&
          provinces.map((p) => (
            <View key={p.name} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: p.color }]}>
              <View style={styles.row}>
                <Text style={styles.emoji}>{p.emoji}</Text>
                <View style={styles.flex}>
                  <Text style={styles.value}>{p.name}</Text>
                  <Text style={styles.urduValue}>{p.urduName}</Text>
                </View>
              </View>
              <Text style={styles.label}>Capital: {p.capital} ({p.urduCapital})</Text>
              <SpeakButton text={p.speak} language="en-US" label="🔊 Hear" color={p.color} />
            </View>
          ))}

        {activeTab === 'heroes' &&
          heroes.map((h) => (
            <View key={h.name} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: h.color }]}>
              <View style={styles.row}>
                <Text style={styles.emoji}>{h.emoji}</Text>
                <View style={styles.flex}>
                  <Text style={styles.value}>{h.name}</Text>
                  <Text style={styles.urduValue}>{h.urduName}</Text>
                </View>
              </View>
              <Text style={styles.label}>{h.role}</Text>
              <Text style={styles.urduLabel}>{h.urduRole}</Text>
              <SpeakButton text={h.speak} language="en-US" label="🔊 Hear" color={h.color} />
            </View>
          ))}

        {activeTab === 'places' &&
          famousPlaces.map((item) => (
            <View key={item.title} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: item.color }]}>
              <View style={styles.row}>
                <Text style={styles.emoji}>{item.emoji}</Text>
                <View style={styles.flex}>
                  <Text style={styles.label}>{item.title}</Text>
                  <Text style={styles.urduLabel}>{item.urduTitle}</Text>
                </View>
              </View>
              <Text style={styles.value}>{item.value}</Text>
              <Text style={styles.urduValue}>{item.urduValue}</Text>
              <SpeakButton text={item.speak} language="en-US" label="🔊 Hear" color={item.color} />
            </View>
          ))}
        <QuizEntryBar
          color="#059669"
          onPress={() => navigation.navigate('QuizList', { module: 'pakistan' })}
        />
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  tabScroll: { flexGrow: 0 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, paddingVertical: 12 },
  tab: {
    minHeight: 40,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontWeight: '700',
    fontSize: 11,
    textTransform: 'uppercase',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 130 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  flex: { flex: 1 },
  emoji: { fontSize: 34 },
  label: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 2 },
  urduLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textAlign: 'right', lineHeight: 26, fontFamily: Fonts.urdu },
  value: { fontSize: 17, fontWeight: '900', color: colors.textPrimary },
  urduValue: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, textAlign: 'right', lineHeight: 30, marginBottom: 6, fontFamily: Fonts.urdu },
});

export default PakistanScreen;
