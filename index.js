import { registerRootComponent } from 'expo';
import * as Sentry from '@sentry/react-native';
import App from './App';
import AppErrorBoundary from './src/Components/Common/AppErrorBoundary';
import { initCrashReporting } from './src/Services/crashReporting';

initCrashReporting();

function Root() {
  return (
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  );
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately.
registerRootComponent(Sentry.wrap(Root));
