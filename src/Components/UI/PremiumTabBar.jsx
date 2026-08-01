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
// PremiumTabBar — floating white pill bar with a carved notch.
// The ACTIVE tab lifts out of the bar as a raised dark circle, and the
// bar shows a round CUT-OUT directly beneath it (a background-coloured
// disc that "bites" a hole into the white pill) — the notch slides to
// whichever tab is selected. Its label sits underneath inside the bar.
// Inactive tabs are plain dark glyphs. Spring animation on selection +
// light haptics. Used via the `tabBar` prop of the bottom-tab navigator
// so we own every pixel.
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
const RAISE = 20; // how far the active circle pokes above the bar
const CIRCLE = 46; // raised circle diameter
const NOTCH = 56; // cut-out diameter (leaves a thin ring around the circle)
const ICON_SIZE_ACTIVE = 22;
const ICON_SIZE_IDLE = 22;

// The pill is ALWAYS light — it must read the same in light & dark mode.
// In dark mode the themed `surface`/`textPrimary` tokens go near-black,
// which sinks the bar into the screen and kills its contrast, so we pin
// the bar's own colours to fixed light values regardless of theme.
const BAR_LIGHT = {
  surface: '#FFFFFF', // white pill
  iconOn: '#FFFFFF', // glyph on the indigo circle
  idle: '#1E1B4B', // inactive glyph
  label: '#1E1B4B', // active label
  shadow: '#000000',
};

// Same gradient/tint the rest of the app uses for primary CTAs (Button.jsx,
// GradientCard) — keeps the raised circle visually consistent with the
// app's existing "premium depth" system instead of a one-off flat fill.
const CIRCLE_GRADIENT = Colors.gradients.cta;
const CIRCLE_SHADOW = coloredShadow(Colors.primary, 'lg');

// The "notch" ring around the raised circle. In LIGHT mode it shows the
// soft screen background (`colors.bg`) so it reads as a bite into the pill.
// In DARK mode that bg is near-black and the ring vanishes against the
// dark screen, so we swap to a light periwinkle halo that glows around the
// indigo circle and reads as premium.
const DARK_RING = '#C7D2FE';

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

  useEffect(() => {
    Animated.spring(anim, {
      toValue: focused ? 1 : 0,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [focused, anim]);

  // The circle rises up into the notch.
  const circleStyle = {
    opacity: anim,
    transform: [
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [RAISE, 0] }) },
      { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) },
    ],
  };
  // The notch stays anchored to the bar and just scales/fades in.
  const notchStyle = {
    opacity: anim,
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
  };

  const { Icon, active, inactive } = icon;
  const iconName = focused ? active : inactive;

  return (
    <Pressable
      style={styles.item}
      onPress={onPress}
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
              {/* Glossy top highlight — lilac-tinted (Theme's indigoTint) so it reads
                  as a lit brand surface rather than a plain white gloss */}
              <LinearGradient
                colors={['rgba(237,233,254,0.45)', 'rgba(237,233,254,0)']}
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
        <Icon name={iconName} size={ICON_SIZE_IDLE} color={idleColor} style={styles.idleIcon} />
      )}
    </Pressable>
  );
};

const PremiumTabBar = ({ state, descriptors, navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { hidden } = useTabBarVisibility();
  const ringColor = isDark ? DARK_RING : colors.bg;

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
      <View style={[styles.bar, { backgroundColor: BAR_LIGHT.surface, shadowColor: BAR_LIGHT.shadow }]}>
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
              iconOn={BAR_LIGHT.iconOn}
              idleColor={BAR_LIGHT.idle}
              labelColor={BAR_LIGHT.label}
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
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_H,
    borderRadius: Radius.xl,
    paddingHorizontal: 6,
    // Soft floating shadow under the pill.
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 14,
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
    borderColor: 'rgba(196,181,253,0.45)', // lilac (Theme BRAND.lilac), not plain white
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
  idleIcon: {
    opacity: 0.75,
  },
});

export default PremiumTabBar;
