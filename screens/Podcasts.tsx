import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';

type Episode = {
  id: string;
  title: string;
  description?: string;
  published_at?: string;
  audio_url?: string;
  duration?: string;
};

export default function Podcasts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [filteredEpisodes, setFilteredEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingEpisodeId, setPlayingEpisodeId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isBuffering, setIsBuffering] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentOffsetRef = useRef(0);

  useEffect(() => {
    fetchEpisodes();
    
    // Set up audio mode
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      // Clean up sound on unmount or when sound changes
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = episodes.filter((ep) =>
        ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEpisodes(filtered);
    } else {
      setFilteredEpisodes(episodes);
    }
  }, [searchQuery, episodes]);

  const fetchEpisodes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch episodes - add show_id if you know it, or fetch all episodes you have access to
      const response = await fetch('https://api.transistor.fm/v1/episodes?pagination[per]=100&status=published', {
        headers: {
          'x-api-key': 'rcQeJqRa73GezCwckzvrqQ',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch episodes: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform JSON:API format to our Episode type
      const transformedEpisodes: Episode[] = (data.data || []).map((item: any) => ({
        id: item.id,
        title: item.attributes?.title || 'Untitled',
        description: item.attributes?.summary || item.attributes?.description || '',
        published_at: item.attributes?.published_at,
        audio_url: item.attributes?.media_url,
        duration: item.attributes?.duration_in_mmss,
      }));
      
      setEpisodes(transformedEpisodes);
      setFilteredEpisodes(transformedEpisodes);
    } catch (err) {
      console.error('Error fetching episodes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load episodes');
    } finally {
      setLoading(false);
    }
  };


  const playEpisode = async (episode: Episode) => {
    try {
      // Stop current sound if playing
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // If clicking the same episode, just stop
      if (playingEpisodeId === episode.id) {
        setPlayingEpisodeId(null);
        setPlaybackPosition(0);
        setPlaybackDuration(0);
        return;
      }

      // Load and play new episode
      if (episode.audio_url) {
        setIsBuffering(true);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: episode.audio_url },
          { shouldPlay: true, rate: playbackRate }
        );
        setSound(newSound);
        setPlayingEpisodeId(episode.id);
        setIsPlaying(true);
        setIsBuffering(false);

        // Set up playback status update
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPlaybackPosition(status.positionMillis);
            setPlaybackDuration(status.durationMillis || 0);
            setIsBuffering(status.isBuffering);
            setIsPlaying(status.isPlaying);
            
            if (status.didJustFinish) {
              setPlayingEpisodeId(null);
              setIsPlaying(false);
              setPlaybackPosition(0);
            }
          }
        });
      }
    } catch (err) {
      console.error('Error playing episode:', err);
      setPlayingEpisodeId(null);
      setIsBuffering(false);
    }
  };

  const pauseEpisode = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resumeEpisode = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const seekTo = async (position: number) => {
    if (sound) {
      await sound.setPositionAsync(position);
    }
  };

  const rewindTenSeconds = async () => {
    if (sound && playbackPosition >= 10000) {
      await sound.setPositionAsync(playbackPosition - 10000);
    } else if (sound) {
      await sound.setPositionAsync(0);
    }
  };

  const skipThirtySeconds = async () => {
    if (sound && playbackDuration > 0) {
      const newPosition = Math.min(playbackPosition + 30000, playbackDuration);
      await sound.setPositionAsync(newPosition);
    }
  };

  const changePlaybackSpeed = async (rate: number) => {
    setPlaybackRate(rate);
    if (sound) {
      await sound.setRateAsync(rate, true);
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  };

  const renderEpisode = useCallback(({ item }: { item: Episode }) => {
    const isCurrentEpisode = playingEpisodeId === item.id;
    const cleanDescription = item.description ? stripHtml(item.description) : '';
    
    return (
      <View style={styles.episodeCard}>
        {/* Logo in top left corner */}
        <Image 
          source={require('../assets/KMFpODCAST.png')} 
          style={styles.episodeLogo}
          resizeMode="contain"
        />
        
        <View style={styles.episodeContent}>
          <Text style={styles.episodeTitle}>{item.title}</Text>
          {cleanDescription && (
            <Text style={styles.episodeDescription} numberOfLines={2}>
              {cleanDescription}
            </Text>
          )}
        <View style={styles.episodeMetaRow}>
          {item.published_at && (
            <Text style={styles.episodeDate}>
              {new Date(item.published_at).toLocaleDateString()}
            </Text>
          )}
          {item.duration && (
            <Text style={styles.episodeDuration}>{item.duration}</Text>
          )}
        </View>
        
        {/* Playback Controls */}
        {item.audio_url && (
          <View style={styles.playerContainer}>
            {/* Play/Pause Button */}
            <TouchableOpacity 
              style={styles.playButton}
              onPress={() => isPlaying ? pauseEpisode() : (isCurrentEpisode ? resumeEpisode() : playEpisode(item))}
            >
              <Text style={styles.playButtonText}>
                {isBuffering && isCurrentEpisode ? '...' : (isPlaying ? '⏸' : '▶')}
              </Text>
            </TouchableOpacity>

            {/* Timeline Slider - only show for current episode */}
            {isCurrentEpisode && (
              <View style={styles.timelineContainer}>
                <View style={styles.sliderRow}>
                  <Text style={styles.timeText}>{formatTime(playbackPosition)}</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={playbackDuration}
                    value={playbackPosition}
                    onSlidingComplete={(value) => seekTo(value)}
                    minimumTrackTintColor="#4B3BE7"
                    maximumTrackTintColor="#ddd"
                    thumbTintColor="#4B3BE7"
                  />
                  <Text style={styles.timeText}>{formatTime(playbackDuration)}</Text>
                </View>

                {/* Controls Row */}
                <View style={styles.controlsRow}>
                  {/* Rewind 10 seconds */}
                  <TouchableOpacity 
                    style={styles.controlButton}
                    onPress={rewindTenSeconds}
                  >
                    <Text style={styles.controlButtonText}>⏪ 10s</Text>
                  </TouchableOpacity>

                  {/* Speed Control */}
                  <View style={styles.speedControls}>
                    {[1.0, 1.25, 1.5, 2.0].map((rate) => (
                      <TouchableOpacity
                        key={rate}
                        style={[
                          styles.speedButton,
                          playbackRate === rate && styles.speedButtonActive
                        ]}
                        onPress={() => changePlaybackSpeed(rate)}
                      >
                        <Text style={[
                          styles.speedButtonText,
                          playbackRate === rate && styles.speedButtonTextActive
                        ]}>
                          {rate}x
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Skip 30 seconds */}
                  <TouchableOpacity 
                    style={styles.controlButton}
                    onPress={skipThirtySeconds}
                  >
                    <Text style={styles.controlButtonText}>⏩ 30s</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
        </View>
      </View>
    );
  }, [playingEpisodeId, isPlaying, isBuffering, playbackPosition, playbackDuration, playbackRate, pauseEpisode, resumeEpisode, playEpisode, seekTo, rewindTenSeconds, skipThirtySeconds, changePlaybackSpeed]);

  const renderHeader = useMemo(() => (
    <>
      <Text style={styles.header}>The Be Better Man Private Podcasts</Text>

      {/* Latest Episode */}
      <Text style={styles.sectionHeader}>Latest Episode</Text>
      <View style={styles.webviewContainer}>
        <WebView
          source={{ uri: 'https://share.transistor.fm/e/the-unstoppable-male-academy-private-channel/latest' }}
          style={{ height: 180, width: '100%' }}
          scrollEnabled={false}
          javaScriptEnabled={true}
          androidLayerType="hardware"
          androidHardwareAccelerationDisabled={false}
          renderLoading={() => <ActivityIndicator size="small" color="#4B3BE7" />}
          startInLoadingState={true}
        />
      </View>

      {/* All Episodes Section */}
      <View style={styles.allEpisodesContainer}>
        <Text style={styles.sectionHeader}>All Episodes</Text>

        {/* Episodes List Loading/Error States */}
        {loading && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#4B3BE7" />
            <Text style={styles.loadingText}>Loading episodes...</Text>
          </View>
        )}
        {!loading && error && (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchEpisodes} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        {!loading && !error && filteredEpisodes.length === 0 && (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No episodes found' : 'No episodes available'}
            </Text>
          </View>
        )}
      </View>
    </>
  ), [loading, error, filteredEpisodes.length, searchQuery, fetchEpisodes]);

  return (
    <View style={styles.container}>
      {/* Search Field at Top */}
      <View style={styles.topSearchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search episodes..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={!loading && !error && filteredEpisodes.length > 0 ? filteredEpisodes : []}
        renderItem={renderEpisode}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        onScroll={(event) => {
          currentOffsetRef.current = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingBottom: 20 },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16, backgroundColor: '#F1EFE7' },
  topSearchContainer: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 0,
    backgroundColor: '#F1EFE7',
    zIndex: 10,
  },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#1A1A1A', textAlign: 'center', marginTop: 16 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1A1A1A', textAlign: 'center', marginTop: 8 },
  webviewContainer: { width: '100%', maxWidth: 640, marginBottom: 16, alignSelf: 'center' },
  allEpisodesContainer: { 
    width: '100%', 
    maxWidth: 640, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 16, 
    alignSelf: 'center', 
    marginBottom: 16,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#1A1A1A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  episodeCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4B3BE7',
    marginHorizontal: 16,
    maxWidth: 640,
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  episodeLogo: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 4,
  },
  episodeContent: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  episodeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  episodeMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  episodeDate: {
    fontSize: 12,
    color: '#999',
  },
  episodeDuration: {
    fontSize: 12,
    color: '#4B3BE7',
    fontWeight: '600',
  },
  playerContainer: {
    marginTop: 8,
  },
  playButton: {
    backgroundColor: '#4B3BE7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    alignItems: 'center',
    alignSelf: 'flex-start',
    minWidth: 60,
  },
  playButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  timelineContainer: {
    marginTop: 12,
    width: '100%',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  timeText: {
    fontSize: 11,
    color: '#666',
    minWidth: 40,
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 8,
    gap: 6,
    flexWrap: 'wrap',
  },
  controlButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  controlButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  speedControls: {
    flexDirection: 'row',
    gap: 3,
    justifyContent: 'center',
  },
  speedButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
    minWidth: 38,
    alignItems: 'center',
  },
  speedButtonActive: {
    backgroundColor: '#4B3BE7',
  },
  speedButtonText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  speedButtonTextActive: {
    color: '#fff',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#b00',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4B3BE7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
