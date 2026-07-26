import React, { useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { gamesList } from '../../Data/gamesData';
import coloringData from '../../Data/coloringData';
import { Header } from '../../Components/UI';
import { useThemeColors } from '../../Context/ThemeContext';
import { useTabBarClearance } from '../../Hooks';

// ──────────────────────────────────────────────────────────────
// GamesScreen — premium "arcade" picker.
//
// Layout is deliberately varied so it never reads like one card
// repeated: a gradient hero, ONE large featured showcase card, then
// a 2-column grid of tall gradient tiles. Everything springs on
// press, fires haptics, and staggers in on mount.
// ──────────────────────────────────────────────────────────────

const useEnter = (index) => {
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 420,
      delay: 70 * index,
      useNativeDriver: true,
    }).start();
  }, [enter, index]);
  return enter;
};

const usePress = () => {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 26, bounciness: 9 }).start();
  return { scale, pressIn, pressOut };
};

const tap = (fn, game) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  fn(game);
};

// A pre-coloured dino so the Coloring Book card previews the real art
// a child fills in — not a flat emoji. Colours come straight from the
// scene's own `preview` map (same source the in-game "original" uses).
const PREVIEW_SCENE = coloringData.find((s) => s.id === 'trex') || coloringData[0];
const PREVIEW_FILLS = PREVIEW_SCENE.preview || {};

// Thumbnails are small, so the art's own stroke weights get scaled up a
// little — otherwise the hairline texture lines vanish on the card.
const PREVIEW_INK = 1.5;

const ColoringPreview = ({ size }) => (
  <Svg width={size} height={size} viewBox={PREVIEW_SCENE.viewBox}>
    {PREVIEW_SCENE.regions.map((r) => (
      <Path
        key={r.id}
        d={r.d}
        fill={PREVIEW_FILLS[r.id] || '#FFFFFF'}
        stroke="#2B2B3A"
        strokeWidth={(r.w ?? 2.8) * PREVIEW_INK}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    ))}
    {PREVIEW_SCENE.outlines.map((o, i) => (
      <Path
        key={`o${i}`}
        d={o.d}
        fill={o.fill ? '#2B2B3A' : 'none'}
        stroke="#2B2B3A"
        strokeWidth={(o.w ?? 1.6) * PREVIEW_INK}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ))}
  </Svg>
);

// Explicit "what's new" order for the grid. Anything not listed keeps its
// natural gamesList order behind these (offset well past the listed ranks).
const GRID_ORDER = ['DrawingBoard', 'TracingWorksheet', 'LetterPuzzle'];
const gridRank = (game) => {
  const i = GRID_ORDER.indexOf(game.route);
  return i === -1 ? 100 + game.id : i;
};

