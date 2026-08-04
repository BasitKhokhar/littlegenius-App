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
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Header } from '../../Components/UI';
import { SectionHeader, Badge, TopicCard } from '../../Components/Common';
import { useAuth } from '../../Context';
import { useThemeColors } from '../../Context/ThemeContext';
import { useTabBarClearance } from '../../Hooks';
import {
  Spacing,
  Radius,
  textStyles,
  coloredShadow,
  Motion,
  moduleColors,
} from '../../Theme';

const { width } = Dimensions.get('window');

// Shared glossy top-highlight, reused (at different heights) on the hero,
// module and quick-play gradient cards — same idiom as PremiumTabBar's
// circleSheen, just white since these cards already sit on saturated colour.
const SHEEN_COLORS = ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0)'];

const tap = () => Haptics.selectionAsync().catch(() => {});

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

// Explore My World is always 3 up. Rows are built explicitly instead of
// letting flexWrap decide: a computed 1/3 width is fractional, and on some
// densities each card rounds up just enough that the third one wraps and
// leaves a dead column on the right.
const CAT_COLUMNS = 3;

const chunk = (arr, size) => {
  const rows = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
};

const QUICK_ACTIONS = [
  { name: 'Stories', icon: '📚', mod: 'stories', screen: 'Stories' },
  { name: 'IQ Games', icon: '🧠', mod: 'games', screen: 'Games' },
];

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
};

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
          <LinearGradient colors={SHEEN_COLORS} pointerEvents="none" style={styles.moduleSheen} />
          <View style={styles.moduleTopRow}>
            <Badge label={module.badge} tone="glass" style={styles.glassBorder} />
          </View>
          <View style={styles.moduleIconBadge}>
            <Text style={styles.moduleIcon}>{module.icon}</Text>
          </View>
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleName}>{module.name}</Text>
            <Text style={styles.moduleDescription}>{module.description}</Text>
          </View>
          <View style={styles.moduleArrow}>
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const HomeScreen = ({ navigation }) => {
  const { user, stars } = useAuth();
  const colors = useThemeColors();
  const bottomPad = useTabBarClearance();
  const userProfile = user || { name: 'Superstar', avatar: '🦁' };

  const heroScale = useRef(new Animated.Value(0.96)).current;
  useEffect(() => {
    Animated.spring(heroScale, { toValue: 1, useNativeDriver: true, ...Motion.spring.gentle }).start();
  }, []);

  const s = makeStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header title="Little Genius" avatar={userProfile.avatar} stars={stars} useLogo />

      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}>
        {/* Hero Welcome Card */}
        <Animated.View style={{ transform: [{ scale: heroScale }] }}>
          <LinearGradient
            colors={colors.gradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroCard, coloredShadow(colors.brandSurface, 'xl')]}
          >
            <View style={styles.heroBlobTopRight} pointerEvents="none" />
            <View style={styles.heroBlobBottomLeft} pointerEvents="none" />
            <LinearGradient
              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
              pointerEvents="none"
              style={styles.heroSheen}
            />
            <View style={styles.heroLeft}>
              <Text style={s.heroGreeting}>{getTimeGreeting()}, 👋</Text>
              <Text style={styles.heroName}>{userProfile.name} 🎓</Text>
              <Badge label="PG • Nursery • Class 1" tone="glass" style={[styles.heroBadge, styles.glassBorder]} />
            </View>
            <View style={styles.heroRight}>
              <View style={styles.heroAvatarRing}>
                <View style={styles.heroAvatarCircle}>
                  <Text style={styles.heroAvatar}>{userProfile.avatar}</Text>
                </View>
              </View>
              <Badge label={String(stars || 0)} icon="⭐" tone="glass" style={styles.glassBorder} />
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
              onPress={() => { tap(); navigation.navigate(module.screen, module.params); }}
            />
          ))}
        </View>

        {/* Explore My World */}
        <SectionHeader
          emoji="🌍"
          title="Explore My World"
          actionLabel="See all"
          onActionPress={() => navigation.navigate('Learn', { moduleKey: 'world' })}
        />
        <View style={styles.catGrid}>
          {chunk(WORLD_CATEGORIES, CAT_COLUMNS).map((row, rowIndex) => (
            <View key={`cat-row-${rowIndex}`} style={styles.catRow}>
              {row.map((cat, i) => (
                <TopicCard
                  key={cat.key}
                  variant="tile"
                  index={rowIndex * CAT_COLUMNS + i}
                  style={styles.catCell}
                  emoji={cat.icon}
                  color={cat.color}
                  title={cat.name}
                  badge={cat.count}
                  onPress={() => { tap(); navigation.navigate('Learn', { moduleKey: 'world', initialTab: cat.key }); }}
                />
              ))}
              {/* Keep a short last row left-aligned at the same column width */}
              {Array.from({ length: CAT_COLUMNS - row.length }, (_, i) => (
                <View key={`cat-spacer-${i}`} style={styles.catCell} />
              ))}
            </View>
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
                onPress={() => { tap(); navigation.navigate(action.screen); }}
                activeOpacity={0.9}
              >
                <LinearGradient colors={[m.from, m.to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quickCard}>
                  <LinearGradient colors={SHEEN_COLORS} pointerEvents="none" style={styles.quickSheen} />
                  <View style={styles.quickIconBadge}>
                    <Text style={styles.quickIcon}>{action.icon}</Text>
                  </View>
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
  });

// Static styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: Spacing.md },

  // Shared hairline rim for glass badges on brand-coloured surfaces
  glassBorder: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },

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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  heroBlobTopRight: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroBlobBottomLeft: {
    position: 'absolute',
    bottom: -40,
    left: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(252,211,77,0.10)',
  },
  heroSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%' },
  heroLeft: { flex: 1 },
  heroName: { ...textStyles.h1, color: '#FFFFFF', marginBottom: Spacing.md },
  heroBadge: { alignSelf: 'flex-start' },
  heroRight: { alignItems: 'center', marginLeft: Spacing.lg, gap: Spacing.sm },
  heroAvatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(252,211,77,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    minHeight: 178,
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  moduleSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '42%' },
  moduleTopRow: { flexDirection: 'row' },
  moduleIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  moduleIcon: { fontSize: 30, lineHeight: 36, textAlign: 'center' },
  moduleInfo: { marginTop: Spacing.sm },
  moduleName: { ...textStyles.title, color: '#FFFFFF', marginBottom: 2 },
  moduleDescription: { ...textStyles.caption, color: 'rgba(255,255,255,0.85)' },
  moduleArrow: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Category grid — 3 up on every screen size. TopicCard owns the tile's
  // look; the screen only owns the columns. Cells flex instead of carrying a
  // computed pixel width so the row always divides the available space
  // exactly, whatever the device width or orientation.
  catGrid: { gap: Spacing.md, marginBottom: Spacing.xxl },
  catRow: { flexDirection: 'row', gap: Spacing.md },
  catCell: { flex: 1 },

  // Quick play
  quickActions: { flexDirection: 'row', gap: 12 },
  quickWrap: { flex: 1, borderRadius: Radius.lg },
  quickCard: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  quickSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '45%' },
  quickIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickIcon: { fontSize: 26, lineHeight: 32, textAlign: 'center' },
  quickLabel: { ...textStyles.overline, color: '#FFFFFF', fontSize: 12 },
});

export default HomeScreen;
