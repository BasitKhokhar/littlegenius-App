import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { storiesData } from '../../Data';
import { Header } from '../../Components/UI';

const STORY_COLORS = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

const StoriesScreen = ({ navigation }) => {
  const [selectedStory, setSelectedStory] = useState(null);
  const story = selectedStory !== null ? storiesData[selectedStory] : null;

  // ─── Story Detail ──────────────────────────────────────────
  if (selectedStory !== null && story) {
    const accentColor = STORY_COLORS[selectedStory % STORY_COLORS.length];
    return (
      <View style={styles.container}>
        <Header
          title={story.title}
          showBack={true}
          onBackPress={() => setSelectedStory(null)}
        />
        <ScrollView
          contentContainerStyle={styles.storyContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={[styles.storyHero, { backgroundColor: accentColor }]}>
            <View style={styles.storyHeroDecor} />
            <Text style={styles.storyHeroEmoji}>{story.emoji}</Text>
            <Text style={styles.storyHeroTitle}>{story.title}</Text>
            {story.urduTitle ? (
              <Text style={styles.storyHeroUrduTitle}>{story.urduTitle}</Text>
            ) : null}
            <View style={styles.moralBadge}>
              <Text style={styles.moralBadgeLabel}>💡 Moral / سبق</Text>
            </View>
            <Text style={styles.moralText}>{story.moral}</Text>
            {story.urduMoral ? (
              <Text style={styles.moralUrduText}>{story.urduMoral}</Text>
            ) : null}
          </View>

          {/* Pages */}
          {story.pages.map((page, idx) => (
            <View key={idx} style={styles.pageCard}>
              <View style={[styles.pageNumBadge, { backgroundColor: accentColor }]}>
                <Text style={styles.pageNum}>{idx + 1}</Text>
              </View>
              <Text style={styles.pageEmoji}>{page.emoji}</Text>
              <Text style={styles.pageText}>{page.text}</Text>
              {page.urduText ? (
                <Text style={styles.pageUrduText}>{page.urduText}</Text>
              ) : null}
            </View>
          ))}

          {/* Quiz CTA */}
          <TouchableOpacity
            style={[styles.quizButton, { backgroundColor: accentColor }]}
            onPress={() => navigation.navigate('StoryQuiz', { story: story.id })}
            activeOpacity={0.88}
          >
            <Text style={styles.quizButtonText}>Take Story Quiz 🧠</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ─── Stories List ──────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Header
        title="Moral Stories"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.listHeading}>📚 Choose a Story / کہانی منتخب کرو</Text>
        <Text style={styles.listSubheading}>Simple stories for Class 1 • جماعت اول کے لیے آسان کہانیاں</Text>
        {storiesData.map((s, idx) => {
          const cardColor = STORY_COLORS[idx % STORY_COLORS.length];
          return (
            <TouchableOpacity
              key={s.id}
              style={[styles.storyCard, { backgroundColor: cardColor }]}
              onPress={() => setSelectedStory(idx)}
              activeOpacity={0.88}
            >
              <View style={styles.storyCardDecor} />
              <View style={styles.storyEmojiBubble}>
                <Text style={styles.storyCardEmoji}>{s.emoji}</Text>
              </View>
              <View style={styles.storyInfo}>
                <Text style={styles.storyCardTitle}>{s.title}</Text>
                {s.urduTitle ? (
                  <Text style={styles.storyCardUrduTitle}>{s.urduTitle}</Text>
                ) : null}
                <Text style={styles.storyCardMoral} numberOfLines={2}>💡 {s.moral}</Text>
                <View style={styles.readTimeBadge}>
                  <Text style={styles.readTimeText}>{s.readTime}</Text>
                </View>
              </View>
              <View style={styles.storyArrow}>
                <Text style={styles.storyArrowText}>→</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F5FC' },

  // List view
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 50,
  },
  listHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E1B4B',
    marginBottom: 6,
  },
  listSubheading: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A8DA3',
    marginBottom: 14,
  },
  storyCard: {
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
  storyCardDecor: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  storyEmojiBubble: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  storyCardEmoji: { fontSize: 30 },
  storyInfo: { flex: 1 },
  storyCardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  storyCardUrduTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    textAlign: 'left',
  },
  storyCardMoral: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 8,
    lineHeight: 15,
  },
  readTimeBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  readTimeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  storyArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  storyArrowText: { fontSize: 14, color: '#FFF', fontWeight: '900' },

  // Story detail
  storyContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 50,
  },
  storyHero: {
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  storyHeroDecor: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  storyHeroEmoji: { fontSize: 60, marginBottom: 10 },
  storyHeroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  storyHeroUrduTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginBottom: 14,
  },
  moralBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  moralBadgeLabel: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  moralText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 18,
  },
  moralUrduText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 6,
  },
  pageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEAF6',
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  pageNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  pageNum: { fontSize: 12, fontWeight: '900', color: '#FFF' },
  pageEmoji: { fontSize: 40, marginBottom: 10 },
  pageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1B4B',
    textAlign: 'center',
    lineHeight: 22,
  },
  pageUrduText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EDE9FE',
    width: '100%',
  },
  quizButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    elevation: 5,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
  },
  quizButtonText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default StoriesScreen;
