import { Audio } from 'expo-av';

export type StoredEpisode = {
  id: string;
  title: string;
  description?: string;
  published_at?: string;
  audio_url?: string;
  duration?: string;
};

type PlayerStore = {
  sound: Audio.Sound | null;
  episode: StoredEpisode | null;
};

export const podcastPlayerStore: PlayerStore = {
  sound: null,
  episode: null,
};

export function persistPodcastPlayer(sound: Audio.Sound, episode: StoredEpisode): void {
  podcastPlayerStore.sound = sound;
  podcastPlayerStore.episode = episode;
}

export function clearPodcastPlayerStore(): void {
  podcastPlayerStore.sound = null;
  podcastPlayerStore.episode = null;
}
