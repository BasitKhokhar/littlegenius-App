import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  StatusBar,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useAnimatedReaction,
  interpolate,
  interpolateColor,
  Extrapolation,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ROUTES } from '../../Constants';
import { setOnboardingComplete } from '../../Utils/secureAuth';
import SpeechEngine from '../../Utils/speechEngine';
import { lightColors as C, gradients, onBrandOverlay as O } from '../../Theme/colors';
import { Spacing, Radius, textStyles, coloredShadow } from '../../Theme';

const { width, height } = Dimensions.get('window');
// Hero art fills the top ~65%; the content sheet below overlaps it by
// SHEET_OVERLAP so its rounded top corners peek in front of the image —
// matching the bottom-sheet-over-hero layout from the design reference.
const HERO_HEIGHT = height * 0.68;
const SHEET_RADIUS = 32;
const SHEET_OVERLAP = 24;

// ── Slides ──────────────────────────────────────────────────────
// Each slide pairs a full-bleed illustration with its copy — one
// consistent indigo accent carries the CTA & dots throughout the flow.
const SLIDES = [
  {
    id: '1',
    title: 'Learn Languages Offline',
    description:
      'Bilingual English phonics, vocabulary & beautiful Nastaliq script — perfect for Playgroup, Nursery & Class One.',
    image: require('../../../assets/onboarding1.png'),
  },
  {
    id: '2',
    title: 'Solve Brain & IQ Games',
    description:
      'Memory pairs, logic patterns, rapid math races & odd-one-out puzzles curated to grow young, curious minds.',
    image: require('../../../assets/onboarding2.png'),
  },
  {
    id: '3',
    title: 'Islamic Values & Stories',
    description:
      'Gentle manners with everyday Duas, the 6 Kalmas and audio moral stories — calm, beautiful & 100% offline.',
    image: require('../../../assets/onboarding3.png'),
  },
  {
    id: '4',
    title: 'Writing & Tracing Practice',
    description:
      'Trace every letter & number with guided strokes and playful worksheets that build confident little hands.',
    image: require('../../../assets/onboarding4.png'),
  },
];

const LAST = SLIDES.length - 1;
const THEME_ACCENT = C.primary;
const THEME_GRADIENT = gradients.cta;

// ── Full-bleed hero image (gentle Ken Burns zoom + crossfade) ───
const Hero = ({ item, index, scrollX }) => {
  const input = [(index - 1) * width, index * width, (index + 1) * width];
  const imgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, input, [0.35, 1, 0.35], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(scrollX.value, input, [1.14, 1, 1.14], Extrapolation.CLAMP) }],
  }));
  return (
    <View style={styles.heroSlide}>
      <Animated.Image source={item.image} resizeMode="cover" style={[styles.heroImage, imgStyle]} />
    </View>
  );
};

// ── Slide copy (rises + fades in as its page centers) ───────────
const Copy = ({ item, index, scrollX }) => {
  const input = [(index - 1) * width, index * width, (index + 1) * width];
  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, input, [0, 1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollX.value, input, [22, 0, 22], Extrapolation.CLAMP) }],
  }));
  return (
    <Animated.View style={[styles.copySlide, textStyle]}>
      <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.75}>
        {item.title}
      </Text>
      <Text style={styles.description}>{item.description}</Text>
    </Animated.View>
  );
};

// ── Scroll-linked pagination dot ────────────────────────────────
const Dot = ({ index, scrollX }) => {
  const input = [(index - 1) * width, index * width, (index + 1) * width];
  const aStyle = useAnimatedStyle(() => ({
    width: interpolate(scrollX.value, input, [8, 24, 8], Extrapolation.CLAMP),
    opacity: interpolate(scrollX.value, input, [0.4, 1, 0.4], Extrapolation.CLAMP),
    backgroundColor: interpolateColor(scrollX.value, input, [C.borderStrong, THEME_ACCENT, C.borderStrong]),
  }));
  return <Animated.View style={[styles.dot, aStyle]} />;
};

