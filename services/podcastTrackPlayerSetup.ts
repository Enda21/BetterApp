import { PermissionsAndroid, Platform } from 'react-native';
import TrackPlayer, { AppKilledPlaybackBehavior, Capability } from 'react-native-track-player';

let setupPromise: Promise<void> | null = null;

async function requestAndroidNotificationPermission(): Promise<void> {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return;
  }
  try {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  } catch (e) {
    // permission denied or unavailable; media notification just won't show
  }
}

export async function setupPodcastPlayer(): Promise<void> {
  if (!setupPromise) {
    setupPromise = (async () => {
      await requestAndroidNotificationPermission();

      await TrackPlayer.setupPlayer({
        autoHandleInterruptions: true,
      });

      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SeekTo,
          Capability.JumpForward,
          Capability.JumpBackward,
          Capability.Stop,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause, Capability.JumpForward],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SeekTo,
          Capability.JumpForward,
          Capability.JumpBackward,
        ],
        forwardJumpInterval: 30,
        backwardJumpInterval: 10,
        progressUpdateEventInterval: 1,
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
      });
    })().catch((err) => {
      // Allow a retry on next call if setup failed (e.g. called while backgrounded on Android)
      setupPromise = null;
      throw err;
    });
  }

  return setupPromise;
}