// ── Large featured showcase card ──────────────────────────────
const FeaturedCard = ({ game, index, styles, onPress }) => {
  const enter = useEnter(index);
  const { scale, pressIn, pressOut } = usePress();
  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [26, 0] });

  return (
    <Animated.View style={{ opacity: enter, transform: [{ translateY }, { scale }] }}>
      <TouchableOpacity activeOpacity={0.9} onPressIn={pressIn} onPressOut={pressOut} onPress={() => tap(onPress, game)}>
        <LinearGradient
          colors={[game.gradStart, game.gradEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.featured, { shadowColor: game.gradEnd }]}
        >
          <View style={styles.featuredDecorLg} />
          <View style={styles.featuredDecorSm} />

          {game.preview ? (
            <View style={styles.featuredPreview}>
              <ColoringPreview size={104} />
            </View>
          ) : (
            <View style={styles.featuredIconWrap}>
              <Text style={styles.featuredIcon}>{game.icon}</Text>
            </View>
          )}

          <View style={styles.featuredBody}>
            <View style={styles.featuredTag}>
              <Text style={styles.featuredTagText}>⭐ FEATURED · {game.tag}</Text>
            </View>
            <Text style={styles.featuredName}>{game.name}</Text>
            <Text style={styles.featuredDesc} numberOfLines={2}>{game.desc}</Text>
            <View style={styles.playPill}>
              <Text style={styles.playPillText}>PLAY NOW  ▶</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Tall grid tile ────────────────────────────────────────────
const GameTile = ({ game, index, styles, onPress }) => {
  const enter = useEnter(index);
  const { scale, pressIn, pressOut } = usePress();
  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [26, 0] });

  return (
    <Animated.View style={[styles.tileWrap, { opacity: enter, transform: [{ translateY }, { scale }] }]}>
      <TouchableOpacity activeOpacity={0.9} onPressIn={pressIn} onPressOut={pressOut} onPress={() => tap(onPress, game)}>
        <LinearGradient
          colors={[game.gradStart, game.gradEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.tile, { shadowColor: game.gradEnd }]}
        >
          <View style={styles.tileDecor} />

          <View style={styles.tileTop}>
            <View style={styles.tileIconWrap}>
              <Text style={styles.tileIcon}>{game.icon}</Text>
            </View>
            <View style={styles.tileTag}>
              <Text style={styles.tileTagText}>{game.tag}</Text>
            </View>
          </View>

          <View style={styles.tileTextBlock}>
            <Text style={styles.tileName} numberOfLines={1}>{game.name}</Text>
            <Text style={styles.tileDesc} numberOfLines={2}>{game.desc}</Text>
          </View>

          <View style={styles.tileArrow}>
            <Text style={styles.tileArrowText}>→</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const GamesScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const bottomPad = useTabBarClearance();
  const styles = makeStyles(colors);

  const openGame = (game) => {
    if (game.route) navigation.navigate(game.route);
    else navigation.navigate('GamePlay', { gameId: game.id });
  };

  // Coloring Book leads as the big showcase card; everything else fills
  // the grid. Fall back to the first game if the route is ever renamed.
  const coloring = gamesList.find((g) => g.route === 'ColoringBook');
  const featured = coloring
    ? { ...coloring, preview: true, tag: 'ART' }
    : gamesList[0];
  // Newest activities lead the grid (Neon Drawing first), then the classic
  // mini-games — so what's new is the first thing a child sees.
  const rest = gamesList
    .filter((g) => g.id !== featured.id)
    .sort((a, b) => gridRank(a) - gridRank(b));

  return (
    <View style={styles.container}>
      <Header title="Brain Games" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero banner */}
        <LinearGradient
          colors={colors.gradients.games}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroDecor} />
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroKicker}>PLAY · LEARN · WIN ⭐</Text>
            <Text style={styles.heroTitle}>Let's play a{'\n'}brain game! 🎮</Text>
            <Text style={styles.heroSub}>{gamesList.length} fun games to boost your brain</Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeEmoji}>🧠</Text>
          </View>
        </LinearGradient>

        {/* Featured — Coloring Book showcase */}
        <Text style={styles.sectionLabel}>🎨 Featured Activity</Text>
        <FeaturedCard game={featured} index={0} styles={styles} onPress={openGame} />

        {/* Grid */}
        <Text style={[styles.sectionLabel, { marginTop: 22 }]}>🎮 All Games</Text>
        <View style={styles.grid}>
          {rest.map((game, i) => (
            <GameTile key={game.id} game={game} index={i + 1} styles={styles} onPress={openGame} />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerEmoji}>✨</Text>
          <Text style={styles.footerText}>More games coming soon!</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { paddingHorizontal: 16, paddingTop: 16 },

    // Hero
    hero: {
      borderRadius: 26,
      padding: 22,
      marginBottom: 22,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      elevation: 8,
      shadowColor: '#4338CA',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 18,
    },
    heroDecor: {
      position: 'absolute',
      top: -40,
      right: -20,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
    heroTextBlock: { flex: 1 },
    heroKicker: { fontSize: 11, fontWeight: '900', letterSpacing: 1.4, color: 'rgba(255,255,255,0.85)', marginBottom: 6 },
    heroTitle: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', lineHeight: 30, letterSpacing: -0.4, marginBottom: 8 },
    heroSub: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
    heroBadge: {
      width: 62,
      height: 62,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
    },
    heroBadgeEmoji: { fontSize: 34 },

    // Section labels
    sectionLabel: {
      fontSize: 15,
      fontWeight: '900',
      color: colors.textPrimary,
      marginBottom: 12,
      letterSpacing: -0.2,
    },

    // Featured card
    featured: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 26,
      padding: 18,
      overflow: 'hidden',
      elevation: 9,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.34,
      shadowRadius: 16,
    },
    featuredDecorLg: {
      position: 'absolute',
      top: -50,
      right: -30,
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: 'rgba(255,255,255,0.14)',
    },
    featuredDecorSm: {
      position: 'absolute',
      bottom: -30,
      left: 90,
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255,255,255,0.10)',
    },
    featuredIconWrap: {
      width: 96,
      height: 96,
      borderRadius: 26,
      backgroundColor: 'rgba(255,255,255,0.24)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.3)',
    },
    featuredIcon: { fontSize: 52 },
    featuredPreview: {
      width: 116,
      height: 116,
      borderRadius: 24,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.55)',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
    },
    featuredBody: { flex: 1 },
    featuredTag: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.24)',
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 9,
      marginBottom: 8,
    },
    featuredTagText: { fontSize: 9, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.6 },
    featuredName: { fontSize: 21, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.4, marginBottom: 4 },
    featuredDesc: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.9)', lineHeight: 16, marginBottom: 12 },
    playPill: {
      alignSelf: 'flex-start',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderBottomWidth: 3,
      borderBottomColor: 'rgba(0,0,0,0.12)',
    },
    playPillText: { fontSize: 11, fontWeight: '900', color: colors.textPrimary, letterSpacing: 0.5 },

    // Grid
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 14,
    },
    tileWrap: { width: '48%' },
    tile: {
      height: 168,
      borderRadius: 22,
      padding: 15,
      overflow: 'hidden',
      justifyContent: 'space-between',
      elevation: 7,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
    tileDecor: {
      position: 'absolute',
      top: -28,
      right: -22,
      width: 92,
      height: 92,
      borderRadius: 46,
      backgroundColor: 'rgba(255,255,255,0.14)',
    },
    tileTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    tileIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.26)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
    },
    tileIcon: { fontSize: 28 },
    tileTag: {
      backgroundColor: 'rgba(255,255,255,0.28)',
      borderRadius: 7,
      paddingVertical: 3,
      paddingHorizontal: 7,
    },
    tileTagText: { fontSize: 8, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.6 },
    tileTextBlock: { paddingRight: 30 },
    tileName: { fontSize: 16, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.3, marginBottom: 3 },
    tileDesc: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.88)', lineHeight: 15 },
    tileArrow: {
      position: 'absolute',
      bottom: 14,
      right: 14,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.26)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tileArrowText: { fontSize: 14, color: '#FFFFFF', fontWeight: '900' },

    footer: { alignItems: 'center', paddingVertical: 24, gap: 6 },
    footerEmoji: { fontSize: 28 },
    footerText: { fontSize: 13, fontWeight: '800', color: colors.textSecondary },
  });

export default GamesScreen;
