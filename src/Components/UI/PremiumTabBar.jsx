import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../../Context/ThemeContext';
import { Radius } from '../../Theme';

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

// Route → emoji glyph (keeps screens icon-agnostic).
const ICONS = {
  Home: '🏠',
  Stories: '📚',
  Islamic: '🕌',
  Games: '🧠',
  Settings: '⚙️',
};

const ROW_H = 60; // inner height of the bar's tab row
const RAISE = 26; // how far the active circle pokes above the bar
const CIRCLE = 54; // raised circle diameter
const NOTCH = 66; // cut-out diameter (leaves a thin ring around the circle)

// The pill is ALWAYS light — it must read the same in light & dark mode.
// In dark mode the themed `surface`/`textPrimary` tokens go near-black,
// which sinks the bar into the screen and kills its contrast, so we pin
// the bar's own colours to fixed light values regardless of theme.
const BAR_LIGHT = {
  surface: '#FFFFFF', // white pill
  circle: '#1E1B4B', // deep-indigo raised circle
  iconOn: '#FFFFFF', // glyph on the indigo circle
  idle: '#1E1B4B', // inactive glyph
  label: '#1E1B4B', // active label
  shadow: '#000000',
};

const TabItem = ({
  focused,
  label,
  icon,
  circleColor,
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

  return (
    <Pressable
      style={styles.item}
      onPress={onPress}
      android_ripple={{ color: 'rgba(30,27,75,0.10)', borderless: true, radius: 38 }}
      hitSlop={6}
    >
      {focused ? (
        <>
          {/* Cut-out: a bg-coloured disc that carves a hole into the bar */}
          <Animated.View style={[styles.notch, { backgroundColor: cutoutColor }, notchStyle]} />
          {/* Raised dark circle sitting in the notch */}
          <Animated.View style={[styles.circle, { backgroundColor: circleColor }, circleStyle]}>
            <Text style={[styles.circleIcon, { color: iconOn }]}>{icon}</Text>
          </Animated.View>
          <Animated.Text
            numberOfLines={1}
            style={[styles.label, { color: labelColor, opacity: anim }]}
          >
            {label}
          </Animated.Text>
        </>
      ) : (
        <Text style={[styles.idleIcon, { color: idleColor }]}>{icon}</Text>
      )}
    </Pressable>
  );
};

const PremiumTabBar = ({ state, descriptors, navigation }) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

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
          const icon = ICONS[route.name] ?? '•';

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
              circleColor={BAR_LIGHT.circle}
              cutoutColor={colors.bg}
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
    top: -(NOTCH / 2) + 1, // centre aligned with the resting circle centre
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
    alignItems: 'center',
    justifyContent: 'center',
    // Raised look — stronger shadow than the bar so it "floats" higher.
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  circleIcon: {
    fontSize: 24,
  },
  label: {
    position: 'absolute',
    bottom: 9,
    fontSize: 12,
    fontFamily: 'Baloo2_800ExtraBold',
    letterSpacing: 0.2,
  },
  idleIcon: {
    fontSize: 23,
    opacity: 0.75,
  },
});

export default PremiumTabBar;
