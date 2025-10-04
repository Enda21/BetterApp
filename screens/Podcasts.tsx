import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';

type Episode = { id: string; title: string; uri: string };

const defaultEpisodes: Episode[] = [
  { id: 'ep1', title: 'Sample Podcast 1', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'ep2', title: 'Sample Podcast 2', uri: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3' },
];

export default function Podcasts() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [episodesState, setEpisodesState] = useState<Episode[]>(defaultEpisodes);

  async function checkUrlPlayable(uri: string) {
    try {
      // Try HEAD first
      let res = await fetch(uri, { method: 'HEAD' });
      if (!res || !res.status) {
        // fallback to small GET if HEAD not supported
        res = await fetch(uri, { method: 'GET', headers: { Range: 'bytes=0-1' } });
      }
      if (!res.ok) return { ok: false, status: res.status, contentType: res.headers?.get ? res.headers.get('content-type') : undefined };
      return { ok: true, status: res.status, contentType: res.headers?.get ? res.headers.get('content-type') : undefined };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
      playThroughEarpieceAndroid: false,
    });

  loadEpisode(current);

    return () => {
      unloadSound();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // when current changes, load the new episode and start paused
    loadEpisode(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  async function loadEpisode(idx: number) {
    try {
    const uri = episodesState[idx]?.uri;
      // If the URI isn't a direct audio file (mp3/m4a/ogg/opus/wav/aac), don't try to load with expo-av.
      // This avoids the "None of the available extractors could read the stream" errors you saw
      // when passing YouTube Music page URLs.
      if (!/\.(mp3|m4a|aac|wav|ogg|opus)$/i.test(uri)) {
        setLoadError('This link does not point to a direct audio file and cannot be played in-app. Open in browser to listen.');
        return;
      }
      // Preflight check to catch 404s and non-audio content-types early
      const chk = await checkUrlPlayable(uri);
      if (!chk.ok) {
        if (chk.status === 404) setLoadError('Audio not found (404). Try a different episode.');
        else if (chk.contentType && !/audio\//i.test(chk.contentType)) setLoadError(`Remote file not recognized as audio (content-type: ${chk.contentType}).`);
        else setLoadError(`Unable to load audio (status: ${chk.status || 'error'}).`);
        return;
      }
      setLoadError(null);
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current.setOnPlaybackStatusUpdate(null);
        soundRef.current = null;
      }
      const { sound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false, progressUpdateIntervalMillis: 500 },
        onPlaybackStatus
      );
      soundRef.current = sound;
      if (status) {
        setIsPlaying(status.isPlaying ?? false);
        setPosition(status.positionMillis ?? 0);
        setDuration(status.durationMillis ?? 0);
      }
    } catch (e) {
      console.warn('Failed to load audio', e);
      setLoadError(String(e));
    }
  }

  function onPlaybackStatus(status: any) {
    if (!status) return;
    setIsPlaying(status.isPlaying ?? false);
    setPosition(status.positionMillis ?? 0);
    setDuration(status.durationMillis ?? 0);
  }

  async function unloadSound() {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current.setOnPlaybackStatusUpdate(null);
        soundRef.current = null;
      }
    } catch (e) {
      // ignore
    }
  }

  async function togglePlayPause() {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }

  async function seekBy(seconds: number) {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    let next = (status.positionMillis ?? 0) + seconds * 1000;
    next = Math.max(0, next);
    if (status.durationMillis) next = Math.min(next, status.durationMillis);
    await soundRef.current.setPositionAsync(next);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Podcasts Coming soon!</Text>
      <View style={{ marginBottom: 12 }}>
        <View style={styles.list}>
          {episodesState.map((ep: Episode, i: number) => (
            <TouchableOpacity key={ep.id} style={[styles.item, i === current && styles.active]} onPress={() => setCurrent(i)}>
              <Text style={styles.title}>{ep.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.player}>
  <Text style={styles.now}>{episodesState[current]?.title}</Text>
        <View>
          {loadError ? (
            <View style={{ padding: 12 }}>
              <Text style={{ color: '#b00', marginBottom: 8 }}>{loadError}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => loadEpisode(current)} style={[styles.play, { backgroundColor: '#4B3BE7', marginRight: 8 }]}> 
                  <Text style={{ color: '#fff' }}>Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setCurrent((c) => Math.min(c + 1, episodesState.length - 1))} style={[styles.play, { backgroundColor: '#666' }]}> 
                  <Text style={{ color: '#fff' }}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.controls}>
                <TouchableOpacity onPress={() => seekBy(-15)} style={styles.ctrl}>
                  <Text>« 15s</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={togglePlayPause} style={styles.play}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{isPlaying ? 'Pause' : 'Play'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => seekBy(15)} style={styles.ctrl}>
                  <Text>15s »</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.time}>{msToTime(position)} / {msToTime(duration)}</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

function msToTime(ms: number) {
  if (!ms) return '0:00';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 64, backgroundColor: '#F1EFE7', alignItems: 'center' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#1A1A1A', textAlign: 'center' },
  list: { marginBottom: 12, width: '100%', maxWidth: 640 },
  item: { padding: 12, backgroundColor: '#fff', borderRadius: 8, marginBottom: 8, width: '100%' },
  active: { borderColor: '#4B3BE7', borderWidth: 2 },
  title: { color: '#111' },
  player: { padding: 12, backgroundColor: '#fff', borderRadius: 8, width: '100%', maxWidth: 640 },
  now: { fontSize: 16, marginBottom: 8, textAlign: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ctrl: { padding: 8 },
  play: { backgroundColor: '#4B3BE7', padding: 10, borderRadius: 6 },
  time: { textAlign: 'center', color: '#333' }
});
