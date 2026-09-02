// Global mocks for the Better app test suite.
// This file runs via setupFiles (before the test framework),
// so avoid calling expect() here.

// ─── React Native Track Player ───────────────────────────────────────────────
jest.mock('react-native-track-player', () => {
  const State = {
    None: 'none',
    Ready: 'ready',
    Playing: 'playing',
    Paused: 'paused',
    Stopped: 'stopped',
    Buffering: 'buffering',
    Loading: 'loading',
    Error: 'error',
    Ended: 'ended',
  };
  const Event = {
    PlaybackError: 'playback-error',
    PlaybackQueueEnded: 'playback-queue-ended',
    PlaybackState: 'playback-state',
    PlaybackActiveTrackChanged: 'playback-active-track-changed',
  };
  return {
    __esModule: true,
    default: {
      setupPlayer: jest.fn().mockResolvedValue(undefined),
      add: jest.fn().mockResolvedValue(undefined),
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn().mockResolvedValue(undefined),
      reset: jest.fn().mockResolvedValue(undefined),
      seekTo: jest.fn().mockResolvedValue(undefined),
      setRate: jest.fn().mockResolvedValue(undefined),
      getActiveTrack: jest.fn().mockResolvedValue(null),
      getPlaybackState: jest.fn().mockResolvedValue({ state: State.None }),
      updateOptions: jest.fn().mockResolvedValue(undefined),
      registerPlaybackService: jest.fn(),
    },
    State,
    Event,
    Capability: { Play: 'play', Pause: 'pause', SeekTo: 'seek-to' },
    usePlaybackState: jest.fn(() => ({ state: State.None })),
    useProgress: jest.fn(() => ({ position: 0, duration: 0, buffered: 0 })),
    useTrackPlayerEvents: jest.fn(),
    AppKilledPlaybackBehavior: { StopPlaybackAndRemoveNotification: 0 },
  };
});

// ─── React Native WebView ────────────────────────────────────────────────────
jest.mock('react-native-webview', () => {
  const { View, Text } = require('react-native');
  const WebView = ({ testID, onLoadEnd, onLoadStart, source }: any) => {
    if (onLoadStart) setTimeout(onLoadStart, 0);
    if (onLoadEnd) setTimeout(onLoadEnd, 50);
    // Render the URI as hidden text so tests can assert on it
    const uriText = source?.uri ?? '';
    return (
      <View testID={testID}>
        <Text testID={testID ? `${testID}-uri` : undefined}>{uriText}</Text>
      </View>
    );
  };
  return { WebView };
});

// ─── @expo/vector-icons ──────────────────────────────────────────────────────
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Icon = ({ testID }: any) => React.createElement(View, { testID });
  return { Ionicons: Icon, MaterialCommunityIcons: Icon, Feather: Icon };
});

// ─── expo-constants ──────────────────────────────────────────────────────────
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '1.2.3' } },
}));

// ─── expo-linking ────────────────────────────────────────────────────────────
jest.mock('expo-linking', () => ({
  openURL: jest.fn().mockResolvedValue(undefined),
  canOpenURL: jest.fn().mockResolvedValue(true),
}));

// ─── expo-intent-launcher ───────────────────────────────────────────────────
jest.mock('expo-intent-launcher', () => ({
  openApplication: jest.fn().mockResolvedValue(undefined),
}));

// ─── expo-file-system ────────────────────────────────────────────────────────
jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file:///cache/',
  downloadAsync: jest.fn().mockResolvedValue({ uri: 'file:///cache/document.pdf' }),
}));

// ─── expo-sharing ────────────────────────────────────────────────────────────
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// ─── expo-updates ────────────────────────────────────────────────────────────
jest.mock('expo-updates', () => ({
  checkForUpdateAsync: jest.fn().mockResolvedValue({ isAvailable: false }),
  fetchUpdateAsync: jest.fn().mockResolvedValue({}),
  reloadAsync: jest.fn().mockResolvedValue(undefined),
}));

// ─── @react-native-community/slider ─────────────────────────────────────────
jest.mock('@react-native-community/slider', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => React.createElement(View, { testID: props.testID }),
  };
});

// ─── Internal services & hooks ───────────────────────────────────────────────
jest.mock('./services/podcastTrackPlayerSetup', () => ({
  setupPodcastPlayer: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('./services/firebaseAnalytics', () => ({
  enableFirebaseAnalytics: jest.fn().mockResolvedValue(undefined),
  logFirebaseScreenView: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('./hooks/useAppUpdate', () => ({
  useAppUpdate: jest.fn(() => ({
    updateAvailable: false,
    latestVersion: '1.2.3',
    openStore: jest.fn(),
  })),
}));

jest.mock('./utils/requestSkoolAccountDeletion', () => ({
  requestSkoolAccountDeletionAfterModal: jest.fn().mockResolvedValue(undefined),
}));

// ─── Global fetch mock (podcasts API) ────────────────────────────────────────
global.fetch = jest.fn();
