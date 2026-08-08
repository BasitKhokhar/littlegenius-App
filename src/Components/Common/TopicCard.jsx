import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../Context/ThemeContext';
import { Spacing, Radius, Motion, coloredShadow } from '../../Theme';
import { Fonts } from '../../Theme/fonts';
import useSpeak from '../../Hooks/useSpeak';

// ──────────────────────────────────────────────────────────────
// TopicCard — THE learning card. One component, one design, used by
// My Pakistan, My World, Good Habits and Home's "Explore My World".
// Restyle this file and every one of those sections follows.
//
//   variant="row"  (default) — horizontal media row: big emoji tile on
//     the left, bilingual text on the right. Tapping anywhere speaks
//     `speakText`; tapping again stops.
//
//   variant="tile" — compact centred tile for multi-column grids
//     (emoji + one-word name + count pill). Navigates via `onPress`.
//
// The row layout exists because the old centred/stacked cards ran
// ~390pt tall for two words of content. Pairing English + Urdu on one
// line and putting the emoji beside the text instead of above it gets
// the same content into ~150pt while the emoji actually reads bigger.
// ──────────────────────────────────────────────────────────────

const ROW_TILE = 95;
const ROW_GLYPH = 55;
const TILE_ICON = 60;

// Three bars that "breathe" while a card is speaking. Different
// durations keep them out of phase without extra bookkeeping.
const BAR_DURATIONS = [230, 310, 265];

