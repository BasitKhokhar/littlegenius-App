import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// ──────────────────────────────────────────────────────────────
// TabBarContext — lets a screen hide the floating PremiumTabBar.
//
// Most drill-downs are real pushed routes, and AppNavigator already hides
// the bar for those (see `tabStackOptions`). But a few screens render their
// detail view IN PLACE instead of pushing a route (Stories flips to a story
// with local state), so the navigation state still says "root screen" while
// the user is really one level deeper. Those screens call `useHideTabBar()`.
//
// We count requests rather than storing a boolean so two overlapping screens
// can never un-hide each other on unmount.
// ──────────────────────────────────────────────────────────────

const NOOP = () => {};
const FALLBACK = { hidden: false, requestHide: NOOP, releaseHide: NOOP };

const TabBarContext = createContext(FALLBACK);

export const TabBarProvider = ({ children }) => {
  const [hideCount, setHideCount] = useState(0);

  const requestHide = useCallback(() => setHideCount((c) => c + 1), []);
  const releaseHide = useCallback(() => setHideCount((c) => Math.max(0, c - 1)), []);

  const value = useMemo(
    () => ({ hidden: hideCount > 0, requestHide, releaseHide }),
    [hideCount, requestHide, releaseHide],
  );

  return <TabBarContext.Provider value={value}>{children}</TabBarContext.Provider>;
};

export const useTabBarVisibility = () => useContext(TabBarContext);

// Hide the bar while `hide` is true AND this screen is focused. The focus
// guard matters: a background screen that still holds a detail open must not
// keep the bar hidden for whatever screen the user is actually looking at.
export const useHideTabBar = (hide = true) => {
  const { requestHide, releaseHide } = useTabBarVisibility();

  useFocusEffect(
    useCallback(() => {
      if (!hide) return undefined;
      requestHide();
      return releaseHide;
    }, [hide, requestHide, releaseHide]),
  );
};

export default TabBarContext;
