import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ROUTES } from '../../Constants';
import SpeechEngine from '../../Utils/speechEngine';
import { lightColors as C, gradients } from '../../Theme/colors';
import { Spacing, Radius, textStyles, coloredShadow, Motion } from '../../Theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Learn Languages Offline',
    description: 'Bilingual English phonics, vocabulary & beautiful Nastaliq script. Perfect for Playgroup, Nursery & Class One!',
    emoji: '🔤',
    accent: '#FB7185',
  },
  {
    id: '2',
    title: 'Solve Brain & IQ Games',
    description: 'Interactive memory pairs, logic patterns, rapid math races & odd-one-out puzzles curated for young minds.',
    emoji: '🧠',
    accent: '#60A5FA',
  },
  {
    id: '3',
    title: 'Islamic Values & Stories',
    description: 'Discover beautiful manners with everyday Arabic Duas, 6 Kalmas, and audio moral stories — all 100% offline!',
    emoji: '🕌',
    accent: '#34D399',
  },
];

const PaginationDot = ({ active, color }) => (
  <View style={[styles.dot, { width: active ? 24 : 8, opacity: active ? 1 : 0.35, backgroundColor: active ? color : C.onBrandMuted }]} />
);

const Onboarding = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef(null);

  useEffect(() => {
    SpeechEngine.stop();
    return () => SpeechEngine.stop();
  }, []);

  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Motion.easing.inOut, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Motion.easing.inOut, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, { toValue: (activeIndex + 1) / SLIDES.length, duration: 320, easing: Motion.easing.out, useNativeDriver: false }).start();
  }, [activeIndex, progress]);
  const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  const onScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== activeIndex && index >= 0 && index < SLIDES.length) setActiveIndex(index);
  };

  const goToProfile = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    navigation.replace(ROUTES.AUTH.PROFILE);
  };

  const handleNext = async () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      await goToProfile();
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <View style={[styles.decorCircle1, { backgroundColor: item.accent + '1A' }]} />
      <View style={[styles.decorCircle2, { backgroundColor: item.accent + '12' }]} />
      <View style={styles.contentContainer}>
        <Animated.View
          style={[styles.emojiContainer, coloredShadow(item.accent, 'lg'), { backgroundColor: C.brandSurfaceAlt, borderColor: item.accent + '70', transform: [{ scale: pulseScale }] }]}
        >
          <Text style={styles.emoji}>{item.emoji}</Text>
        </Animated.View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const current = SLIDES[activeIndex];

  return (
    <LinearGradient colors={gradients.splash} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.brandSurface} />

      <View style={styles.header}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepText}>{activeIndex + 1} / {SLIDES.length}</Text>
        </View>
        <TouchableOpacity style={styles.skipBtn} onPress={goToProfile} hitSlop={8}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressTrack}>
        <View style={styles.progressTrackInner}>
          <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: current.accent }]} />
        </View>
      </View>

      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={renderItem}
      />

      <View style={styles.footer}>
        <View style={styles.paginationContainer}>
          {SLIDES.map((_, i) => (
            <PaginationDot key={i} active={i === activeIndex} color={current.accent} />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, coloredShadow(current.accent, 'md'), { backgroundColor: current.accent }]}
          onPress={handleNext}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>
            {activeIndex === SLIDES.length - 1 ? "🚀  Let's Begin!" : 'Next  →'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 50,
    paddingBottom: Spacing.md,
  },
  stepBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.sm, paddingVertical: 5, paddingHorizontal: Spacing.md },
  stepText: { ...textStyles.caption, fontFamily: 'Baloo2_800ExtraBold', color: 'rgba(255,255,255,0.85)' },
  skipBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.sm, paddingVertical: 5, paddingHorizontal: Spacing.lg },
  skipText: { ...textStyles.bodyStrong, fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  progressTrack: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm },
  progressTrackInner: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },

  slide: { width, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xl, overflow: 'hidden' },
  decorCircle1: { position: 'absolute', top: -60, left: -60, width: 220, height: 220, borderRadius: 110 },
  decorCircle2: { position: 'absolute', bottom: -80, right: -80, width: 280, height: 280, borderRadius: 140 },
  contentContainer: { alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  emojiContainer: {
    width: 150,
    height: 150,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    borderWidth: 3,
  },
  emoji: { fontSize: 72 },
  title: { ...textStyles.h1, fontSize: 28, color: C.onBrand, textAlign: 'center', marginBottom: Spacing.md },
  description: { ...textStyles.body, color: 'rgba(255,255,255,0.78)', textAlign: 'center', paddingHorizontal: Spacing.sm },

  footer: { paddingHorizontal: Spacing.xl, paddingBottom: 44, alignItems: 'center' },
  paginationContainer: { flexDirection: 'row', height: 20, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xxl, gap: Spacing.xs },
  dot: { height: 8, borderRadius: 4 },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { ...textStyles.button, fontSize: 17, color: C.brandSurface },
});

export default Onboarding;
