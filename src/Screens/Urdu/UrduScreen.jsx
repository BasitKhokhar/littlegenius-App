import React, { useState } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { Fonts } from '../../Theme/fonts';
import { urduData } from '../../Data/urduData';
import { Header } from '../../Components/UI';
import SpeakButton from '../../Components/Common/SpeakButton';
import QuizEntryBar from '../../Components/Common/QuizEntryBar';

const UrduScreen = ({ navigation, route }) => {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const letter = selectedLetter !== null ? urduData[selectedLetter] : null;

  if (letter) {
    return (
      <View style={styles.container}>
        <Header
          title={`Haroof - ${letter.name}`}
          showBack={true}
          onBackPress={() => setSelectedLetter(null)}
        />
        
        <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.letterDisplay, { borderColor: letter.color }]}>
            <Text style={[styles.letterText, { color: letter.color }]}>
              {letter.letter}
            </Text>
            <Text style={styles.letterName}>{letter.name}</Text>
          </View>

          <Text style={styles.vocabularyTitle}>Vocabulary (ذخیرہ الفاظ)</Text>
          {letter.vocabulary.map((vocab, idx) => (
            <View key={idx} style={styles.vocabCard}>
              <View style={styles.vocabLeft}>
                <Text style={styles.vocabEmoji}>{vocab.emoji}</Text>
                <View style={styles.vocabTextContainer}>
                  <Text style={styles.vocabWord}>{vocab.word}</Text>
                  <Text style={styles.vocabMeaning}>{vocab.meaning}</Text>
                </View>
              </View>
              <SpeakButton
                text={vocab.speak}
                language="ur-PK"
                color={letter.color}
                label="🔊 Pronounce"
                size="sm"
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Urdu Haroof (اردو حروف)"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={urduData}
        keyExtractor={(item) => item.name}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        ListFooterComponent={
          <QuizEntryBar
            color="#8A6FF0"
            onPress={() => navigation.navigate('QuizList', { module: 'urdu' })}
          />
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.card, { borderColor: item.color }]}
            onPress={() => setSelectedLetter(index)}
            activeOpacity={0.85}
          >
            <Text style={[styles.gridLetterText, { color: item.color }]}>
              {item.letter}
            </Text>
            <Text style={styles.gridNameText}>{item.name}</Text>
            <Text style={styles.hint}>5 Words • ۵ الفاظ</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 130,
    gap: 12,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 3,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    minHeight: 150,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  gridLetterText: {
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 4,
    lineHeight: 64,
    fontFamily: Fonts.urduBold, // Nastaliq Urdu rendering
  },
  gridNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  hint: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  detailContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 130,
  },
  letterDisplay: {
    borderRadius: 28,
    borderWidth: 3,
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: colors.surface,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  letterText: {
    fontSize: 80,
    fontWeight: '900',
    lineHeight: 130,
    marginBottom: 8,
    fontFamily: Fonts.urduBold, // Nastaliq Urdu rendering
  },
  letterName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  vocabularyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  vocabCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  vocabLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  vocabEmoji: {
    fontSize: 34,
  },
  vocabTextContainer: {
    flex: 1,
    gap: 2,
  },
  vocabWord: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'left',
    lineHeight: 38,
    fontFamily: Fonts.urduBold, // Nastaliq Urdu rendering
  },
  vocabMeaning: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
});

export default UrduScreen;
