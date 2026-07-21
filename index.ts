import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

let trackPlayerModule: unknown;
try {
  trackPlayerModule = require('react-native-track-player');
} catch (error) {
  console.error('TrackPlayer is unavailable; skipping playback service registration.', error);
}

const trackPlayerDefault = (
  trackPlayerModule &&
  typeof trackPlayerModule === 'object' &&
  'default' in trackPlayerModule
) ? trackPlayerModule.default : undefined;

if (
  trackPlayerDefault &&
  typeof trackPlayerDefault === 'object' &&
  'registerPlaybackService' in trackPlayerDefault &&
  typeof trackPlayerDefault.registerPlaybackService === 'function'
) {
  trackPlayerDefault.registerPlaybackService(
    () => require('./services/trackPlayerService').default
  );
}
