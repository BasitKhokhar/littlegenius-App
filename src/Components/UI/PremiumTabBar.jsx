import React, { useEffect, useRef } from 'react';
import { View, Pressable, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../Context/ThemeContext';
import { useTabBarVisibility } from '../../Context/TabBarContext';
import { Radius, Layout, Colors, coloredShadow } from '../../Theme';

// ──────────────────────────────────────────────────────────────
// PremiumTabBar — floating glass pill bar with a carved notch. Re-skins
// per theme (BAR_THEME) so it reads as a premium surface in both light and
// dark mode instead of one flat colour forced across both.
// The ACTIVE tab lifts out of the bar as a raised gradient circle, and the
// bar shows a round CUT-OUT directly beneath it (a bg/glow-coloured disc
// that "bites" a hole into the pill) — the notch slides to whichever tab
// is selected. Its label sits underneath inside the bar. Inactive tabs are
// plain themed glyphs. Spring animation on selection + light haptics. Used
// via the `tabBar` prop of the bottom-tab navigator so we own every pixel.
// ──────────────────────────────────────────────────────────────

// Route → vector icon (filled when active, outline when idle).
// Islamic uses MaterialCommunityIcons — Ionicons has no mosque glyph.
const ICONS = {
  Home: { Icon: Ionicons, active: 'home', inactive: 'home-outline' },
  Stories: { Icon: Ionicons, active: 'book', inactive: 'book-outline' },
  Islamic: { Icon: MaterialCommunityIcons, active: 'mosque', inactive: 'mosque-outline' },
  Games: { Icon: Ionicons, active: 'game-controller', inactive: 'game-controller-outline' },
  Settings: { Icon: Ionicons, active: 'settings', inactive: 'settings-outline' },
};

const ROW_H = Layout.tabBarHeight; // inner height of the bar's tab row
const RAISE = 22; // how far the active circle pokes above the bar
const CIRCLE = 52; // raised circle diameter
const NOTCH = 66; // cut-out diameter (leaves a thin ring around the circle)
const ICON_SIZE_ACTIVE = 23;
const ICON_SIZE_IDLE = 22;

// The pill is a frosted-glass gradient surface that swaps palette by theme
// so it reads as premium in both — a soft white-on-white gradient with a
// faint indigo edge in light mode, and a glowing indigo-glass panel (tinted
// gradient + luminous border + indigo shadow) in dark mode, rather than
// forcing one flat colour regardless of theme.
const BAR_THEME = {
  light: {
    // Soft lilac-tinted glass instead of flat white — keeps text/icon
    // contrast (both are deep indigo) while giving the pill an actual
    // colour instead of reading as a plain white bar.
    gradient: ['#F6F1FF', '#E6DAFB'],
    sheen: ['rgba(255,255,255,0.85)', 'rgba(255,255,255,0)'],
    border: 'rgba(139,92,246,0.22)',
    shadowColor: '#6D28D9',
    shadowOpacity: 0.24,
    iconOn: '#FFFFFF',
    idle: 'rgba(30,27,75,0.55)',
    label: '#1E1B4B',
    ring: null, // falls back to colors.bg — blends with the light screen
  },
  dark: {
    gradient: ['#282350', '#15122E'],
    sheen: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)'],
    border: 'rgba(129,140,248,0.34)',
    shadowColor: '#6366F1',
    shadowOpacity: 0.5,
    iconOn: '#FFFFFF',
    idle: 'rgba(199,197,218,0.7)',
    label: '#EDEBFC',
    ring: 'rgba(129,140,248,0.32)', // soft indigo glow halo, not a flat disc
  },
};

// Same gradient/tint the rest of the app uses for primary CTAs (Button.jsx,
// GradientCard) — keeps the raised circle visually consistent with the
// app's existing "premium depth" system instead of a one-off flat fill.
const CIRCLE_GRADIENT = Colors.gradients.cta;
// 'xl' instead of 'lg' — a deeper, wider-spread shadow reads as the circle
// genuinely floating/glowing above the bar rather than just sitting on it.
const CIRCLE_SHADOW = coloredShadow(Colors.primary, 'xl');

