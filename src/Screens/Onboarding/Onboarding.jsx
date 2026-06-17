import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../Data/colorsTheme';
import { ROUTES } from '../../Constants';
import SpeechEngine from '../../Utils/speechEngine';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Learn Languages Offline',
    description: 'Bilingual English phonics vocabulary & beautiful Nastaliq script. Perfect for Playgroup, Nursery & Class One!',
    emoji: '🔤',
    color: '#F85A9B',
    bgColor: '#1E1B4B',
    cardColor: '#312E81',
  },
  {
    id: '2',
    title: 'Solve Brain & IQ Games',
    description: 'Interactive memory pairs, logic patterns, rapid math races & odd one out puzzles curated carefully for young minds.',
    emoji: '🧠',
    color: '#60A5FA',
    bgColor: '#1E1B4B',
    cardColor: '#312E81',
  },
  {
    id: '3',
    title: 'Islamic Values & Stories',
    description: 'Discover beautiful manners with everyday Arabic Duas, 6 Kalmas, and audio moral stories — all 100% offline!',
    emoji: '🕌',
    color: '#34D399',
    bgColor: '#1E1B4B',
    cardColor: '#312E81',
  }
];

const PaginationDot = ({ active, color }) => {
  return (
    <View 
      style={[
        styles.dot, 
        { 
          width: active ? 24 : 8, 
          opacity: active ? 1 : 0.3,
          backgroundColor: active ? color : '#7A8B9E' 
        }
      ]} 
    />
  );
};

const Onboarding = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef(null);

  const onScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== activeIndex && index >= 0 && index < SLIDES.length) {
      setActiveIndex(index);
    }
  };

  const handleNext = async () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      await AsyncStorage.setItem('onboarding_complete', 'true');
      navigation.replace(ROUTES.AUTH.SIGNUP);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    navigation.replace(ROUTES.AUTH.SIGNUP);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.bgColor }]}>
        {/* Decorative circles */}
        <View style={[styles.decorCircle1, { backgroundColor: item.color + '18' }]} />
        <View style={[styles.decorCircle2, { backgroundColor: item.color + '10' }]} />
        <View style={styles.contentContainer}>
          <View style={[styles.emojiContainer, { backgroundColor: item.cardColor, borderColor: item.color + '60' }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
          </View>
          <Text style={[styles.title, { color: '#FFFFFF' }]}>{item.title}</Text>
          <Text style={[styles.description, { color: 'rgba(255,255,255,0.75)' }]}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const currentSlide = SLIDES[activeIndex];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={currentSlide.bgColor} />

      <View style={[styles.header, { backgroundColor: currentSlide.bgColor }]}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepText}>{activeIndex + 1} / 3</Text>
        </View>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
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

      <View style={[styles.footer, { backgroundColor: currentSlide.bgColor }]}>
        <View style={styles.paginationContainer}>
          {SLIDES.map((_, i) => (
            <PaginationDot key={i} active={i === activeIndex} color={currentSlide.color} />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentSlide.color }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {activeIndex === SLIDES.length - 1 ? "🚀  Let's Begin!" : "Next  →"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 12,
  },
  stepBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
  },
  skipBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 14,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  emojiContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    borderWidth: 3,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  emoji: {
    fontSize: 72,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 23,
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 44,
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 4,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});

export default Onboarding;
