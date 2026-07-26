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
  withRepeat,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ROUTES } from '../../Constants';
import SpeechEngine from '../../Utils/speechEngine';
import { lightColors as C, gradients } from '../../Theme/colors';
import { Spacing, Radius, textStyles, coloredShadow } from '../../Theme';

const { width, height } = Dimensions.get('window');
const TRACK_W = width - Spacing.xl * 2;
const ART = Math.min(width * 0.72, 300);

// ── Slides ──────────────────────────────────────────────────────
// Each slide pairs an offline Lottie (pure-vector, no external assets)
// with a module accent so the whole screen shifts colour as you swipe.
const SLIDES = [
  {
    id: '1',
    title: 'Learn Languages Offline',
    description:
      'Bilingual English phonics, vocabulary & beautiful Nastaliq script — perfect for Playgroup, Nursery & Class One.',
    accent: '#FB7185',
    gradient: ['#FB7185', '#F43F5E'],
    lottie: require('../../../assets/lottie/learn-languages.json'),
  },
  {
    id: '2',
    title: 'Solve Brain & IQ Games',
    description:
      'Memory pairs, logic patterns, rapid math races & odd-one-out puzzles curated to grow young, curious minds.',
    accent: '#60A5FA',
    gradient: ['#60A5FA', '#6366F1'],
    lottie: require('../../../assets/lottie/brain-games.json'),
  },
  {
    id: '3',
    title: 'Islamic Values & Stories',
    description:
      'Gentle manners with everyday Duas, the 6 Kalmas and audio moral stories — calm, beautiful & 100% offline.',
    accent: '#38BDF8',
    gradient: ['#38BDF8', '#4F46E5'],
    lottie: require('../../../assets/lottie/islamic.json'),
  },
  {
    id: '4',
    title: 'Writing & Tracing Practice',
    description:
      'Trace every letter & number with guided strokes and playful worksheets that build confident little hands.',
    accent: '#F59E0B',
    gradient: ['#FBBF24', '#F97316'],
    lottie: require('../../../assets/lottie/writing-tracing.json'),
  },
];

const LAST = SLIDES.length - 1;
const OFFSETS = SLIDES.map((_, i) => i * width);
const ACCENTS = SLIDES.map((s) => s.accent);

// ── A single floating decor orb (ambient premium motion) ────────
const Orb = ({ style, delay = 0, drift = 26, dur = 3200 }) => {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: dur, easing: Easing.inOut(Easing.quad) }), -1, true)
    );
  }, [t, delay, dur]);
  const aStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(t.value, [0, 1], [0, -drift]) },
      { scale: interpolate(t.value, [0, 1], [1, 1.12]) },
    ],
    opacity: interpolate(t.value, [0, 1], [0.5, 0.85]),
  }));
  return <Animated.View style={[style, aStyle]} pointerEvents="none" />;
};

// ── One onboarding slide (art parallax + text rise, scroll-linked) ──
const Slide = ({ item, index, scrollX }) => {
  const input = [(index - 1) * width, index * width, (index + 1) * width];

  const artStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, input, [0, 1, 0], Extrapolation.CLAMP),
    transform: [
      { perspective: 800 },
      { scale: interpolate(scrollX.value, input, [0.72, 1, 0.72], Extrapolation.CLAMP) },
      { translateX: interpolate(scrollX.value, input, [width * 0.18, 0, -width * 0.18], Extrapolation.CLAMP) },
    ],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, input, [0, 0.55, 0], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(scrollX.value, input, [0.6, 1, 0.6], Extrapolation.CLAMP) },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, input, [0, 1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollX.value, input, [46, 0, 46], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View style={styles.slide}>
      <View style={styles.artWrap}>
        <Animated.View style={[styles.halo, { backgroundColor: item.accent }, haloStyle]} pointerEvents="none" />
        <Animated.View style={[styles.artCard, coloredShadow(item.accent, 'xl'), artStyle]}>
          <LottieView source={item.lottie} autoPlay loop resizeMode="contain" style={styles.lottie} />
        </Animated.View>
      </View>

      <Animated.View style={[styles.textWrap, textStyle]}>
        <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>
          {item.title}
        </Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
};

