// App-wide constants

export const APP_NAME = 'NewsAtWall';
export const APP_VERSION = '1.0.0';

// AsyncStorage / SecureStore Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@newsatwall/auth_token',
  USER_DATA:  '@newsatwall/user_data',
  ONBOARDED:  '@newsatwall/onboarded',
  THEME:      '@newsatwall/theme',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'DD MMM YYYY',
  API: 'YYYY-MM-DD',
  FULL: 'DD MMM YYYY, hh:mm A',
};
