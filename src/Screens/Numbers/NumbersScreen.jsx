import React, { useState } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { numbersData } from '../../Data/numbersData';
import { Header } from '../../Components/UI';
import SpeakButton from '../../Components/Common/SpeakButton';
import QuizEntryBar from '../../Components/Common/QuizEntryBar';
import SpeechEngine from '../../Utils/speechEngine';

const { width } = Dimensions.get('window');

const NumbersScreen = ({ navigation, route }) => {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const [selectedNum, setSelectedNum] = useState(null);

  const handleNumPress = (numItem) => {
    setSelectedNum(numItem);
  };

  const closeModal = () => {
    SpeechEngine.stop();
    setSelectedNum(null);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Numbers 1-100 (گنتی)"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={numbersData}
        keyExtractor={(item) => item.number.toString()}
        numColumns={3}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        ListFooterComponent={
          <QuizEntryBar
            color="#3EC38B"
            onPress={() => navigation.navigate('QuizList', { module: 'numbers' })}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { borderColor: item.color }]}
            onPress={() => handleNumPress(item)}
            activeOpacity={0.85}
          >
            <Text style={[styles.numText, { color: item.color }]}>
              {item.number}
            </Text>
            <Text style={styles.urduName}>{item.urdu}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Number Detail Modal */}
      {selectedNum && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Close Button */}
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              {/* Bubbly Number Display */}
              <View style={[styles.bubble, { backgroundColor: selectedNum.color + '15', borderColor: selectedNum.color }]}>
                <Text style={[styles.bigNumText, { color: selectedNum.color }]}>
                  {selectedNum.number}
                </Text>
              </View>

              {/* Names */}
              <Text style={styles.englishLabel}>{selectedNum.speak.split('.')[1]?.trim().replace('In English ', '') || selectedNum.number}</Text>
              <Text style={styles.urduLabel}>{selectedNum.urdu}</Text>

              {/* Visual Counters */}
              <Text style={styles.countingTitle}>Let's Count! (آؤ گنیں!)</Text>
              <ScrollView 
                horizontal={false}
                contentContainerStyle={styles.emojiGrid}
                showsVerticalScrollIndicator={false}
                style={styles.emojiScroll}
              >
                {selectedNum.objects.map((emoji, idx) => (
                  <Text key={idx} style={styles.emojiItem}>
                    {emoji}
                  </Text>
                ))}
              </ScrollView>

              {/* Speech */}
              <View style={styles.audioSection}>
                <SpeakButton
                  text={selectedNum.speak}
                  language="en-US"
                  color={selectedNum.color}
                  label="🔊 Hear Pronunciation"
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  gridContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    paddingBottom: 130,
    gap: 10,
  },
  gridRow: {
    justifyContent: 'space-between',
    gap: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '31%',
    minHeight: 100,
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  numText: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  urduName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textMuted,
  },
  bubble: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  bigNumText: {
    fontSize: 48,
    fontWeight: '900',
  },
  englishLabel: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  urduLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 16,
  },
  countingTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  emojiScroll: {
    maxHeight: 120,
    width: '100%',
    marginBottom: 20,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  emojiItem: {
    fontSize: 26,
  },
  audioSection: {
    width: '100%',
  },
});

export default NumbersScreen;
