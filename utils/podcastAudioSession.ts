import { Audio } from 'expo-av';
import { InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av/build/Audio.types';

export async function configurePodcastAudioSession(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    shouldDuckAndroid: true,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    playThroughEarpieceAndroid: false,
  });
}