const TabItem = ({
  focused,
  label,
  icon,
  circleGradient,
  cutoutColor,
  iconOn,
  idleColor,
  labelColor,
  onPress,
}) => {
  // 0 → idle, 1 → active. Drives the lift / scale / notch / label fade.
  const anim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  // Separate tactile press-scale — a quick squash on touch-down, independent
  // of the selection state, so every tab (active or not) feels responsive.
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Bouncier spring (lower friction, higher tension) than a plain settle —
    // gives the circle a springy "pop" as it lifts into the notch.
    Animated.spring(anim, {
      toValue: focused ? 1 : 0,
      friction: 6,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [focused, anim]);

  const onPressIn = () => {
    Animated.spring(press, { toValue: 0.9, friction: 5, tension: 200, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(press, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }).start();
  };

  // The circle rises up into the notch.
  const circleStyle = {
    opacity: anim,
    transform: [
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [RAISE, 0] }) },
      { scale: Animated.multiply(anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }), press) },
    ],
  };
  // The notch stays anchored to the bar and just scales/fades in.
  const notchStyle = {
    opacity: anim,
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
  };
  const idleIconStyle = { opacity: 0.75, transform: [{ scale: press }] };

  const { Icon, active, inactive } = icon;
  const iconName = focused ? active : inactive;

  return (
    <Pressable
      style={styles.item}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      android_ripple={{ color: 'rgba(30,27,75,0.10)', borderless: true, radius: 32 }}
      hitSlop={6}
    >
      {focused ? (
        <>
          {/* Cut-out: a bg-coloured disc that carves a hole into the bar */}
          <Animated.View style={[styles.notch, { backgroundColor: cutoutColor }, notchStyle]} />
          {/* Raised gradient circle sitting in the notch */}
          <Animated.View style={[styles.circle, circleStyle]}>
            <LinearGradient
              colors={circleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.circleFill}
            >
              {/* Warm gold-tinted glass highlight — ties the raised circle to the
                  app's "premium" accent colour instead of a plain white gloss */}
              <LinearGradient
                colors={['rgba(255,247,214,0.55)', 'rgba(255,247,214,0)']}
                pointerEvents="none"
                style={styles.circleSheen}
              />
              <Icon name={iconName} size={ICON_SIZE_ACTIVE} color={iconOn} />
            </LinearGradient>
          </Animated.View>
          <Animated.Text
            numberOfLines={1}
            style={[styles.label, { color: labelColor, opacity: anim }]}
          >
            {label}
          </Animated.Text>
        </>
      ) : (
        <Animated.View style={idleIconStyle}>
          <Icon name={iconName} size={ICON_SIZE_IDLE} color={idleColor} />
        </Animated.View>
      )}
    </Pressable>
  );
};

const PremiumTabBar = ({ state, descriptors, navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { hidden } = useTabBarVisibility();
  const barTheme = isDark ? BAR_THEME.dark : BAR_THEME.light;
  const ringColor = barTheme.ring ?? colors.bg;

  // The bar only belongs on each tab's landing screen. Two ways it goes away:
  //  • AppNavigator sets `tabBarStyle.display = 'none'` for pushed routes.
  //  • A screen rendering an in-place detail calls `useHideTabBar()`.
  const focusedOptions = descriptors[state.routes[state.index].key]?.options;
  if (hidden || focusedOptions?.tabBarStyle?.display === 'none') return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingBottom: insets.bottom > 0 ? insets.bottom / 4 : 2 }]}
    >
      <View
        style={[
          styles.bar,
          { borderColor: barTheme.border, shadowColor: barTheme.shadowColor, shadowOpacity: barTheme.shadowOpacity },
        ]}
      >
        {/* Glass gradient surface — isolated + clipped to the pill's radius so
            it doesn't cut off the raised circle/notch poking above the bar. */}
        <LinearGradient
          colors={barTheme.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.barBg}
          pointerEvents="none"
        />
        {/* Glossy top highlight for the "frosted glass" read. */}
        <LinearGradient colors={barTheme.sheen} pointerEvents="none" style={styles.barSheen} />
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const icon =
            ICONS[route.name] ?? { Icon: Ionicons, active: 'ellipse', inactive: 'ellipse-outline' };

          const onPress = () => {
            Haptics.selectionAsync().catch(() => {});
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              focused={focused}
              label={label}
              icon={icon}
              circleGradient={CIRCLE_GRADIENT}
              cutoutColor={ringColor}
              iconOn={barTheme.iconOn}
              idleColor={barTheme.idle}
              labelColor={barTheme.label}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_H,
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: 6,
    // Soft floating shadow under the pill (colour/opacity set per-theme).
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 16,
  },
  // Absolute-fill gradient layer, clipped to its own radius. Kept separate
  // from `bar` (which stays overflow:visible) so the raised circle + notch
  // can still poke out above the pill without being clipped.
  barBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  barSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: 'hidden',
  },
  item: {
    flex: 1,
    height: ROW_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notch: {
    position: 'absolute',
    // Concentric with the circle (same centre as `circle.top + CIRCLE/2`) so
    // the ring reads as an even-width halo on every side, not just the top.
    top: -RAISE + (CIRCLE - NOTCH) / 2,
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    alignSelf: 'center',
  },
  circle: {
    position: 'absolute',
    top: -RAISE,
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(252,211,77,0.55)', // gold rim (BRAND.gold) — reads as a premium badge
    // Raised look — stronger, indigo-tinted shadow so it "floats" higher.
    ...CIRCLE_SHADOW,
  },
  circleFill: {
    flex: 1,
    borderRadius: CIRCLE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  label: {
    position: 'absolute',
    bottom: 9,
    fontSize: 12,
    fontFamily: 'Baloo2_800ExtraBold',
    letterSpacing: 0.2,
  },
});

export default PremiumTabBar;
