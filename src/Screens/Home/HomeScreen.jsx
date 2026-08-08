import React, { useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Header } from '../../Components/UI';
import { SectionHeader, Badge, TopicCard } from '../../Components/Common';
import { ColoringPreview } from '../../Components/Games';
import { gamesList } from '../../Data/gamesData';
import { MODULES } from '../../Data/modulesData';
import { useAuth, useProgress } from '../../Context';
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

// Learning-module card — fixed width for the horizontal scroll row.
const MODULE_CARD_WIDTH = 158;
// Quick-play card — fixed width for its horizontal slider.
const QUICK_CARD_WIDTH = 300;
// Streak card floats half-over the hero card's bottom edge, half below it.
const STREAK_CARD_OVERLAP = 34;

// Shared glossy top-highlight, reused on the hero and quick-play gradient
// cards — same idiom as PremiumTabBar's circleSheen, just white since
// these cards sit on saturated colour (module cards are tinted-light now).
const SHEEN_COLORS = ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0)'];

const tap = () => Haptics.selectionAsync().catch(() => {});

// A streak day target is a display goal, not persisted user data — it stays
// a local UI constant. Real streak count comes from ProgressContext.
const STREAK_GOAL = 7;

const WORLD_CATEGORIES = [
  { key: 'animals', name: 'Animals', icon: '🦁', count: 26, color: '#F59E0B' },
  { key: 'birds', name: 'Birds', icon: '🦜', count: 20, color: '#16A34A' },
  { key: 'fruits', name: 'Fruits', icon: '🍎', count: 20, color: '#EF4444' },
  { key: 'veggies', name: 'Vegetables', icon: '🥕', count: 20, color: '#F97316' },
  { key: 'vehicles', name: 'Vehicles', icon: '🚗', count: 21, color: '#3B82F6' },
  { key: 'body', name: 'My Body', icon: '🧠', count: 20, color: '#EC4899' },
  { key: 'colors', name: 'Colors', icon: '🎨', count: 20, color: '#8B5CF6' },
];

// Quick Play surfaces four of the most kid-friendly activity games straight
// from the real games catalog (not a hand-duplicated list), so the copy,
// icon and route stay in sync with the Games screen automatically. Coloring
// Book leads as the "featured" card — same treatment as GamesScreen's
// showcase — with the real pre-coloured T-Rex art instead of a flat emoji,
// so a pre-reading child recognises it as a picture to tap, not just a tile.
const QUICK_ACTIONS = ['ColoringBook', 'DrawingBoard', 'TracingWorksheet', 'LetterPuzzle']
  .map((route) => gamesList.find((g) => g.route === route))
  .filter(Boolean);
const FEATURED_QUICK_ROUTE = 'ColoringBook';

