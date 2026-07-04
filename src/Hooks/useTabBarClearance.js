import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Layout } from '../Theme';

// ──────────────────────────────────────────────────────────────
// useTabBarClearance — bottom padding needed so scrollable content
// clears the floating PremiumTabBar (absolute-positioned pill).
// Bar row is Layout.tabBarHeight tall, floats above the safe-area
// inset with a small gap; `extra` adds breathing room below the
// last card. Use this instead of hardcoded paddingBottom values.
// ──────────────────────────────────────────────────────────────
export const useTabBarClearance = (extra = 24) => {
  const insets = useSafeAreaInsets();
  return Layout.tabBarHeight + 8 + insets.bottom + extra;
};

export default useTabBarClearance;
