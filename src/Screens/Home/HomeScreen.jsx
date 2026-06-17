import React, { useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Colors } from '../../Data/colorsTheme';
import { Header } from '../../Components/UI';
import { useAuth } from '../../Context';

const { width } = Dimensions.get('window');

const MODULES = [
  {
    id: 1,
    name: 'English ABC',
    icon: '🔤',
    description: '26 Letters • 130 Words',
    gradStart: '#FF6B9D',
    gradEnd: '#FF8A65',
    screen: 'Alphabet',
    badge: 'LEARN',
  },
  {
    id: 2,
    name: 'Urdu Haroof',
    icon: 'اب',
    description: '34 Sound Cards',
    gradStart: '#7C3AED',
    gradEnd: '#A855F7',
    screen: 'Urdu',
    badge: 'اردو',
  },
  {
    id: 3,
    name: 'Numbers 1–100',
    icon: '🔢',
    description: 'Count & Shapes',
    gradStart: '#059669',
    gradEnd: '#34D399',
    screen: 'Numbers',
    badge: '123',
  },
  {
    id: 4,
    name: 'Islamic Studies',
    icon: '🕌',
    description: 'Duas • 99 Names • Salah',
    gradStart: '#0EA5E9',
    gradEnd: '#6366F1',
    screen: 'Islamic',
    badge: 'DEEN',
  },
  {
    id: 5,
    name: 'My Pakistan',
    icon: '🇵🇰',
    description: 'Symbols • Provinces • Heroes',
    gradStart: '#059669',
    gradEnd: '#10B981',
    screen: 'Pakistan',
    badge: 'GK',
  },
  {
    id: 6,
    name: 'My World',
    icon: '🌍',
    description: 'Animals • Birds • Fruits • Veggies',
    gradStart: '#0EA5E9',
    gradEnd: '#38BDF8',
    screen: 'Learn',
    params: { moduleKey: 'world' },
    badge: 'GK',
  },
  {
    id: 7,
    name: 'Good Habits',
    icon: '🌟',
    description: 'Manners • Cleanliness • Safety',
    gradStart: '#F59E0B',
    gradEnd: '#FBBF24',
    screen: 'Learn',
    params: { moduleKey: 'habits' },
    badge: 'LIFE',
  },
];

// Direct shortcuts into the "My World" categories so kids can jump
// straight to a topic from Home. Each opens LearnScreen on that tab.
const WORLD_CATEGORIES = [
  { key: 'animals', name: 'Animals', icon: '🦁', count: 26, color: '#F59E0B' },
  { key: 'birds', name: 'Birds', icon: '🦜', count: 20, color: '#16A34A' },
  { key: 'fruits', name: 'Fruits', icon: '🍎', count: 20, color: '#EF4444' },
  { key: 'veggies', name: 'Vegetables', icon: '🥕', count: 20, color: '#F97316' },
  { key: 'vehicles', name: 'Vehicles', icon: '🚗', count: 21, color: '#3B82F6' },
  { key: 'body', name: 'My Body', icon: '🧠', count: 20, color: '#EC4899' },
  { key: 'colors', name: 'Colors', icon: '🎨', count: 20, color: '#8B5CF6' },
];

const QUICK_ACTIONS = [
  {
    name: 'Stories',
    icon: '📚',
    gradStart: '#F59E0B',
    gradEnd: '#EF4444',
    screen: 'Stories',
  },
  {
    name: 'IQ Games',
    icon: '🧠',
    gradStart: '#3B82F6',
    gradEnd: '#8B5CF6',
    screen: 'Games',
  },
];