const Onboarding = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Keep speech silent on this screen (matches previous behaviour).
  useEffect(() => {
    SpeechEngine.stop();
    return () => SpeechEngine.stop();
  }, []);

  // Whole-screen entrance choreography (fade + gentle rise).
  const enter = useSharedValue(0);
  useEffect(() => {
    enter.value = withDelay(80, withTiming(1, { duration: 620, easing: Easing.out(Easing.cubic) }));
  }, [enter]);
  const enterStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: interpolate(enter.value, [0, 1], [24, 0]) }],
  }));

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  // Derive the active index on the UI thread → drives label + haptic.
  const bumpIndex = useCallback((i) => {
    setActiveIndex(i);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);
  useAnimatedReaction(
    () => Math.round(scrollX.value / width),
    (curr, prev) => {
      if (prev !== null && curr !== prev && curr >= 0 && curr <= LAST) runOnJS(bumpIndex)(curr);
    }
  );

  // CTA press feedback.
  const press = useSharedValue(0);
  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(press.value, [0, 1], [1, 0.96]) }],
  }));

  const goToProfile = useCallback(async () => {
    await setOnboardingComplete();
    navigation.replace(ROUTES.AUTH.PROFILE);
  }, [navigation]);

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      scrollRef.current?.scrollTo({ x: (activeIndex - 1) * width, animated: true });
    }
  }, [activeIndex]);

  const handleNext = useCallback(() => {
    if (activeIndex < LAST) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      goToProfile();
    }
  }, [activeIndex, goToProfile]);

  const isFirst = activeIndex === 0;
  const isLast = activeIndex === LAST;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <Animated.View style={[styles.content, enterStyle]}>
        {/* Skip — floats over the hero art */}
        <View style={[styles.header, { top: insets.top + Spacing.sm }]}>
          {!isLast && (
            <Pressable onPress={goToProfile} hitSlop={10} style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.6 }]}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          )}
        </View>

        {/* Swipeable hero + copy */}
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          bounces={false}
          style={styles.scroller}
        >
          {SLIDES.map((item, i) => (
            <View key={item.id} style={styles.page}>
              <Hero item={item} index={i} scrollX={scrollX} />
              <View style={styles.copyArea}>
                <Copy item={item} index={i} scrollX={scrollX} />
              </View>
            </View>
          ))}
        </Animated.ScrollView>

        {/* Pagination dots — fixed just inside the sheet's rounded top edge */}
        <View
          style={[styles.dotsRow, { top: HERO_HEIGHT - SHEET_OVERLAP + Spacing.lg }]}
          pointerEvents="none"
        >
          {SLIDES.map((_, i) => (
            <Dot key={i} index={i} scrollX={scrollX} />
          ))}
        </View>

        {/* Navigation: Previous + primary CTA — both size to their own
            content and sit at opposite ends of the row (space-between),
            neither one stretching to fill it. Previous always shows so the
            first slide reads as the true start of the flow, it just no-ops
            there since there is no earlier slide to return to. */}
        <View style={[styles.navRow, { paddingBottom: insets.bottom/2 }]}>
          <Pressable
            onPress={handlePrev}
            disabled={isFirst}
            style={({ pressed }) => [styles.prevBtn, isFirst && styles.prevBtnDisabled, pressed && !isFirst && { opacity: 0.7 }]}
          >
            <Text style={styles.prevText}>Previous</Text>
          </Pressable>

          <Animated.View style={ctaStyle}>
            <Pressable
              onPress={handleNext}
              onPressIn={() => { press.value = withTiming(1, { duration: 90 }); }}
              onPressOut={() => { press.value = withTiming(0, { duration: 140 }); }}
              style={styles.ctaPress}
            >
              <LinearGradient
                colors={THEME_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.cta, coloredShadow(THEME_ACCENT, 'lg')]}
              >
                <Text style={styles.ctaText}>{isLast ? "Let's Start" : 'Next'}</Text>
                <Ionicons name="arrow-forward" size={18} color={C.onPrimary} style={styles.ctaIcon} />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.surface },
  content: { flex: 1 },

  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.xl,
  },
  skipBtn: { backgroundColor: O.faint, borderRadius: Radius.sm, paddingVertical: 6, paddingHorizontal: Spacing.lg },
  skipText: { ...textStyles.bodyStrong, fontSize: 13, color: O.textStrong },

  scroller: { flex: 1 },
  page: { width, height: '100%' },

  heroSlide: {
    width,
    height: HERO_HEIGHT,
    overflow: 'hidden',
    backgroundColor: C.brandSurface,
  },
  heroImage: { width: '100%', height: '100%' },

  // The white sheet rides up over the hero image by SHEET_OVERLAP so its
  // rounded top corners reveal a sliver of image behind them, then fills
  // the remaining ~30-35% of the screen — matching the reference layout.
  copyArea: {
    flex: 1,
    marginTop: -SHEET_OVERLAP,
    backgroundColor: C.surface,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    paddingTop: SHEET_OVERLAP + Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  copySlide: { alignItems: 'center',marginTop:20 },
  title: { ...textStyles.h1, fontSize: 26, color: C.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  description: { ...textStyles.body, color: C.textSecondary, textAlign: 'center', lineHeight: 22 },

  dotsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    height: 10,
  },
  dot: { height: 8, borderRadius: 4 },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  // Same pill shape & vertical padding as the primary CTA below, just in a
  // quieter tint — the two read as one matched button pair, sized to their
  // own text rather than stretching to fill the row.
  prevBtn: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.xxl,
    borderRadius: 50,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevBtnDisabled: { opacity: 0.35 },
  prevText: { ...textStyles.button, fontSize: 17, color: C.primary },

  ctaPress: { borderRadius: Radius.lg },
  cta: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: Spacing.xxl,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { ...textStyles.button, fontSize: 17, color: C.onPrimary },
  ctaIcon: { marginLeft: Spacing.sm },
});

export default Onboarding;
