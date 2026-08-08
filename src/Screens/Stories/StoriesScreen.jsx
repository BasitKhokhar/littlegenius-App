import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { storiesData, islamicStoriesData, storyImages } from '../../Data';
import { Header } from '../../Components/UI';
import { useThemeColors } from '../../Context/ThemeContext';
import { useHideTabBar } from '../../Context/TabBarContext';
import { useTabBarClearance } from '../../Hooks';
import { Radius, coloredShadow } from '../../Theme';
import SpeakButton from '../../Components/Common/SpeakButton';

const STORY_COLORS = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
// One shade darker per accent above, for the card's gradient body.
const STORY_COLORS_DARK = ['#D97706', '#DC2626', '#059669', '#2563EB', '#7C3AED', '#DB2777'];

// storyImages holds 20 banner illustrations; storiesData only has 18 entries,
// so every moral story gets one (idx 0-17). The 2 leftover banners (idx
// 18-19) go to the first two Islamic stories — the rest fall back to the
// emoji tile since there's no artwork left for them.
const getStoryImage = (isIslamicList, idx) => {
  if (!isIslamicList) return idx < storyImages.length ? storyImages[idx] : null;
  const offset = storiesData.length + idx;
  return offset < storyImages.length ? storyImages[offset] : null;
};

const StoriesScreen = ({ navigation, route }) => {
  const colors = useThemeColors();
  const bottomPad = useTabBarClearance();
  const styles = makeStyles(colors);
  const [selectedStory, setSelectedStory] = useState(null);
  const isIslamic = route?.params?.source === 'islamic';
  const stories = isIslamic ? islamicStoriesData : storiesData;
  const story = selectedStory !== null ? stories[selectedStory] : null;

  // Reading a story is a drill-down even though it isn't a pushed route, so
  // the tab bar has to go — it would cover the last page card otherwise.
  // Called before the early return below to keep hook order stable.
  useHideTabBar(story !== null);

  // ─── Story Detail ──────────────────────────────────────────
  if (selectedStory !== null && story) {
    const accentColor = STORY_COLORS[selectedStory % STORY_COLORS.length];
    const accentDark = STORY_COLORS_DARK[selectedStory % STORY_COLORS_DARK.length];
    const heroImage = getStoryImage(isIslamic, selectedStory);
    return (
      <View style={styles.container}>
        <Header
          title={story.title}
          showBack={true}
          onBackPress={() => setSelectedStory(null)}
        />
        <ScrollView
          contentContainerStyle={[styles.storyContent, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          {heroImage ? (
            <View style={[styles.heroImageWrap, coloredShadow(accentColor, 'lg')]}>
              <Image source={heroImage} style={styles.heroImage} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', accentColor + 'B3', accentDark]}
                locations={[0, 0.5, 1]}
                style={styles.heroImageOverlay}
              />
              <View style={styles.heroImageBadge}>
                <Text style={styles.heroImageBadgeText}>{story.emoji} {isIslamic ? 'Islamic Story' : 'Moral Story'}</Text>
              </View>
              <View style={styles.heroImageContent}>
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
            </View>
          ) : (
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
          )}

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
              <SpeakButton text={page.text} language="en-US" label="🔊 Read Aloud" color={accentColor} />
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
        title={isIslamic ? 'Islamic Stories' : 'Moral Stories'}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.listHeading}>
          {isIslamic ? '🌙 Choose a Story / کہانی منتخب کرو' : '📚 Choose a Story / کہانی منتخب کرو'}
        </Text>
        <Text style={styles.listSubheading}>
          {isIslamic
            ? 'Stories of Prophets & Sahaba • انبیاء اور صحابہ کی کہانیاں'
            : 'Simple stories for Class 1 • جماعت اول کے لیے آسان کہانیاں'}
        </Text>
        {stories.map((s, idx) => {
          const cardColor = STORY_COLORS[idx % STORY_COLORS.length];
          const cardColorDark = STORY_COLORS_DARK[idx % STORY_COLORS_DARK.length];
          const image = getStoryImage(isIslamic, idx);
          return (
            <TouchableOpacity
              key={s.id}
              style={[styles.storyCardWrap, coloredShadow(cardColor, 'md')]}
              onPress={() => setSelectedStory(idx)}
              activeOpacity={0.92}
            >
                <LinearGradient
                  colors={[cardColor, cardColorDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                 style={[styles.storyCardWrap, coloredShadow(cardColor, 'md')]}
                >
              <View style={styles.storyCard}>
                {/* Banner art / emoji fallback */}
                <View style={styles.storyImageBox}>
                  {image ? (
                    <Image source={image} style={styles.storyImage} resizeMode="cover" />
                  ) : (
                    <LinearGradient
                      colors={[cardColor, cardColorDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.storyImageFallback}
                    >
                      <Text style={styles.storyCardEmoji}>{s.emoji}</Text>
                    </LinearGradient>
                  )}
                  {idx === 0 ? (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>⭐ Featured</Text>
                    </View>
                  ) : null}
                </View>

                {/* Colour body */}
                <LinearGradient
                  colors={[cardColor, cardColorDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.storyCardBody}
                >
                  {/* Anchored to the body's own two rounded corners (top-right,
                      bottom-right) so they're always clipped in place instead of
                      floating off the card at arbitrary text heights. */}
                  <View style={styles.storyCardBodyDecorTop} pointerEvents="none" />
                  <View style={styles.storyCardBodyDecorBottom} pointerEvents="none" />

                  <View style={styles.storyInfo}>
                    <Text style={styles.storyCardTitle} numberOfLines={1}>{s.title}</Text>
                    {s.urduTitle ? (
                      <Text style={styles.storyCardUrduTitle} numberOfLines={1}>{s.urduTitle}</Text>
                    ) : null}
                    <Text style={styles.storyCardMoral} numberOfLines={2}>💡 {s.moral}</Text>
                    <View style={styles.readTimeBadge}>
                      <Text style={styles.readTimeText}>🕐 {s.readTime}</Text>
                    </View>
                  </View>
                </LinearGradient>

                <View style={styles.storyPlayBtn}>
                  <Text style={[styles.storyPlayIcon, { color: cardColor }]}>▶</Text>
                </View>
              </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // List view
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  listSubheading: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 14,
  },
  storyCardWrap: {
    borderRadius: Radius.xl,
    marginBottom: 18,
  },
  storyCard: {
    flexDirection: 'row',
    height: 132,
    borderRadius: Radius.xl,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  storyImageBox: {
    width: 132,
    height: '100%',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyImageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.2,
  },
  storyCardBody: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  // Soft translucent bubbles tucked in the body's own two corners — the
  // "light colour bubble" accent. Sized/placed to sit fully inside the
  // card's rounded top-right / bottom-right corners rather than floating
  // off the edge or landing mid-card.
  storyCardBodyDecorTop: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  storyCardBodyDecorBottom: {
    position: 'absolute',
    bottom: -26,
    right: -10,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  storyCardEmoji: { fontSize: 34 },
  storyInfo: { flex: 1, paddingRight: 44 },
  storyCardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  storyCardUrduTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    marginBottom: 6,
    textAlign: 'left',
  },
  storyCardMoral: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
    marginBottom: 10,
    lineHeight: 16,
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
  storyPlayBtn: {
    position: 'absolute',
    right: 14,
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  storyPlayIcon: {
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 2,
  },

  // Story detail
  storyContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroImageWrap: {
    height: 300,
    borderRadius: 28,
    marginBottom: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  heroImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
  heroImageBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  heroImageBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroImageContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 22,
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
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  pageUrduText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
