import TrackPlayer, { Event } from 'react-native-track-player';

export default async function trackPlayerService(): Promise<void> {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.pause());

  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    TrackPlayer.seekTo(event.position);
  });

  TrackPlayer.addEventListener(Event.RemoteJumpForward, async (event) => {
    const { position } = await TrackPlayer.getProgress();
    await TrackPlayer.seekTo(position + event.interval);
  });

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async (event) => {
    const { position } = await TrackPlayer.getProgress();
    await TrackPlayer.seekTo(Math.max(0, position - event.interval));
  });

  TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
    if (event.paused || event.permanent) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  });
}
