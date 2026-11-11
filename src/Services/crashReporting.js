import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';

let initialized = false;
let reportingEnabled = false;

export function initCrashReporting() {
  if (initialized) return;

  const dsn = Constants.expoConfig?.extra?.SENTRY_DSN;
  reportingEnabled = Boolean(dsn) && !__DEV__;

  Sentry.init({
    dsn,
    enabled: reportingEnabled,
    environment: __DEV__ ? 'development' : 'production',
    attachStacktrace: true,
    enableNative: true,
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
  });

  Sentry.setTags({
    app_name: Constants.expoConfig?.name || 'Little Genius',
    app_version: Constants.expoConfig?.version || 'unknown',
    audience: 'children',
  });

  initialized = true;
}

export function reportBoundaryError(error, componentStack) {
  if (!reportingEnabled) return null;

  let eventId = null;
  Sentry.withScope((scope) => {
    scope.setTag('error_boundary', 'root');
    scope.setLevel('fatal');
    if (componentStack) scope.setContext('react', { componentStack });
    eventId = Sentry.captureException(error);
  });

  return eventId;
}
