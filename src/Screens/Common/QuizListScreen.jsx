import React, { useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Animated,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { quizPacksByModule } from '../../Data/quizPacksData';
import { getQuizBank } from '../../Utils/quizGenerators';
import { shadeColor } from '../../Utils/colorHelpers';
import { Header } from '../../Components/UI';
import { useThemeColors } from '../../Context/ThemeContext';
import { useTabBarClearance } from '../../Hooks';
import { Spacing, Radius, Motion, coloredShadow } from '../../Theme';

// ──────────────────────────────────────────────────────────────
// QuizPackCard — premium gradient tile for a single quiz pack
// ("Letter Match", "Word Match", …). Two-stop gradient built from the
// pack's own accent colour, a soft emoji medallion, a question-count
// pill and a circular "go" button — the same cartoon-premium language
// as the mini-game cards, applied to the quiz picker.
// ──────────────────────────────────────────────────────────────
const QuizPackCard = ({ pack, bankSize, index, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      delay: Math.min(index, 6) * Motion.stagger,
      ...Motion.timing.base,
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  const pressIn = () =>
    Animated.spring(scale, { toValue: Motion.pressScale, useNativeDriver: true, ...Motion.spring.soft }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, ...Motion.spring.soft }).start();

  const deep = shadeColor(pack.color, 0.34);

  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [
          { scale },
          { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
        ],
      }}
    >
      <TouchableOpacity
        style={coloredShadow(pack.color, 'md')}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={0.92}
        accessibilityRole="button"
        accessibilityLabel={`${pack.title}. ${pack.description}`}
      >
        <LinearGradient
          colors={[pack.color, deep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.packCard}
        >
          <View style={styles.packDecorBig} pointerEvents="none" />
          <View style={styles.packDecorSmall} pointerEvents="none" />

          <View style={styles.packEmojiBubble}>
            <Text style={styles.packEmoji}>{pack.emoji}</Text>
          </View>

          <View style={styles.packInfo}>
            <Text style={styles.packTitle} numberOfLines={1}>{pack.title}</Text>
            <Text style={styles.packDesc} numberOfLines={2}>{pack.description}</Text>
            <View style={styles.packBadge}>
              <Text style={styles.packBadgeText}>🎯 {bankSize}+ Questions • 10 per round</Text>
            </View>
          </View>

          <View style={styles.packGoBtn}>
            <Text style={styles.packArrow}>→</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const QuizListScreen = ({ navigation, route }) => {
  const { module } = route.params;
  const config = quizPacksByModule[module];
  const colors = useThemeColors();
  const bottomPad = useTabBarClearance();
  const screenStyles = makeScreenStyles(colors);

  if (!config) {
    return (
      <View style={screenStyles.container}>
        <Header title="Quiz" showBack onBackPress={() => navigation.goBack()} />
        <View style={screenStyles.errorWrap}>
          <Text style={screenStyles.errorText}>Quiz not found for this module.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={screenStyles.container}>
      <Header
        title={config.title}
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={[screenStyles.content, { paddingBottom: bottomPad }]} showsVerticalScrollIndicator={false}>
        <Text style={screenStyles.subtitle}>{config.subtitle}</Text>

        {config.packs.map((pack, index) => (
          <QuizPackCard
            key={pack.id}
            pack={pack}
            index={index}
            bankSize={getQuizBank(pack.bankKey).length}
            onPress={() => navigation.navigate('ModuleQuiz', { module, packId: pack.id })}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// Theme-independent card geometry — the gradient supplies its own colour.
const styles = StyleSheet.create({
  packCard: {
    flexDirection: 'row',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
    overflow: 'hidden',
  },
  packDecorBig: {
    position: 'absolute',
    top: -36,
    right: -36,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  packDecorSmall: {
    position: 'absolute',
    bottom: -20,
    right: 50,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  packEmojiBubble: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.26)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  packEmoji: { fontSize: 28, lineHeight: 34, textAlign: 'center' },
  packInfo: { flex: 1, paddingRight: Spacing.sm },
  packTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  packDesc: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
    marginBottom: 9,
    lineHeight: 16,
  },
  packBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: Radius.full,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  packBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  packGoBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  packArrow: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});

const makeScreenStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});

export default QuizListScreen;