// Learning-module tile — a soft tint of the module's own accent colour
// (icon badge, tag, chevron) on a near-white card, the same "premium
// pastel" idiom TopicCard's tile variant already uses for Explore My
// World. Replaces the old fully-saturated gradient block, which read as
// a single loud colour (red for English ABC) rather than in-theme.
const ModuleCard = ({ module, onPress, delay }) => {
  const colors = useThemeColors();
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;
  const m = moduleColors[module.mod];
  const accent = m.solid;
  const s = makeModuleStyles(colors, accent);

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
        style={coloredShadow(accent, 'md')}
      >
        <LinearGradient colors={[accent + '2A', accent + '0A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.moduleCard}>
          <View style={[styles.moduleBlobDecor, { backgroundColor: accent + '16' }]} pointerEvents="none" />

          <View style={styles.moduleTopRow}>
            <Badge label={module.badge} tone="solid" color={accent + '1C'} textColor={accent} />
            <View style={s.moduleArrow}>
              <Ionicons name="chevron-forward" size={14} color={accent} />
            </View>
          </View>
          <LinearGradient colors={[accent + '3D', accent + '1A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.moduleIconBadge}>
            <Text style={styles.moduleIcon}>{module.icon}</Text>
          </LinearGradient>
          <View style={styles.moduleInfo}>
            <Text style={s.moduleName}>{module.name}</Text>
            <Text style={s.moduleDescription}>{module.description}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Quick Play card — Games screen's "Featured Activity" showcase layout,
// shrunk to slider width: a large square preview on the left (a big emoji
// badge, or for the featured card the real pre-coloured T-Rex art — the
// target player can't yet read the tag text, so the picture is the primary
// "what kind of game is this" signal), with tag/title/description/Play Now
// all stacked in a column to its right.
const QuickPlayCard = ({ action, isFeatured, onPress, delay }) => {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;

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
    <Animated.View style={[styles.quickCardWrapper, { opacity, transform: [{ scale }, { scale: press }] }]}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        onPressIn={() => Animated.spring(press, { toValue: Motion.pressScale, useNativeDriver: true, ...Motion.spring.soft }).start()}
        onPressOut={() => Animated.spring(press, { toValue: 1, useNativeDriver: true, ...Motion.spring.soft }).start()}
        style={coloredShadow(action.gradEnd, 'md')}
      >
        <LinearGradient colors={[action.gradStart, action.gradEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quickCard}>
          <LinearGradient colors={SHEEN_COLORS} pointerEvents="none" style={styles.quickSheen} />
          <View style={styles.quickBlobDecor} pointerEvents="none" />

          <View style={[styles.quickPreviewBox, isFeatured && styles.quickPreviewBoxFeatured]}>
            {isFeatured ? (
              <ColoringPreview size={62} />
            ) : (
              <Text style={styles.quickEmoji}>{action.icon}</Text>
            )}
          </View>

          <View style={styles.quickBody}>
            <Badge
              label={isFeatured ? '⭐ FEATURED' : action.tag}
              tone="glass"
              style={styles.quickTag}
            />
            <Text style={styles.quickCardTitle} numberOfLines={1}>{action.name}</Text>
            <Text style={styles.quickDesc} numberOfLines={2}>{action.desc}</Text>
            <View style={styles.quickPlayPill}>
              <Ionicons name="play" size={11} color="#1E1B4B" />
              <Text style={styles.quickPlayPillText}>Play Now</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Plain track+fill progress bar — same idiom as Onboarding.jsx's
// progressTrack/progressFill (no gradient, just a themed solid fill).
// Shared by the hero's streak card and the Continue Learning card.
const ProgressBar = ({ value, max, trackColor, fillColor }) => {
  const colors = useThemeColors();
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <View style={[progressStyles.track, { backgroundColor: trackColor || colors.surfaceSunken }]}>
      <View style={[progressStyles.fill, { width: `${pct}%`, backgroundColor: fillColor || colors.primary }]} />
    </View>
  );
};

const progressStyles = StyleSheet.create({
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
});

// No per-lesson-content completion tracking exists anywhere in the app
// (confirmed: nothing records progress through a topic's letters/items), so
// this shows what's actually known — the last completed quiz pack, or a
// "get started" prompt for a brand-new player — never a fabricated percentage.
const ContinueLearningCard = ({ lesson, onPress }) => {
  const colors = useThemeColors();
  const m = moduleColors[lesson.mod];
  const s = makeContinueStyles(colors, m.solid);

  return (
    <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={coloredShadow(m.solid, 'md')}>
      <View style={s.card}>
        <LinearGradient
          colors={[m.solid + '14', m.solid + '00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.6 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        <LinearGradient colors={[m.from, m.to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.iconTile}>
          <LinearGradient colors={SHEEN_COLORS} pointerEvents="none" style={styles.continueIconSheen} />
          <Text style={s.iconGlyph}>{lesson.icon}</Text>
        </LinearGradient>

        <View style={s.body}>
          <Text style={s.kicker}>▶ RESUME</Text>
          <Text style={s.title} numberOfLines={1}>{lesson.title}</Text>
          <Text style={s.subtitle} numberOfLines={1}>{lesson.subtitle}</Text>
        </View>

        <View style={[s.continueBtn, { backgroundColor: m.solid }]}>
          <Ionicons name="play" size={12} color="#FFFFFF" />
          <Text style={s.continueBtnText}>Continue</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const StatTile = ({ stat, delay }) => {
  const colors = useThemeColors();
  const s = makeStatStyles(colors);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, ...Motion.timing.base, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, ...Motion.timing.base, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View style={[s.tile, coloredShadow(stat.color, 'sm'), { opacity, transform: [{ translateY }] }]}>
      <LinearGradient
        colors={[stat.color + '26', stat.color + '0C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.statIconBadge, { borderColor: stat.color + '2E' }]}
      >
        <Text style={styles.statIcon}>{stat.icon}</Text>
      </LinearGradient>
      <Text style={s.value}>{stat.value}</Text>
      <Text style={s.label}>{stat.label}</Text>
    </Animated.View>
  );
};

const HomeScreen = ({ navigation }) => {
  const { user, stars } = useAuth();
  const { streak, xp, lessonsCompleted, gamesPlayed, badges, lastLesson } = useProgress();
  const colors = useThemeColors();
  const bottomPad = useTabBarClearance();
  const userProfile = user || { name: 'Superstar', avatar: '🦁' };

  const heroScale = useRef(new Animated.Value(0.96)).current;
  useEffect(() => {
    Animated.spring(heroScale, { toValue: 1, useNativeDriver: true, ...Motion.spring.gentle }).start();
  }, []);

  const s = makeStyles(colors);

  // Continue Learning — resolve the real last-completed-quiz pointer against
  // MODULES for display; a brand-new player (no completions yet) gets a
  // "start here" prompt instead of a fabricated in-progress lesson.
  const lastModule = lastLesson && MODULES.find((m) => m.mod === lastLesson.mod);
  const firstModule = MODULES[0];
  const continueLesson = lastModule
    ? { title: lastModule.name, subtitle: `Last played: ${lastLesson.packTitle}`, mod: lastModule.mod, icon: lastModule.icon }
    : { title: 'Start your first lesson!', subtitle: `Begin with ${firstModule.name}`, mod: firstModule.mod, icon: firstModule.icon };
  const goToContinueLesson = () => {
    tap();
    if (lastModule) navigation.navigate('ModuleQuiz', { module: lastLesson.mod, packId: lastLesson.packId });
    else navigation.navigate(firstModule.screen, firstModule.params);
  };

  const stats = [
    { icon: '⚡', value: String(xp), label: 'Total XP', color: '#F59E0B' },
    { icon: '📖', value: String(lessonsCompleted), label: 'Lessons', color: '#6366F1' },
    { icon: '🎮', value: String(gamesPlayed), label: 'Games', color: '#8B5CF6' },
    { icon: '🏅', value: String(badges.length), label: 'Badges', color: '#EC4899' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header
        title="Little Genius"
        avatar={userProfile.avatar}
        stars={stars}
        useLogo
        rightAction={<Badge label={String(streak)} icon="🔥" tone="brand" />}
      />

      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}>
        {/* Hero — one self-contained gradient card (greeting, streak, character).
            Everything lives inside this single opaque card now — no separate
            band/wave/negative-margin layering, so there's no sibling that can
            ever paint over the text again. */}
        <View style={styles.heroWrap}>
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

              <View style={styles.heroTextBlock}>
                <Text style={styles.heroKicker}>TODAY'S ADVENTURE ✨</Text>
                <Text style={styles.welcomeHeading}>Hi, {userProfile.name}! 👋</Text>
                <Text style={s.welcomeSubtext}>Let's learn something new today!</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Streak card straddles the hero card's bottom edge — half
              resting on the gradient, half hanging over the page below,
              same "floating stat" idiom as the character popping over
              the top edge. */}
          <View style={styles.heroStreakFloating}>
            <View style={[s.heroStreakCard, coloredShadow('#F97316', 'md')]}>
              <LinearGradient colors={['#FB923C', '#F97316']} style={styles.heroStreakBadge}>
                <Text style={styles.heroStreakBadgeIcon}>🔥</Text>
              </LinearGradient>
              <View style={styles.heroStreakInfo}>
                <View style={styles.heroStreakInfoTop}>
                  <Text style={s.heroStreakLabel}>{streak} Day Streak</Text>
                  <Text style={s.heroStreakCount}>{streak}/{STREAK_GOAL}</Text>
                </View>
                <ProgressBar
                  value={streak}
                  max={STREAK_GOAL}
                  trackColor={colors.surfaceSunken}
                  fillColor="#F97316"
                />
              </View>
            </View>
          </View>

          <View style={styles.heroCharacterShadow}>
            <Image
              source={require('../../../assets/character-full.png')}
              style={styles.heroCharacter}
              resizeMode="contain"
              pointerEvents="none"
            />
          </View>
        </View>

        {/* Learning Modules — horizontally scrolling row, fixed-width cards */}
        <SectionHeader emoji="📖" title="Learning Modules" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={MODULE_CARD_WIDTH + Spacing.md}
          snapToAlignment="start"
          style={styles.modulesScroll}
          contentContainerStyle={styles.modulesScrollContent}
        >
          {MODULES.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              delay={index * Motion.stagger}
              onPress={() => { tap(); navigation.navigate(module.screen, module.params); }}
            />
          ))}
        </ScrollView>

        {/* Continue Learning */}
        <SectionHeader emoji="▶️" title="Continue Learning" />
        <ContinueLearningCard lesson={continueLesson} onPress={goToContinueLesson} />

        {/* Explore My World */}
        <SectionHeader
          emoji="🌍"
          title="Explore My World"
          actionLabel="See all"
          onActionPress={() => navigation.navigate('Learn', { moduleKey: 'world' })}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}
          contentContainerStyle={styles.catScrollContent}
        >
          {WORLD_CATEGORIES.map((cat, i) => (
            <TopicCard
              key={cat.key}
              variant="tile"
              index={i}
              style={styles.catCell}
              emoji={cat.icon}
              color={cat.color}
              title={cat.name}
              badge={cat.count}
              onPress={() => { tap(); navigation.navigate('Learn', { moduleKey: 'world', initialTab: cat.key }); }}
            />
          ))}
        </ScrollView>

        {/* Quick Play */}
        <SectionHeader
          emoji="⚡"
          title="Quick Play"
          actionLabel="View all"
          onActionPress={() => { tap(); navigation.navigate('Games'); }}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={QUICK_CARD_WIDTH + Spacing.md}
          snapToAlignment="start"
          style={styles.quickScroll}
          contentContainerStyle={styles.quickScrollContent}
        >
          {QUICK_ACTIONS.map((action, index) => (
            <QuickPlayCard
              key={action.route}
              action={action}
              isFeatured={action.route === FEATURED_QUICK_ROUTE}
              delay={index * Motion.stagger}
              onPress={() => { tap(); navigation.navigate(action.route); }}
            />
          ))}
        </ScrollView>

        {/* Daily Progress */}
        <SectionHeader emoji="📊" title="Daily Progress" />
        <View style={styles.statsRow}>
          {stats.map((stat, index) => (
            <StatTile key={stat.label} stat={stat} delay={index * Motion.stagger} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// Theme-dependent styles
const makeStyles = (colors) =>
  StyleSheet.create({
    welcomeSubtext: { ...textStyles.body, color: colors.onBrandMuted },
    heroStreakCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      gap: Spacing.md,
    },
    heroStreakLabel: { ...textStyles.bodyStrong, color: colors.textPrimary },
    heroStreakCount: { ...textStyles.caption, color: colors.textMuted },
  });

// Theme + per-module-accent styles — a light tint of the module's own
// colour rather than a solid saturated block (see ModuleCard above).
const makeModuleStyles = (colors, accent) =>
  StyleSheet.create({
    moduleCard: {
      backgroundColor: colors.surface,
      borderRadius: Radius.xl,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      minHeight: 174,
      justifyContent: 'space-between',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: accent + '28',
    },
    moduleArrow: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: accent + '1A',
      borderWidth: 1,
      borderColor: accent + '2E',
      alignItems: 'center',
      justifyContent: 'center',
    },
    moduleIconBadge: {
      width: 56,
      height: 56,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: accent + '3A',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.sm,
    },
    moduleName: { ...textStyles.title, color: colors.textPrimary, marginBottom: 2 },
    moduleDescription: { ...textStyles.caption, color: colors.textSecondary },
  });

const makeContinueStyles = (colors, accent) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: accent + '26',
      padding: Spacing.lg,
      gap: Spacing.md,
      marginBottom: Spacing.xxl,
      overflow: 'hidden',
    },
    iconTile: {
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    iconGlyph: { fontSize: 26, lineHeight: 32, textAlign: 'center' },
    body: { flex: 1 },
    kicker: { ...textStyles.overline, color: accent, fontSize: 10, marginBottom: 3 },
    title: { ...textStyles.title, color: colors.textPrimary, marginBottom: 2 },
    subtitle: { ...textStyles.caption, color: colors.textSecondary },
    continueBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderRadius: Radius.full,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
    },
    continueBtnText: { ...textStyles.caption, color: '#FFFFFF', fontSize: 12 },
  });

const makeStatStyles = (colors) =>
  StyleSheet.create({
    tile: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      paddingVertical: Spacing.lg,
      gap: 6,
    },
    value: { ...textStyles.h3, color: colors.textPrimary },
    label: { ...textStyles.caption, color: colors.textMuted, fontSize: 11 },
  });

// Static styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 16,  },

  // Hero — single self-contained card (see JSX comment). `marginTop` gives
  // the character room to pop up above the card's top edge without being
  // clipped by the ScrollView's own top boundary (its negative `top` below
  // must not exceed this margin). `overflow: visible` lets the character
  // render outside the card's own box.
  heroWrap: {
    overflow: 'visible',
    marginTop: Spacing.huge,
    // Extra bottom room for the streak card's lower half, which hangs
    // below the hero card (see heroStreakFloating).
    marginBottom: Spacing.xxl + STREAK_CARD_OVERLAP,
  },
  heroCard: {
    borderRadius: Radius.xl,
    paddingTop: Spacing.xl,
    // Generous bottom padding — the floating streak card's top half
    // rests in this space, on top of the gradient, below the greeting.
    paddingBottom: Spacing.xxxl + Spacing.md,
    paddingHorizontal: Spacing.xl,
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

  // Greeting block — kicker + heading + subtext, all inside the card so
  // nothing can ever paint over it. maxWidth keeps it clear of the
  // character, which pops out over the card's right edge.
  heroTextBlock: { maxWidth: '68%' },
  heroKicker: {
    ...textStyles.overline,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.xs,
  },
  welcomeHeading: { ...textStyles.h1, color: '#FFFFFF', marginBottom: Spacing.xs },

  // Streak card — floats as a sibling of the hero gradient, positioned so
  // its vertical centre sits on the hero card's bottom edge: half shows
  // over the gradient, half hangs below it over the page background.
  // zIndex sits under the character (5) so the mascot appears to stand
  // just in front of/on the ribbon.
  heroStreakFloating: {
    position: 'absolute',
    left: Spacing.xl,
    right: Spacing.xl,
    bottom: -STREAK_CARD_OVERLAP,
    zIndex: 4,
  },
  heroStreakBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStreakBadgeIcon: { fontSize: 20, lineHeight: 24 },
  heroStreakInfo: { flex: 1, gap: 6 },
  heroStreakInfoTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  // Full-body character — pops out above the card's top edge. Wrapped in a
  // plain View (not shadow props directly on Image) so the grounding shadow
  // renders on Android too, where Image shadow props are unreliable on a
  // transparent PNG. `top` is negative relative to heroWrap's own box, so it
  // must not exceed heroWrap's `marginTop` above or it gets clipped by the
  // ScrollView's top boundary.
  heroCharacterShadow: {
    position: 'absolute',
    top: -36,
    right: 6,
    zIndex: 5,
    elevation: 10,
    ...coloredShadow('#1E1B4B', 'lg'),
  },
  heroCharacter: { width: 190, height: 220, marginTop: -15, marginRight: -15 },

  // Learning Modules — horizontally-scrolling row of fixed-width cards
  // (see makeModuleStyles for the colour-dependent parts of the card
  // itself). paddingBottom clears room for the card's own shadow, which
  // would otherwise be clipped by the ScrollView's bounds.
  modulesScroll: { marginBottom: Spacing.xxl },
  modulesScrollContent: { gap: Spacing.md, paddingRight: Spacing.lg, paddingBottom: Spacing.sm, paddingTop: 2 },
  moduleCardWrapper: { width: MODULE_CARD_WIDTH },
  moduleTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  moduleIcon: { fontSize: 28, lineHeight: 34, textAlign: 'center' },
  moduleInfo: { marginTop: Spacing.sm },
  // Soft decorative circle for depth, tucked behind the card content.
  moduleBlobDecor: {
    position: 'absolute',
    bottom: -26,
    right: -26,
    width: 96,
    height: 96,
    borderRadius: 48,
  },

  // Explore My World — single horizontally-scrolling row. TopicCard owns
  // the tile's own look; the screen only owns spacing + a fixed cell width
  // (a scroll row can't rely on flex to divide space like the old 3-up grid).
  catScroll: { marginBottom: Spacing.xxl },
  catScrollContent: { gap: Spacing.md, paddingRight: Spacing.lg, paddingBottom: Spacing.sm, paddingTop: 2 },
  catCell: { width: 104 },

  // Continue Learning — glossy highlight on the icon tile, same idiom
  // as the hero/quick-play gradient cards.
  continueIconSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '55%' },

  // Quick Play — horizontally-scrolling slider of fixed-width rectangular
  // cards (see QuickPlayCard). paddingBottom/Top clear room for the card's
  // own shadow + press-scale, which would otherwise clip against the
  // ScrollView's bounds.
  quickScroll: { marginBottom: Spacing.xxl },
  quickScrollContent: { gap: Spacing.md, paddingRight: Spacing.lg, paddingBottom: Spacing.sm, paddingTop: 2 },
  quickCardWrapper: { width: QUICK_CARD_WIDTH },
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  quickSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '45%' },
  quickBlobDecor: {
    position: 'absolute',
    bottom: -34,
    left: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  quickPreviewBox: {
    width: 92,
    height: 92,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  // Featured card swaps the translucent emoji badge for an opaque white
  // tile so the real coloured art (not the gradient behind it) reads clean.
  quickPreviewBoxFeatured: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(255,255,255,0.6)',
  },
  quickEmoji: { fontSize: 32, lineHeight: 38, textAlign: 'center' },
  quickBody: { flex: 1 },
  quickTag: { alignSelf: 'flex-start', marginBottom: Spacing.xs },
  quickCardTitle: { ...textStyles.title, fontSize: 16, color: '#FFFFFF', marginBottom: 3 },
  quickDesc: {
    ...textStyles.caption,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: Spacing.sm,
  },
  quickPlayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: Radius.full,
    paddingVertical: 7,
    paddingHorizontal: Spacing.lg,
  },
  quickPlayPillText: { ...textStyles.caption, fontSize: 11, fontWeight: '900', color: '#1E1B4B' },

  // Daily progress footer — colour-tinted icon badge per stat (colour
  // itself lives in the stat's own coloredShadow + gradient in StatTile).
  statsRow: { flexDirection: 'row', gap: 8 },
  statIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: { fontSize: 20, lineHeight: 24 },
});

export default HomeScreen;