const ModuleCard = ({ module, onPress, delay }) => {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handlePressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.moduleCardWrapper, { opacity, transform: [{ scale }] }]}>
      <TouchableOpacity
        style={[styles.moduleCard, { backgroundColor: module.gradStart }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Gradient layer effect */}
        <View style={[styles.gradientOverlay, { backgroundColor: module.gradEnd + '60' }]} />
        
        <View style={styles.moduleBadge}>
          <Text style={styles.moduleBadgeText}>{module.badge}</Text>
        </View>
        
        <Text style={styles.moduleIcon}>{module.icon}</Text>
        
        <View style={styles.moduleInfo}>
          <Text style={styles.moduleName}>{module.name}</Text>
          <Text style={styles.moduleDescription}>{module.description}</Text>
        </View>
        
        <View style={styles.moduleArrow}>
          <Text style={styles.moduleArrowText}>→</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const HomeScreen = ({ navigation }) => {
  const { user, stars } = useAuth();
  const userProfile = user || { name: 'Superstar', avatar: '🦁' };

  const heroScale = useRef(new Animated.Value(0.95)).current;
  useEffect(() => {
    Animated.spring(heroScale, { toValue: 1, useNativeDriver: true, tension: 80 }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title="Little Genius"
        avatar={userProfile.avatar}
        stars={stars}
        useLogo
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Welcome Card */}
        <Animated.View style={[styles.heroCard, { transform: [{ scale: heroScale }] }]}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroGreeting}>Assalam-o-Alaikum!</Text>
            <Text style={styles.heroName}>{userProfile.name} 🎓</Text>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>PG • Nursery • Class 1</Text>
            </View>
          </View>
          <View style={styles.heroRight}>
            <View style={styles.heroAvatarCircle}>
              <Text style={styles.heroAvatar}>{userProfile.avatar}</Text>
            </View>
            <View style={styles.starsRow}>
              <Text style={styles.starEmoji}>⭐</Text>
              <Text style={styles.starsText}>{stars || 0}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Learning Modules Section */}
        <Text style={styles.sectionTitle}>📖 Learning Modules</Text>
        <View style={styles.modulesGrid}>
          {MODULES.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              delay={index * 80}
              onPress={() => navigation.navigate(module.screen, module.params)}
            />
          ))}
        </View>

        {/* Explore My World — quick category shortcuts */}
        <Text style={styles.sectionTitle}>🌍 Explore My World</Text>
        <View style={styles.catGrid}>
          {WORLD_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={styles.catCard}
              onPress={() =>
                navigation.navigate('Learn', { moduleKey: 'world', initialTab: cat.key })
              }
              activeOpacity={0.85}
            >
              <View style={[styles.catIconCircle, { backgroundColor: cat.color + '22' }]}>
                <Text style={styles.catIcon}>{cat.icon}</Text>
              </View>
              <Text style={styles.catName} numberOfLines={1}>{cat.name}</Text>
              <View style={[styles.catCountPill, { backgroundColor: cat.color }]}>
                <Text style={styles.catCountText}>{cat.count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>⚡ Quick Play</Text>
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.name}
              style={[styles.quickCard, { backgroundColor: action.gradStart }]}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.88}
            >
              <View style={[styles.quickOverlay, { backgroundColor: action.gradEnd + '55' }]} />
              <Text style={styles.quickIcon}>{action.icon}</Text>
              <Text style={styles.quickLabel}>{action.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F0FF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 100,
  },

  // Hero card
  heroCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 28,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  heroLeft: {
    flex: 1,
  },
  heroGreeting: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A5B4FC',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  heroBadge: {
    backgroundColor: '#4338CA',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C7D2FE',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroRight: {
    alignItems: 'center',
    marginLeft: 16,
  },
  heroAvatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4338CA',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroAvatar: {
    fontSize: 36,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#312E81',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  starEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  starsText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FCD34D',
  },

  // Section titles
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1E1B4B',
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  // Module cards grid
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  moduleCardWrapper: {
    width: (width - 44) / 2,
  },
  moduleCard: {
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 14,
    minHeight: 170,
    justifyContent: 'space-between',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    transform: [{ translateX: 30 }, { translateY: 30 }],
  },
  moduleBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  moduleBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  moduleIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  moduleInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  moduleName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  moduleDescription: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  moduleArrow: {
    position: 'absolute',
    bottom: 16,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleArrowText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // Explore My World category cards (3-column grid)
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  catCard: {
    width: (width - 52) / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(30,27,75,0.08)',
  },
  catIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  catIcon: {
    fontSize: 28,
  },
  catName: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1E1B4B',
    letterSpacing: -0.2,
    marginBottom: 6,
    textAlign: 'center',
  },
  catCountPill: {
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  catCountText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // Quick actions
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  quickOverlay: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  quickIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default HomeScreen;
