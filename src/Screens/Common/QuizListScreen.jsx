import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { quizPacksByModule } from '../../Data/quizPacksData';
import { getQuizBank } from '../../Utils/quizGenerators';
import { Header } from '../../Components/UI';

const QuizListScreen = ({ navigation, route }) => {
  const { module } = route.params;
  const config = quizPacksByModule[module];

  if (!config) {
    return (
      <View style={styles.container}>
        <Header title="Quiz" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>Quiz not found for this module.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={config.title}
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>{config.subtitle}</Text>

        {config.packs.map((pack) => {
          const bankSize = getQuizBank(pack.bankKey).length;
          return (
            <TouchableOpacity
              key={pack.id}
              style={[styles.packCard, { backgroundColor: pack.color }]}
              onPress={() => navigation.navigate('ModuleQuiz', { module, packId: pack.id })}
              activeOpacity={0.88}
            >
              <View style={styles.packDecor} />
              <View style={styles.packEmojiBubble}>
                <Text style={styles.packEmoji}>{pack.emoji}</Text>
              </View>
              <View style={styles.packInfo}>
                <Text style={styles.packTitle}>{pack.title}</Text>
                <Text style={styles.packDesc}>{pack.description}</Text>
                <View style={styles.packBadge}>
                  <Text style={styles.packBadgeText}>{bankSize}+ Questions • 10 per round</Text>
                </View>
              </View>
              <Text style={styles.packArrow}>→</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F5FC' },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 50,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A8DA3',
    marginBottom: 16,
    lineHeight: 18,
  },
  packCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
  packDecor: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  packEmojiBubble: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  packEmoji: { fontSize: 24 },
  packInfo: { flex: 1 },
  packTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  packDesc: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 8,
    lineHeight: 15,
  },
  packBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  packBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  packArrow: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A8DA3',
  },
});

export default QuizListScreen;
