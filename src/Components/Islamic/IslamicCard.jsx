import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../Context/ThemeContext';
import { Spacing, Radius, Motion, coloredShadow } from '../../Theme';
import { Fonts } from '../../Theme/fonts';
import SpeakButton from '../Common/SpeakButton';

// ──────────────────────────────────────────────────────────────
// IslamicCard — THE card for the Islamic section. Duas, Kalmas,
// Pillars, 99 Names, Prophets, Manners and the Wudu/Salah steps all
// render through this one component, so the whole section shares a
// single premium look: tinted head wash, oversized emoji medallion,
// a dedicated scripture panel for the Arabic, then labelled
// English/Urdu meaning blocks.
//
// Every block is optional — pass only what an entry actually has and
// the card collapses around it (a Kalma has arabic + meanings, a Wudu
// step has none of that, just detail text).
//
// The emoji is deliberately large (MEDALLION/GLYPH below): these cards
// are read by 4-8 year olds who navigate by picture before text.
// ──────────────────────────────────────────────────────────────

const MEDALLION = 74;
const GLYPH = 42;

const IslamicCard = ({
  accent,
  emoji,            // big glyph in the medallion
  number,           // small corner badge on the medallion (kalma no., step no., name no.)
  eyebrow,          // tiny uppercase label above the title
  title,
  titleUrdu,
  arabic,
  transliteration,
  meaningEn,        // translation of the arabic
  meaningUr,
  detail,           // longer explanatory paragraph (pillars, prophets, steps)
  detailUr,
  note,             // { label, text } — highlighted callout
  speak,            // { text, language, fallback, label } — full-width pill at the card foot
  // Per-script play buttons. A card that carries BOTH scripts gets one round
  // speaker on the Arabic panel and one on the Urdu block, so a child can hear
  // the recitation and its translation separately instead of guessing which
  // one the single bottom button plays. Each is { text, language, fallback }.
  speakArabic,
  speakUrdu,        // attaches to meaningUr, or to detailUr when there is no meaningUr
  index = 0,
  children,
}) => {
  const colors = useThemeColors();
  const tone = accent || colors.primary;
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Gentle staggered entrance, capped so a card far down a long list
  // (99 Names) isn't invisible while the user scrolls to it.
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      delay: Math.min(index, 6) * Motion.stagger,
      ...Motion.timing.base,
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  const enterStyle = {
    opacity: enter,
    transform: [
      { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
    ],
  };

  const hasHead = !!(emoji || number != null || title || titleUrdu || eyebrow);

  // Label on the left, round speaker on the right — same rhythm for every
  // block so the play control is always in the one place a child looks.
  const blockHead = (label, spoken, a11y) => (
    <View style={staticStyles.blockHead}>
      <Text style={[styles.blockLabel, { color: tone }, staticStyles.blockHeadLabel]}>{label}</Text>
      {!!spoken?.text && (
        <SpeakButton
          text={spoken.text}
          language={spoken.language || 'en-US'}
          fallbackText={spoken.fallback || null}
          variant="icon"
          size="sm"
          color={tone}
          accessibilityLabel={a11y}
        />
      )}
    </View>
  );

  // The Urdu speaker rides on meaningUr when there is one (duas, kalmas, the
  // Names), otherwise on the Urdu detail paragraph (prophets, manners, steps).
  const urduOnMeaning = !!(speakUrdu?.text && meaningUr);
  const urduOnDetail = !!(speakUrdu?.text && !meaningUr && detailUr);

  return (
    <Animated.View style={[styles.shell, coloredShadow(tone, 'sm'), enterStyle]}>
      {/* Accent rail + head wash — colour identity without a loud border */}
      <View style={[staticStyles.rail, { backgroundColor: tone }]} />
      <LinearGradient
        colors={[tone + '1F', tone + '00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={staticStyles.headWash}
        pointerEvents="none"
      />

      <View style={staticStyles.inner}>
        {hasHead && (
          <View style={staticStyles.head}>
            {(emoji || number != null) && (
              <View style={staticStyles.medallionWrap}>
                <LinearGradient
                  colors={[tone + '33', tone + '10']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[staticStyles.medallion, { borderColor: tone + '2E' }]}
                >
                  {emoji ? (
                    <Text style={staticStyles.glyph}>{emoji}</Text>
                  ) : (
                    <Text style={[staticStyles.medallionNumber, { color: tone }]}>{number}</Text>
                  )}
                </LinearGradient>

                {emoji && number != null && (
                  <View
                    style={[
                      staticStyles.numberBadge,
                      { backgroundColor: tone, borderColor: colors.surface },
                    ]}
                  >
                    <Text style={staticStyles.numberBadgeText}>{number}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={staticStyles.headText}>
              {!!eyebrow && <Text style={[styles.eyebrow, { color: tone }]}>{eyebrow}</Text>}
              {!!title && <Text style={styles.title}>{title}</Text>}
              {!!titleUrdu && <Text style={styles.titleUrdu}>{titleUrdu}</Text>}
            </View>
          </View>
        )}

        {/* Scripture panel — Arabic gets its own quiet, framed space */}
        {!!arabic && (
          <View style={[styles.scripture, { borderColor: tone + '30' }]}>
            {!!speakArabic?.text && blockHead('عربی · ARABIC', speakArabic, 'Play the Arabic')}
            <Text style={styles.arabic}>{arabic}</Text>
            {!!transliteration && (
              <>
                <View style={[styles.hairline, { backgroundColor: tone + '26' }]} />
                <Text style={styles.transliteration}>{transliteration}</Text>
              </>
            )}
          </View>
        )}

        {!!meaningUr && (
          <View style={staticStyles.block}>
            {urduOnMeaning
              ? blockHead('ترجمہ · URDU', speakUrdu, 'Play the Urdu translation')
              : <Text style={[styles.blockLabel, { color: tone }]}>ترجمہ · URDU</Text>}
            <Text style={styles.urduBody}>{meaningUr}</Text>
          </View>
        )}

        {!!meaningEn && (
          <View style={staticStyles.block}>
            <Text style={[styles.blockLabel, { color: tone }]}>MEANING</Text>
            <Text style={styles.englishBody}>{meaningEn}</Text>
          </View>
        )}

        {!!detail && <Text style={styles.detail}>{detail}</Text>}
        {!!detailUr && (
          <View style={staticStyles.detailUrduWrap}>
            {urduOnDetail && blockHead('اردو · URDU', speakUrdu, 'Play the Urdu translation')}
            <Text style={styles.detailUrdu}>{detailUr}</Text>
          </View>
        )}

        {!!note?.text && (
          <View style={[styles.note, { backgroundColor: tone + '14', borderColor: tone + '2E' }]}>
            <Text style={[styles.noteLabel, { color: tone }]}>{note.label}</Text>
            <Text style={styles.noteText}>{note.text}</Text>
          </View>
        )}

        {children}

        {!!speak?.text && (
          <View style={staticStyles.speakWrap}>
            <SpeakButton
              text={speak.text}
              language={speak.language || 'en-US'}
              fallbackText={speak.fallback || null}
              label={speak.label || '🔊 Hear'}
              color={tone}
            />
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// Theme-independent geometry — built once.
const staticStyles = StyleSheet.create({
  rail: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, zIndex: 1 },
  headWash: { position: 'absolute', left: 0, right: 0, top: 0, height: 110 },

  inner: { padding: Spacing.lg, paddingLeft: Spacing.lg + 4 },

  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  medallionWrap: { width: MEDALLION, height: MEDALLION },
  medallion: {
    width: MEDALLION,
    height: MEDALLION,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // lineHeight MUST be a number — a string silently clips tall emoji on Fabric.
  glyph: { fontSize: GLYPH, lineHeight: GLYPH + 10, textAlign: 'center' },
  medallionNumber: { fontFamily: Fonts.extraBold, fontSize: 28, lineHeight: 36 },

  numberBadge: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    minWidth: 26,
    height: 26,
    paddingHorizontal: 5,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadgeText: {
    fontFamily: Fonts.extraBold,
    fontSize: 12,
    lineHeight: 17,
    color: '#FFFFFF',
  },

  headText: { flex: 1 },
  block: { marginTop: Spacing.md },
  detailUrduWrap: { marginTop: Spacing.sm },
  speakWrap: { marginTop: Spacing.lg },

  // Label ←→ round speaker. minHeight keeps the label baseline steady whether
  // or not the block has a play button.
  blockHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    minHeight: 38,
    marginBottom: 2,
  },
  blockHeadLabel: { flex: 1, marginBottom: 0 },
});

const makeStyles = (colors) =>
  StyleSheet.create({
    shell: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      marginBottom: Spacing.md,
      overflow: 'hidden',
    },

    eyebrow: {
      fontFamily: Fonts.extraBold,
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 1.1,
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    title: {
      fontFamily: Fonts.extraBold,
      fontSize: 17,
      lineHeight: 23,
      letterSpacing: -0.3,
      color: colors.textPrimary,
    },
    titleUrdu: {
      fontFamily: Fonts.urdu,
      fontSize: 14,
      lineHeight: 28,
      color: colors.textSecondary,
      textAlign: 'right',
      writingDirection: 'rtl',
      marginTop: 2,
    },

    scripture: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: Radius.md,
      borderWidth: 1,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
    },
    arabic: {
      fontFamily: Fonts.arabicBold,
      fontSize: 22,
      lineHeight: 46,
      color: colors.textPrimary,
      textAlign: 'right',
      writingDirection: 'rtl',
    },
    hairline: { height: 1, marginVertical: Spacing.sm },
    transliteration: {
      fontFamily: Fonts.medium,
      fontSize: 12.5,
      lineHeight: 19,
      fontStyle: 'italic',
      color: colors.textMuted,
    },

    blockLabel: {
      fontFamily: Fonts.extraBold,
      fontSize: 9.5,
      lineHeight: 13,
      letterSpacing: 1,
      marginBottom: 2,
    },
    urduBody: {
      fontFamily: Fonts.urdu,
      fontSize: 15,
      lineHeight: 32,
      color: colors.textPrimary,
      textAlign: 'right',
      writingDirection: 'rtl',
    },
    englishBody: {
      fontFamily: Fonts.medium,
      fontSize: 13.5,
      lineHeight: 20,
      color: colors.textSecondary,
    },

    detail: {
      fontFamily: Fonts.medium,
      fontSize: 13.5,
      lineHeight: 21,
      color: colors.textSecondary,
      marginTop: Spacing.md,
    },
    detailUrdu: {
      fontFamily: Fonts.urdu,
      fontSize: 14,
      lineHeight: 32,
      color: colors.textPrimary,
      textAlign: 'right',
      writingDirection: 'rtl',
    },

    note: {
      borderRadius: Radius.md,
      borderWidth: 1,
      padding: Spacing.md,
      marginTop: Spacing.md,
    },
    noteLabel: {
      fontFamily: Fonts.extraBold,
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    noteText: {
      fontFamily: Fonts.semiBold,
      fontSize: 13,
      lineHeight: 19,
      color: colors.textPrimary,
    },
  });

export default React.memo(IslamicCard);
