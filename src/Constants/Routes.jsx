// Route / screen name constants — single source of truth for navigation

export const ROUTES = {
  // Auth / Onboarding Stack (no login — static offline profile)
  AUTH: {
    ONBOARDING:'Onboarding',
    PROFILE:   'ProfileSetup',
  },

  // Main / App Stack
  APP: {
    HOME:    'Home',
    PROFILE: 'Profile',
    SETTINGS:'Settings',
    DETAILS: 'Details',
  },

  // Bottom Tab Navigator names
  TABS: {
    HOME:    'HomeTab',
    SEARCH:  'SearchTab',
    SAVED:   'SavedTab',
    PROFILE: 'ProfileTab',
  },
};
