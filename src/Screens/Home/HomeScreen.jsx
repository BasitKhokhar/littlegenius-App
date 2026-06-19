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
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../Components/UI';
import { SectionHeader, Badge } from '../../Components/Common';
import { useAuth } from '../../Context';
import { useThemeColors } from '../../Context/ThemeContext';
import {
  Spacing,
  Radius,
  textStyles,
  Typography,
  Elevation,
  coloredShadow,
  Motion,
  moduleColors,
} from '../../Theme';

const { width } = Dimensions.get('window');

const MODULES = [
  { id: 1, name: 'English ABC', icon: '🔤', description: '26 Letters • 130 Words', mod: 'alphabet', screen: 'Alphabet', badge: 'LEARN' },
  { id: 2, name: 'Urdu Haroof', icon: 'اب', description: '34 Sound Cards', mod: 'urdu', screen: 'Urdu', badge: 'اردو' },
  { id: 3, name: 'Numbers 1–100', icon: '🔢', description: 'Count & Shapes', mod: 'numbers', screen: 'Numbers', badge: '123' },
  { id: 4, name: 'Islamic Studies', icon: '🕌', description: 'Duas • 99 Names • Salah', mod: 'islamic', screen: 'Islamic', badge: 'DEEN' },
  { id: 5, name: 'My Pakistan', icon: '🇵🇰', description: 'Symbols • Provinces • Heroes', mod: 'pakistan', screen: 'Pakistan', badge: 'GK' },
  { id: 6, name: 'My World', icon: '🌍', description: 'Animals • Birds • Fruits', mod: 'world', screen: 'Learn', params: { moduleKey: 'world' }, badge: 'GK' },
  { id: 7, name: 'Good Habits', icon: '🌟', description: 'Manners • Cleanliness • Safety', mod: 'habits', screen: 'Learn', params: { moduleKey: 'habits' }, badge: 'LIFE' },
];

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
  { name: 'Stories', icon: '📚', mod: 'stories', screen: 'Stories' },
  { name: 'IQ Games', icon: '🧠', mod: 'games', screen: 'Games' },
];