const SpeakingBars = ({ isSpeaking }) => {
  const bars = useRef(BAR_DURATIONS.map(() => new Animated.Value(0.45))).current;

  useEffect(() => {
    if (!isSpeaking) {
      bars.forEach((b) => b.setValue(0.45));
      return undefined;
    }
    const loops = bars.map((b, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(b, {
            toValue: 1,
            duration: BAR_DURATIONS[i],
            useNativeDriver: true,
          }),
          Animated.timing(b, {
            toValue: 0.45,
            duration: BAR_DURATIONS[i],
            useNativeDriver: true,
          }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [isSpeaking, bars]);

  return (
    <View style={staticStyles.barsRow}>
      {bars.map((b, i) => (
        <Animated.View
          key={i}
          style={[staticStyles.bar, { transform: [{ scaleY: b }] }]}
        />
      ))}
    </View>
  );
};

const TopicCard = ({
  emoji,
  color,
  title,
  titleUrdu,
  subtitle,
  subtitleUrdu,
  speakText,
  speakLanguage = 'en-US',
  variant = 'row',
  badge,
  onPress,
  index = 0,
  style,
}) => {
  const colors = useThemeColors();
  const accent = color || colors.primary;
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { isSpeaking, toggle } = useSpeak();

  // Press feedback — the app's standard idiom (see AlphabetCard).
  const press = useRef(new Animated.Value(1)).current;
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      // Capped so a card mounted far down a long list doesn't sit
      // invisible for a second while the user scrolls to it.
      delay: Math.min(index, 6) * Motion.stagger,
      ...Motion.timing.base,
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  const pressIn = () =>
    Animated.spring(press, {
      toValue: Motion.pressScale,
      useNativeDriver: true,
      ...Motion.spring.soft,
    }).start();

  const pressOut = () =>
    Animated.spring(press, {
      toValue: 1,
      useNativeDriver: true,
      ...Motion.spring.soft,
    }).start();

  // An explicit onPress wins; otherwise the whole card is a speak target.
  const canSpeak = !onPress && !!speakText;
  const handlePress = onPress || (canSpeak ? () => toggle(speakText, speakLanguage) : undefined);

  const enterStyle = {
    opacity: enter,
    transform: [
      { scale: press },
      {
        translateY: enter.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0],
        }),
      },
    ],
  };

  // ── Compact grid tile ───────────────────────────────────────
  if (variant === 'tile') {
    return (
      <Animated.View style={[enterStyle, style]}>
        <TouchableOpacity
          style={coloredShadow(accent, 'sm')}
          onPress={handlePress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel={title}
        >
          <View style={[styles.tileShell, { borderColor: accent + '24' }]}>
            <View style={[staticStyles.tileBlobDecor, { backgroundColor: accent + '14' }]} pointerEvents="none" />

            <LinearGradient
              colors={[accent + '40', accent + '18']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.tileIcon, { borderColor: accent + '30' }]}
            >
              <Text style={staticStyles.tileGlyph}>{emoji}</Text>
            </LinearGradient>

            <Text style={styles.tileName} numberOfLines={1}>
              {title}
            </Text>

            {badge != null && (
              <View style={[staticStyles.tilePill, { backgroundColor: accent }]}>
                <Text style={staticStyles.tilePillText}>{badge}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ── Horizontal media row ────────────────────────────────────
  return (
    <Animated.View style={[staticStyles.rowWrap, enterStyle, style]}>
      <TouchableOpacity
        style={[styles.rowShell, coloredShadow(accent, 'sm')]}
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={handlePress ? 0.92 : 1}
        disabled={!handlePress}
        accessibilityRole={handlePress ? 'button' : undefined}
        accessibilityLabel={[title, titleUrdu, subtitle].filter(Boolean).join(', ')}
      >
        {/* Full-height colour rail — card identity without stealing height */}
        <View style={[staticStyles.rail, { backgroundColor: accent }]} />

        <View style={staticStyles.mediaWrap}>
          <LinearGradient
            colors={[accent + '2E', accent + '0F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[staticStyles.emojiTile, { borderColor: accent + '2A' }]}
          >
            <Text style={staticStyles.emojiGlyph}>{emoji}</Text>
          </LinearGradient>

          {canSpeak && (
            <View
              style={[
                staticStyles.speakBadge,
                { backgroundColor: accent, borderColor: colors.surface },
              ]}
            >
              {isSpeaking ? (
                <SpeakingBars isSpeaking={isSpeaking} />
              ) : (
                <Text style={staticStyles.speakGlyph}>🔊</Text>
              )}
            </View>
          )}
        </View>

        <View style={staticStyles.body}>
          <View style={staticStyles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            {!!titleUrdu && (
              <Text style={[staticStyles.titleUrdu, { color: accent }]} numberOfLines={1}>
                {titleUrdu}
              </Text>
            )}
          </View>

          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {!!subtitleUrdu && <Text style={styles.subtitleUrdu}>{subtitleUrdu}</Text>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Theme-independent geometry — created once.
const staticStyles = StyleSheet.create({
  rowWrap: { marginBottom: Spacing.md },

  rail: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },

  mediaWrap: { marginRight: Spacing.lg },
  emojiTile: {
    width: ROW_TILE,
    height: ROW_TILE,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // lineHeight MUST be a number — a string here silently breaks the
  // glyph box on Fabric and clips tall emoji.
  emojiGlyph: { fontSize: ROW_GLYPH, lineHeight: ROW_GLYPH + 10, textAlign: 'center' },

  speakBadge: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakGlyph: { fontSize: 12, lineHeight: 16 },
  barsRow: { flexDirection: 'row', alignItems: 'center', height: 12 },
  bar: {
    width: 2.5,
    height: 11,
    borderRadius: 2,
    marginHorizontal: 1,
    backgroundColor: '#FFFFFF',
  },

  body: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  titleUrdu: {
    fontFamily: Fonts.urdu,
    fontSize: 16,
    lineHeight: 30,
    textAlign: 'right',
    flexShrink: 1,
  },

  tileGlyph: { fontSize: 30, lineHeight: 38, textAlign: 'center' },
  tilePill: {
    borderRadius: Radius.full,
    paddingVertical: 3,
    paddingHorizontal: Spacing.md,
  },
  tilePillText: { fontSize: 11, color: '#FFFFFF', fontFamily: Fonts.extraBold },
  // Soft decorative circle tucked behind the icon for depth — same idiom
  // as Home's module/quick-play cards.
  tileBlobDecor: {
    position: 'absolute',
    top: -18,
    right: -18,
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});

const makeStyles = (colors) =>
  StyleSheet.create({
    rowShell: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      paddingVertical: Spacing.lg - 2,
      paddingLeft: Spacing.lg + 2, // clears the 5pt rail
      paddingRight: Spacing.lg,
      overflow: 'hidden',
    },

    title: {
      flexShrink: 1,
      fontFamily: Fonts.extraBold,
      fontSize: 17,
      lineHeight: 23,
      letterSpacing: -0.3,
      color: colors.textPrimary,
    },
    subtitle: {
      fontFamily: Fonts.medium,
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
      marginTop: Spacing.xs,
    },
    subtitleUrdu: {
      fontFamily: Fonts.urdu,
      fontSize: 13,
      lineHeight: 26,
      color: colors.textMuted,
      textAlign: 'right',
      writingDirection: 'rtl',
      marginTop: 3,
    },

    tileShell: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.sm,
      alignItems: 'center',
      overflow: 'hidden',
    },
    tileIcon: {
      width: TILE_ICON,
      height: TILE_ICON,
      borderRadius: TILE_ICON / 2,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    tileName: {
      fontFamily: Fonts.bold,
      fontSize: 13,
      lineHeight: 18,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
  });

export default React.memo(TopicCard);
