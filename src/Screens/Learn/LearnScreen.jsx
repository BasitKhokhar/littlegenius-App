import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../Data/colorsTheme';
import { Fonts } from '../../Theme/fonts';
import learnModules from '../../Data/learnModulesData';
import { Header } from '../../Components/UI';
import SpeakButton from '../../Components/Common/SpeakButton';

// Generic, data-driven general-knowledge screen. The module to show is
// chosen by route.params.moduleKey (see learnModulesData.js).
const LearnScreen = ({ navigation, route }) => {
  const moduleKey = route?.params?.moduleKey;
  const data = learnModules[moduleKey];

  // Defensive: should never happen because Home passes a valid key.
  const tabs = data?.tabs || [];
  const [activeTab, setActiveTab] = useState(tabs[0]?.key);

  if (!data) {
    return (
      <View style={styles.container}>
        <Header title="Learn" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>This topic is coming soon! 🚀</Text>
        </View>
      </View>
    );
  }

  const current = tabs.find((t) => t.key === activeTab) || tabs[0];

  return (
    <View style={styles.container}>
      <Header
        title={data.title}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, { backgroundColor: activeTab === tab.key ? data.color : Colors.borderLight }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab.key ? '#FFF' : Colors.textDark }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {current?.items.map((item) => (
          <View key={item.en} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: item.color }]}>
            <View style={styles.row}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <View style={styles.flex}>
                <Text style={styles.value}>{item.en}</Text>
                <Text style={styles.urduValue}>{item.ur}</Text>
              </View>
            </View>
            <Text style={styles.fact}>{item.fact}</Text>
            <Text style={styles.urduFact}>{item.urFact}</Text>
            <SpeakButton text={item.speak || `${item.en}. ${item.fact}`} language="en-US" label="🔊 Hear" color={item.color} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgMain },
  tabScroll: { flexGrow: 0 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, paddingVertical: 12 },
  tab: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontWeight: '700', fontSize: 11, textTransform: 'uppercase' },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.borderLight,
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
  value: { fontSize: 17, fontWeight: '900', color: Colors.textDark },
  urduValue: { fontSize: 16, fontWeight: '700', color: Colors.textDark, textAlign: 'right', lineHeight: 30, fontFamily: Fonts.urdu },
  fact: { fontSize: 13, fontWeight: '600', color: Colors.textLight, marginBottom: 4, lineHeight: 18 },
  urduFact: { fontSize: 14, fontWeight: '700', color: Colors.textLight, textAlign: 'right', lineHeight: 28, marginBottom: 6, fontFamily: Fonts.urdu },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 14, fontWeight: '700', color: Colors.textLight, textAlign: 'center' },
});

export default LearnScreen;
