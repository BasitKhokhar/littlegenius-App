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
import { storiesData, islamicStoriesData, getStoryHeroImage } from '../../Data';
import { Header } from '../../Components/UI';
import { useThemeColors } from '../../Context/ThemeContext';
import { useHideTabBar } from '../../Context/TabBarContext';
import { useTabBarClearance } from '../../Hooks';
import { Radius, coloredShadow } from '../../Theme';
import SpeakButton from '../../Components/Common/SpeakButton';
import { getStoryAccent } from '../../Utils/storyColors';

const getStoryImage = (isIslamicList, idx) => getStoryHeroImage(storiesData.length, isIslamicList, idx);

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
    const { color: accentColor, dark: accentDark } = getStoryAccent(selectedStory);
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
              {/* Plain black fade instead of an accent tint — the accent
                  colour rarely matches the artwork's own palette, so tinting
                  it just muddies the image. A simple dark gradient keeps the
                  top of the illustration fully clear and only darkens near
                  the bottom, enough for the title/moral text to read. */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.88)']}
                locations={[0, 0.4, 0.72, 1]}
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
            <View key={idx} style={[styles.pageCardWrap, coloredShadow(accentColor, 'md')]}>
              <LinearGradient
                colors={[accentColor + '17', colors.surface, colors.surface]}
                locations={[0, 0.32, 1]}
                style={[styles.pageCard, { borderColor: accentColor + '33' }]}
              >
                <View style={[styles.pageCardDecor, { backgroundColor: accentColor + '15' }]} pointerEvents="none" />
                <View style={[styles.pageNumBadge, { backgroundColor: accentColor }, coloredShadow(accentColor, 'sm')]}>
                  <Text style={styles.pageNum}>{idx + 1}</Text>
                </View>
                <Text style={styles.pageEmoji}>{page.emoji}</Text>
                <Text style={styles.pageText}>{page.text}</Text>
                {page.urduText ? (
                  <Text style={[styles.pageUrduText, { borderTopColor: accentColor + '2A' }]}>{page.urduText}</Text>
                ) : null}
                <SpeakButton text={page.text} language="en-US" label="🔊 Read Aloud" color={accentColor} />
              </LinearGradient>
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
          const { color: cardColor, dark: cardColorDark } = getStoryAccent(idx);
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
                style={styles.storyCard}
              >
                {/* Anchored to the card's own two rounded corners (top-right,
                    bottom-right) so they're always clipped in place instead of
                    floating off the card at arbitrary content heights. */}
                <View style={styles.storyCardBodyDecorTop} pointerEvents="none" />
                <View style={styles.storyCardBodyDecorBottom} pointerEvents="none" />

                {/* Left: banner art / emoji fallback */}
                <View style={styles.storyImageBox}>
                  {image ? (
                    <Image source={image} style={styles.storyImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.storyImageFallback}>
                      <Text style={styles.storyCardEmoji}>{s.emoji}</Text>
                    </View>
                  )}
                  {idx === 0 ? (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>⭐</Text>
                    </View>
                  ) : null}
                </View>

                {/* Right: title (EN + UR), moral, timer */}
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
  // Outer wrapper = the gradient itself, padded 12 on every side, with the
  // image on the left and title/moral/timer content on the right.
  storyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    padding: 12,
    overflow: 'hidden',
  },
  storyImageBox: {
    width: 110,
    height: 110,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
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
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  featuredBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  featuredBadgeText: {
    fontSize: 11,
  },
  // Soft translucent bubbles tucked in the card's own two corners — the
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
  storyCardEmoji: { fontSize: 30 },
  storyInfo: { flex: 1 },
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

  // Story detail
  storyContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroImageWrap: {
    height: 360,
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
  pageCardWrap: {
    borderRadius: 22,
    marginBottom: 14,
  },
  pageCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 18,
    alignItems: 'center',
    overflow: 'hidden',
  },
  pageCardDecor: {
    position: 'absolute',
    top: -26,
    right: -26,
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  pageNumBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