// ── Scroll-linked pagination dot ────────────────────────────────
const Dot = ({ index, scrollX }) => {
  const input = [(index - 1) * width, index * width, (index + 1) * width];
  const aStyle = useAnimatedStyle(() => ({
    width: interpolate(scrollX.value, input, [8, 26, 8], Extrapolation.CLAMP),
    opacity: interpolate(scrollX.value, input, [0.35, 1, 0.35], Extrapolation.CLAMP),
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

  // Continuous accent tint behind everything (colour shifts as you swipe).
  const auraStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(scrollX.value, OFFSETS, ACCENTS),
  }));

  // Progress fill grows across the four slides.
  const fillStyle = useAnimatedStyle(() => ({
    width: interpolate(scrollX.value, [0, LAST * width], [TRACK_W / SLIDES.length, TRACK_W], Extrapolation.CLAMP),
    backgroundColor: interpolateColor(scrollX.value, OFFSETS, ACCENTS),
  }));

  // CTA press feedback.
  const press = useSharedValue(0);
  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(press.value, [0, 1], [1, 0.96]) }],
  }));

  const goToProfile = useCallback(async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    navigation.replace(ROUTES.AUTH.PROFILE);
  }, [navigation]);

  const handleNext = useCallback(() => {
    if (activeIndex < LAST) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      goToProfile();
    }
  }, [activeIndex, goToProfile]);

  const current = SLIDES[activeIndex];
  const isLast = activeIndex === LAST;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Base deep-indigo gradient + shifting accent aura */}
      <LinearGradient colors={gradients.splash} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.aura, auraStyle]} pointerEvents="none" />

      {/* Ambient floating orbs */}
      <Orb style={[styles.orb, { top: height * 0.14, left: -50, width: 150, height: 150, backgroundColor: 'rgba(255,255,255,0.06)' }]} delay={0} />
      <Orb style={[styles.orb, { top: height * 0.30, right: -40, width: 110, height: 110, backgroundColor: 'rgba(252,211,77,0.10)' }]} delay={600} drift={20} dur={3800} />
      <Orb style={[styles.orb, { bottom: height * 0.20, left: width * 0.16, width: 70, height: 70, backgroundColor: 'rgba(165,180,252,0.12)' }]} delay={1200} drift={16} dur={2800} />

      <Animated.View style={[styles.content, { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.xl }, enterStyle]}>
        {/* Header: step badge + Skip */}
        <View style={styles.header}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>{activeIndex + 1} / {SLIDES.length}</Text>
          </View>
          <Pressable onPress={goToProfile} hitSlop={10} style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.6 }]}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        {/* Progress track */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, fillStyle]} />
        </View>

        {/* Swipeable slides */}
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
            <Slide key={item.id} item={item} index={i} scrollX={scrollX} />
          ))}
        </Animated.ScrollView>

        {/* Footer: dots + CTA */}
        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <Dot key={i} index={i} scrollX={scrollX} />
            ))}
          </View>

          <Animated.View style={[styles.ctaWrap, ctaStyle]}>
            <Pressable
              onPress={handleNext}
              onPressIn={() => { press.value = withTiming(1, { duration: 90 }); }}
              onPressOut={() => { press.value = withTiming(0, { duration: 140 }); }}
              style={styles.ctaPress}
            >
              <LinearGradient
                colors={current.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.cta, coloredShadow(current.accent, 'lg')]}
              >
                <Text style={styles.ctaText}>{isLast ? "🚀  Let's Begin!" : 'Next  →'}</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.brandSurface },
  aura: {
    position: 'absolute',
    top: -height * 0.28,
    alignSelf: 'center',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    opacity: 0.18,
  },
  orb: { position: 'absolute', borderRadius: Radius.full },

  content: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  stepBadge: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: Radius.sm,
    paddingVertical: 5,
    paddingHorizontal: Spacing.md,
  },
  stepText: { ...textStyles.caption, fontFamily: 'Baloo2_800ExtraBold', color: 'rgba(255,255,255,0.9)' },
  skipBtn: { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: Radius.sm, paddingVertical: 5, paddingHorizontal: Spacing.lg },
  skipText: { ...textStyles.bodyStrong, fontSize: 13, color: 'rgba(255,255,255,0.92)' },

  progressTrack: {
    height: 6,
    width: TRACK_W,
    alignSelf: 'center',
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: { height: 6, borderRadius: 3 },

  scroller: { flex: 1 },
  slide: { width, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },

  artWrap: { width: ART, height: ART, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.huge },
  halo: {
    position: 'absolute',
    width: ART * 1.15,
    height: ART * 1.15,
    borderRadius: ART,
  },
  artCard: {
    width: ART,
    height: ART,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  lottie: { width: '90%', height: '90%' },

  textWrap: { alignItems: 'center', paddingHorizontal: Spacing.sm },
  title: { ...textStyles.h1, fontSize: 27, color: C.onBrand, textAlign: 'center', marginBottom: Spacing.md },
  description: { ...textStyles.body, color: 'rgba(255,255,255,0.78)', textAlign: 'center', lineHeight: 23 },

  footer: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  dots: { flexDirection: 'row', height: 10, justifyContent: 'center', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xl },
  dot: { height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },

  ctaWrap: { width: '100%' },
  ctaPress: { width: '100%', borderRadius: Radius.lg },
  cta: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { ...textStyles.button, fontSize: 17, color: '#FFFFFF' },
});

export default Onboarding;
