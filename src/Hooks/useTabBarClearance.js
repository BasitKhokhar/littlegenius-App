import { useNavigationState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Layout } from '../Theme';
import { useTabBarVisibility } from '../Context/TabBarContext';

// ──────────────────────────────────────────────────────────────
// useTabBarClearance — bottom padding needed so scrollable content
// clears the floating PremiumTabBar (absolute-positioned pill).
// Bar row is Layout.tabBarHeight tall, floats above the safe-area
// inset with a small gap; `extra` adds breathing room below the
// last card. Use this instead of hardcoded paddingBottom values.
//
// The bar is hidden on drill-down screens (see AppNavigator +
// TabBarContext), and reserving its height there would leave a dead
// strip at the bottom — so those screens only get the safe-area
// inset plus `extra`.
// ──────────────────────────────────────────────────────────────
export const useTabBarClearance = (extra = 24) => {
  const insets = useSafeAreaInsets();
  const { hidden } = useTabBarVisibility();
  // A pushed route inside a tab's stack means the bar is gone. Selecting off
  // the nearest navigator's state keeps this in sync as the user pushes/pops.
  const pushed = useNavigationState((s) => s?.type === 'stack' && s.index > 0);

  if (hidden || pushed) return insets.bottom + extra;
  return Layout.tabBarHeight + 8 + insets.bottom + extra;
};

export default useTabBarClearance;
