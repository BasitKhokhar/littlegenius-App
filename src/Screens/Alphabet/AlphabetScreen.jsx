import React, { useState } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors } from '../../Data/colorsTheme';
import { alphabetData } from '../../Data/alphabetData';
import { Header } from '../../Components/UI';
import AlphabetCard from '../../Components/Educational/AlphabetCard';
import VocabularyCard from '../../Components/Educational/VocabularyCard';
import QuizEntryBar from '../../Components/Common/QuizEntryBar';

const { width } = Dimensions.get('window');

const AlphabetScreen = ({ navigation, route }) => {
  const [selectedLetter, setSelectedLetter] = useState(null);
  const letter = selectedLetter !== null ? alphabetData[selectedLetter] : null;

  // ─── Detail view ──────────────────────────────────────────
  if (selectedLetter !== null && letter) {
    return (
      <View style={styles.container}>
        <Header
          title={`Letter ${letter.letter}`}
          showBack={true}
          onBackPress={() => setSelectedLetter(null)}
        />
        <ScrollView
          contentContainerStyle={styles.detailContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero letter card */}
          <View style={[styles.letterHeroCard, { backgroundColor: letter.color }]}>
            <View style={styles.letterHeroDecor} />
            <Text style={styles.letterHeroBig}>{letter.letter}</Text>
            <Text style={styles.letterHeroSmall}>{letter.letter.toLowerCase()}</Text>
            <View style={styles.letterHeroBadge}>
              <Text style={styles.letterHeroBadgeText}>Tap cards to hear pronunciation 🔊</Text>
            </View>
          </View>

          {/* Vocabulary section */}
          <View style={styles.vocabSection}>
            <Text style={styles.vocabSectionTitle}>
              📚 Vocabulary for <Text style={{ color: letter.color }}>"{letter.letter}"</Text>
            </Text>
            {letter.vocabulary.map((vocab, idx) => (
              <VocabularyCard
                key={idx}
                emoji={vocab.emoji}
                word={vocab.word}
                category={vocab.category}
                categoryColor={letter.color}
              />
            ))}
          </View>

        </ScrollView>
      </View>
    );
  }

  // ─── Grid view ────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Header
        title="English ABC"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={alphabetData}
        keyExtractor={(item) => item.letter}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <QuizEntryBar
            color="#F43F5E"
            onPress={() => navigation.navigate('QuizList', { module: 'alphabet' })}
          />
        }
        renderItem={({ item, index }) => (
          <AlphabetCard
            letter={item.letter}
            color={item.color}
            emoji={item.vocabulary[0].emoji}
            word={item.vocabulary[0].word}
            onPress={() => setSelectedLetter(index)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F5FC',
  },

  // Grid view
  gridContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 30,
    gap: 12,
  },
  columnWrapper: {
    gap: 12,
    justifyContent: 'space-between',
  },

  // Detail view
  detailContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 50,
  },
  letterHeroCard: {
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  letterHeroDecor: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  letterHeroBig: {
    fontSize: 100,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 110,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  letterHeroSmall: {
    fontSize: 48,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    marginTop: -8,
    marginBottom: 16,
  },
  letterHeroBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  letterHeroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  vocabSection: {
    marginBottom: 20,
  },
  vocabSectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1E1B4B',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
});

export default AlphabetScreen;