const ModuleCard = ({ module, onPress, delay }) => {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;
  const m = moduleColors[module.mod];

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, ...Motion.spring.soft }),
        Animated.timing(opacity, { toValue: 1, ...Motion.timing.base, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.moduleCardWrapper, { opacity, transform: [{ scale }, { scale: press }] }]}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        onPressIn={() => Animated.spring(press, { toValue: Motion.pressScale, useNativeDriver: true, ...Motion.spring.soft }).start()}
        onPressOut={() => Animated.spring(press, { toValue: 1, useNativeDriver: true, ...Motion.spring.soft }).start()}
        style={coloredShadow(m.solid, 'md')}
      >
        <LinearGradient colors={[m.from, m.to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.moduleCard}>
          <View style={styles.moduleTopRow}>
            <Badge label={module.badge} tone="glass" />
          </View>
          <Text style={styles.moduleIcon}>{module.icon}</Text>
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleName}>{module.name}</Text>
            <Text style={styles.moduleDescription}>{module.description}</Text>
          </View>
          <View style={styles.moduleArrow}>
            <Text style={styles.moduleArrowText}>→</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const HomeScreen = ({ navigation }) => {
  const { user, stars } = useAuth();
  const colors = useThemeColors();
  const userProfile = user || { name: 'Superstar', avatar: '🦁' };

  const heroScale = useRef(new Animated.Value(0.96)).current;
  useEffect(() => {
    Animated.spring(heroScale, { toValue: 1, useNativeDriver: true, ...Motion.spring.gentle }).start();
  }, []);

  const s = makeStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header title="Little Genius" avatar={userProfile.avatar} stars={stars} useLogo />

      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Welcome Card */}
        <Animated.View style={{ transform: [{ scale: heroScale }] }}>
          <LinearGradient
            colors={colors.gradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroCard, coloredShadow(colors.brandSurface, 'lg')]}
          >
            <View style={styles.heroLeft}>
              <Text style={s.heroGreeting}>ASSALAM-O-ALAIKUM!</Text>
              <Text style={styles.heroName}>{userProfile.name} 🎓</Text>
              <Badge label="PG • Nursery • Class 1" tone="glass" style={styles.heroBadge} />
            </View>
            <View style={styles.heroRight}>
              <View style={styles.heroAvatarCircle}>
                <Text style={styles.heroAvatar}>{userProfile.avatar}</Text>
              </View>
              <Badge label={String(stars || 0)} icon="⭐" tone="glass" />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Learning Modules */}
        <SectionHeader emoji="📖" title="Learning Modules" />
        <View style={styles.modulesGrid}>
          {MODULES.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              delay={index * Motion.stagger}
              onPress={() => navigation.navigate(module.screen, module.params)}
            />
          ))}
        </View>

        {/* Explore My World */}
        <SectionHeader emoji="🌍" title="Explore My World" />
        <View style={styles.catGrid}>
          {WORLD_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[s.catCard, Elevation.sm]}
              onPress={() => navigation.navigate('Learn', { moduleKey: 'world', initialTab: cat.key })}
              activeOpacity={0.85}
            >
              <View style={[styles.catIconCircle, { backgroundColor: cat.color + '22' }]}>
                <Text style={styles.catIcon}>{cat.icon}</Text>
              </View>
              <Text style={s.catName} numberOfLines={1}>{cat.name}</Text>
              <View style={[styles.catCountPill, { backgroundColor: cat.color }]}>
                <Text style={styles.catCountText}>{cat.count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Play */}
        <SectionHeader emoji="⚡" title="Quick Play" />
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => {
            const m = moduleColors[action.mod];
            return (
              <TouchableOpacity
                key={action.name}
                style={[styles.quickWrap, coloredShadow(m.solid, 'md')]}
                onPress={() => navigation.navigate(action.screen)}
                activeOpacity={0.9}
              >
                <LinearGradient colors={[m.from, m.to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quickCard}>
                  <Text style={styles.quickIcon}>{action.icon}</Text>
                  <Text style={styles.quickLabel}>{action.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

// Theme-dependent styles
const makeStyles = (colors) =>
  StyleSheet.create({
    heroGreeting: { ...textStyles.overline, color: colors.onBrandMuted, marginBottom: Spacing.xs },
    catCard: {
      width: (width - 32 - Spacing.sm * 2) / 3,
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.sm,
      alignItems: 'center',
    },
    catName: { ...textStyles.caption, fontFamily: Typography.font.bold, color: colors.textPrimary, marginBottom: Spacing.sm, textAlign: 'center' },
  });

// Static styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: Spacing.md, paddingBottom: 100 },

  // Hero
  heroCard: {
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  heroLeft: { flex: 1 },
  heroName: { ...textStyles.h1, color: '#FFFFFF', marginBottom: Spacing.md },
  heroBadge: { alignSelf: 'flex-start' },
  heroRight: { alignItems: 'center', marginLeft: Spacing.lg, gap: Spacing.sm },
  heroAvatarCircle: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatar: { fontSize: 36 },

  // Module grid
  modulesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing.xxl },
  moduleCardWrapper: { width: (width - 32 - 12) / 2 },
  moduleCard: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    minHeight: 168,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  moduleTopRow: { flexDirection: 'row' },
  moduleIcon: { fontSize: 38, marginTop: Spacing.sm },
  moduleInfo: { marginTop: Spacing.sm },
  moduleName: { ...textStyles.title, color: '#FFFFFF', marginBottom: 2 },
  moduleDescription: { ...textStyles.caption, color: 'rgba(255,255,255,0.85)' },
  moduleArrow: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleArrowText: { fontSize: 15, color: '#FFFFFF', fontFamily: 'Baloo2_800ExtraBold' },

  // Category grid
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xxl },
  catIconCircle: { width: 52, height: 52, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  catIcon: { fontSize: 28 },
  catCountPill: { borderRadius: Radius.full, paddingVertical: 2, paddingHorizontal: Spacing.md },
  catCountText: { fontSize: 11, color: '#FFFFFF', fontFamily: 'Baloo2_800ExtraBold' },

  // Quick play
  quickActions: { flexDirection: 'row', gap: 12, marginBottom: Spacing.lg },
  quickWrap: { flex: 1, borderRadius: Radius.lg },
  quickCard: { borderRadius: Radius.lg, paddingVertical: Spacing.xl, alignItems: 'center', overflow: 'hidden' },
  quickIcon: { fontSize: 28, marginBottom: Spacing.sm },
  quickLabel: { ...textStyles.overline, color: '#FFFFFF', fontSize: 12 },
});

export default HomeScreen;
