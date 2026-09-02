import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Image, AppState, AppStateStatus } from 'react-native';
import Slider from '@react-native-community/slider';
import TrackPlayer, { Event, State, usePlaybackState, useProgress, useTrackPlayerEvents } from 'react-native-track-player';
import { setupPodcastPlayer } from '../services/podcastTrackPlayerSetup';

type Episode = {
  id: string;
  title: string;
  description?: string;
  published_at?: string;
  audio_url?: string;
  duration?: string;
  image_url?: string;
};

export default function Podcasts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [filteredEpisodes, setFilteredEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingEpisodeId, setPlayingEpisodeId] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [connectionIssue, setConnectionIssue] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentOffsetRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bufferingWatchdogRef = useRef<NodeJS.Timeout | null>(null);
  const currentEpisodeRef = useRef<Episode | null>(null);
  const playbackPositionRef = useRef(0);
  const retryAttemptRef = useRef(0);
  const userPausedRef = useRef(false);
  const playEpisodeRef = useRef<((ep: Episode, opts?: { startPosition?: number; isReconnect?: boolean }) => Promise<void>) | null>(null);
  const isLoadingTrackRef = useRef(false);

  const rawPlaybackState = usePlaybackState();
  const progress = useProgress(250);

  const playbackState = rawPlaybackState.state;
  const isPlaying = playbackState === State.Playing;
  const isBuffering = playbackState === State.Buffering || playbackState === State.Loading;
  const playbackPosition = progress.position * 1000;
  const playbackDuration = progress.duration * 1000;

  const MAX_RECONNECT_ATTEMPTS = 5;
  const BUFFERING_TIMEOUT_MS = 12000;
  const BASE_RETRY_DELAY_MS = 1000;

  useEffect(() => {
    playbackPositionRef.current = playbackPosition;
  }, [playbackPosition]);

  useEffect(() => {
    fetchEpisodes();

    setupPodcastPlayer()
      .then(() => TrackPlayer.getActiveTrack())
      .then((activeTrack) => {
        if (activeTrack) {
          const restoredEpisode: Episode = {
            id: String(activeTrack.id),
            title: activeTrack.title || '',
            audio_url: typeof activeTrack.url === 'string' ? activeTrack.url : undefined,
            image_url: typeof activeTrack.artwork === 'string' ? activeTrack.artwork : undefined,
          };
          currentEpisodeRef.current = restoredEpisode;
          setPlayingEpisodeId(restoredEpisode.id);
        }
      })
      .catch((err) => console.error('Error setting up podcast player:', err));

    const appStateAudioSub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'active') {
        setupPodcastPlayer().catch(() => {});
      }
    });

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
      appStateAudioSub.remove();
    };
  }, []);

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

  const clearReconnectTimer = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const clearBufferingWatchdog = () => {
    if (bufferingWatchdogRef.current) {
      clearTimeout(bufferingWatchdogRef.current);
      bufferingWatchdogRef.current = null;
    }
  };

  const setRetryAttemptValue = (value: number) => {
    retryAttemptRef.current = value;
    setRetryAttempt(value);
  };

  // Watches native playback state to run the same buffering-stall watchdog
  // that used to live inside expo-av's onPlaybackStatusUpdate callback.
  useEffect(() => {
    if (playbackState === State.Playing) {
      clearBufferingWatchdog();
    }

    if (playbackState === State.Buffering && !bufferingWatchdogRef.current) {
      bufferingWatchdogRef.current = setTimeout(() => {
        if (currentEpisodeRef.current && !userPausedRef.current) {
          const nextAttempt = retryAttemptRef.current + 1;
          if (nextAttempt > MAX_RECONNECT_ATTEMPTS) {
            setIsReconnecting(false);
            setConnectionIssue('Connection issue persists. Tap Reconnect to try again.');
            return;
          }

          setRetryAttemptValue(nextAttempt);
          const delay = Math.min(BASE_RETRY_DELAY_MS * Math.pow(2, nextAttempt - 1), 30000);
          setIsReconnecting(true);
          setConnectionIssue(`Connection stalled. Reconnecting (${nextAttempt}/${MAX_RECONNECT_ATTEMPTS})...`);
          clearReconnectTimer();
          reconnectTimeoutRef.current = setTimeout(() => {
            if (currentEpisodeRef.current?.audio_url) {
              playEpisodeRef.current?.(currentEpisodeRef.current, {
                startPosition: playbackPositionRef.current,
                isReconnect: true,
              });
            }
          }, delay);
        }
      }, BUFFERING_TIMEOUT_MS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackState]);

  useTrackPlayerEvents([Event.PlaybackError, Event.PlaybackQueueEnded], (event) => {
    if (event.type === Event.PlaybackQueueEnded) {
      currentEpisodeRef.current = null;
      userPausedRef.current = false;
      clearReconnectTimer();
      clearBufferingWatchdog();
      setConnectionIssue(null);
      setIsReconnecting(false);
      setRetryAttemptValue(0);
      setPlayingEpisodeId(null);
      playbackPositionRef.current = 0;
      return;
    }

    clearBufferingWatchdog();

    if (currentEpisodeRef.current && !userPausedRef.current) {
      const nextAttempt = retryAttemptRef.current + 1;
      if (nextAttempt > MAX_RECONNECT_ATTEMPTS) {
        setIsReconnecting(false);
        setConnectionIssue('Playback failed after retries. Tap Reconnect to continue.');
        return;
      }

      setRetryAttemptValue(nextAttempt);
      const delay = Math.min(BASE_RETRY_DELAY_MS * Math.pow(2, nextAttempt - 1), 30000);
      setIsReconnecting(true);
      setConnectionIssue(`Playback interrupted. Reconnecting (${nextAttempt}/${MAX_RECONNECT_ATTEMPTS})...`);
      clearReconnectTimer();
      reconnectTimeoutRef.current = setTimeout(() => {
        if (currentEpisodeRef.current?.audio_url) {
          playEpisodeRef.current?.(currentEpisodeRef.current, {
            startPosition: playbackPositionRef.current,
            isReconnect: true,
          });
        }
      }, delay);
    }
  });

  const playEpisode = async (episode: Episode, options?: { startPosition?: number; isReconnect?: boolean }) => {
    // Prevent overlapping loads: multiple triggers (buffering watchdog, AppState
    // resume, playback error, manual Reconnect tap) can each call this around the
    // same time. Without this guard, two concurrent TrackPlayer.add calls could
    // both proceed and race each other.
    if (isLoadingTrackRef.current) {
      return;
    }

    const isStopToggle = !options?.isReconnect && playingEpisodeId === episode.id;

    if (isStopToggle) {
      currentEpisodeRef.current = null;
      setPlayingEpisodeId(null);
      setConnectionIssue(null);
      setIsReconnecting(false);
      clearReconnectTimer();
      clearBufferingWatchdog();
      setRetryAttemptValue(0);
      playbackPositionRef.current = 0;

      try {
        await TrackPlayer.reset();
      } catch (e) {
        // already reset
      }
      return;
    }

    if (!episode.audio_url) {
      return;
    }

    isLoadingTrackRef.current = true;

    try {
      await setupPodcastPlayer();
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: episode.id,
        url: episode.audio_url,
        title: episode.title,
        artist: 'The Be Better Man Podcast',
        artwork: episode.image_url || require('../assets/KMFpODCAST.png'),
      });

      const startPositionSeconds = (options?.startPosition ?? 0) / 1000;
      if (startPositionSeconds > 0) {
        await TrackPlayer.seekTo(startPositionSeconds);
      }
      await TrackPlayer.setRate(playbackRate);
      await TrackPlayer.play();

      setPlayingEpisodeId(episode.id);
      currentEpisodeRef.current = episode;
      userPausedRef.current = false;
      setConnectionIssue(null);
      setIsReconnecting(false);
      clearReconnectTimer();
      clearBufferingWatchdog();
      setRetryAttemptValue(0);
    } catch (err) {
      console.error('Error playing episode:', err);

      if (currentEpisodeRef.current && !userPausedRef.current) {
        const nextAttempt = retryAttemptRef.current + 1;
        if (nextAttempt <= MAX_RECONNECT_ATTEMPTS) {
          setRetryAttemptValue(nextAttempt);
          const delay = Math.min(BASE_RETRY_DELAY_MS * Math.pow(2, nextAttempt - 1), 30000);
          setIsReconnecting(true);
          setConnectionIssue(`Unable to stream. Reconnecting (${nextAttempt}/${MAX_RECONNECT_ATTEMPTS})...`);
          clearReconnectTimer();
          reconnectTimeoutRef.current = setTimeout(() => {
            if (currentEpisodeRef.current?.audio_url) {
              playEpisodeRef.current?.(currentEpisodeRef.current, {
                startPosition: playbackPositionRef.current,
                isReconnect: true,
              });
            }
          }, delay);
        } else {
          setIsReconnecting(false);
          setConnectionIssue('Unable to reconnect. Tap Reconnect to try again.');
        }
      } else {
        setPlayingEpisodeId(null);
      }
    } finally {
      isLoadingTrackRef.current = false;
    }
  };
  playEpisodeRef.current = playEpisode;

  // When app returns to foreground (e.g. user unlocks device), immediately kick off buffer/reconnect
  // if the stream is stalled — so buffering starts right away instead of waiting for next status update
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (nextState !== 'active') return;
      const ep = currentEpisodeRef.current;
      if (!ep?.audio_url || userPausedRef.current) return;

      try {
        const { state } = await TrackPlayer.getPlaybackState();
        if (state === State.Playing) return; // playing fine, no action
      } catch {
        // getPlaybackState failed, assume we need to reconnect
      }

      clearReconnectTimer();
      clearBufferingWatchdog();
      playEpisodeRef.current?.(ep, {
        startPosition: playbackPositionRef.current,
        isReconnect: true,
      });
    });
    return () => subscription.remove();
  }, []);

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
        image_url: item.attributes?.image_url,
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

  const refreshScreen = async () => {
    setIsRefreshing(true);

    try {
      clearReconnectTimer();
      clearBufferingWatchdog();
      userPausedRef.current = false;
      currentEpisodeRef.current = null;

      try {
        await TrackPlayer.reset();
      } catch (e) {
        // already reset
      }

      setPlayingEpisodeId(null);
      setConnectionIssue(null);
      setIsReconnecting(false);
      setRetryAttemptValue(0);
      playbackPositionRef.current = 0;

      await fetchEpisodes();
      setRefreshKey((prev) => prev + 1);
    } finally {
      setIsRefreshing(false);
    }
  };

  const pauseEpisode = async () => {
    userPausedRef.current = true;
    clearReconnectTimer();
    clearBufferingWatchdog();
    setIsReconnecting(false);
    setConnectionIssue(null);
    await TrackPlayer.pause();
  };

  const resumeEpisode = async () => {
    if (currentEpisodeRef.current && connectionIssue) {
      setConnectionIssue('Reconnecting...');
      setIsReconnecting(true);
      clearReconnectTimer();
      clearBufferingWatchdog();
      await playEpisode(currentEpisodeRef.current, {
        startPosition: playbackPositionRef.current,
        isReconnect: true,
      });
      return;
    }

    userPausedRef.current = false;
    await TrackPlayer.play();
  };

  const seekTo = async (positionMillis: number) => {
    playbackPositionRef.current = positionMillis;
    await TrackPlayer.seekTo(positionMillis / 1000);
  };

  const rewindTenSeconds = async () => {
    await seekTo(Math.max(0, playbackPosition - 10000));
  };

  const skipThirtySeconds = async () => {
    if (playbackDuration > 0) {
      await seekTo(Math.min(playbackPosition + 30000, playbackDuration));
    } else {
      await seekTo(playbackPosition + 30000);
    }
  };

  const changePlaybackSpeed = async (rate: number) => {
    setPlaybackRate(rate);
    if (playingEpisodeId) {
      await TrackPlayer.setRate(rate);
    }
  };

  const reconnectCurrentEpisode = async () => {
    if (!currentEpisodeRef.current) {
      return;
    }

    userPausedRef.current = false;
    setConnectionIssue('Reconnecting...');
    setIsReconnecting(true);
    clearReconnectTimer();
    clearBufferingWatchdog();

    await playEpisode(currentEpisodeRef.current, {
      startPosition: playbackPositionRef.current,
      isReconnect: true,
    });
  };

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
      <View testID={`episode-row-${item.id}`} style={styles.episodeCard}>
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
              testID={`play-btn-${item.id}`}
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

                {isBuffering && isCurrentEpisode && !connectionIssue && (
                  <View style={styles.bufferingContainer}>
                    <ActivityIndicator size="small" color="#4B3BE7" />
                    <Text style={styles.bufferingText}>Buffering…</Text>
                  </View>
                )}
                {connectionIssue && (
                  <View style={styles.reconnectContainer}>
                    <Text style={styles.connectionIssueText}>{connectionIssue}</Text>
                    <TouchableOpacity
                      style={styles.reconnectButton}
                      onPress={reconnectCurrentEpisode}
                    >
                      <Text style={styles.reconnectButtonText}>
                        {isReconnecting ? `Retrying... (${retryAttempt}/${MAX_RECONNECT_ATTEMPTS})` : 'Reconnect'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
        </View>
      </View>
    );
  }, [playingEpisodeId, isPlaying, isBuffering, playbackPosition, playbackDuration, playbackRate, pauseEpisode, resumeEpisode, playEpisode, seekTo, rewindTenSeconds, skipThirtySeconds, changePlaybackSpeed, connectionIssue, isReconnecting, retryAttempt]);

  const renderHeader = useMemo(() => (
    <>
      <Text style={styles.header}>The Be Better Man Private Podcasts</Text>

      {/* Latest Episode */}
      <Text style={styles.sectionHeader}>Latest Episode</Text>
      {episodes.length > 0 && (() => {
        const latestEpisode = episodes[0];
        const isCurrentEpisode = playingEpisodeId === latestEpisode.id;
        const cleanDescription = latestEpisode.description ? stripHtml(latestEpisode.description) : '';
        return (
          <View style={styles.latestEpisodeContainer}>
            <View style={styles.episodeCard}>
              <Image
                source={require('../assets/KMFpODCAST.png')}
                style={styles.episodeLogo}
                resizeMode="contain"
              />
              <View style={styles.episodeContent}>
                <Text style={styles.episodeTitle}>{latestEpisode.title}</Text>
                {cleanDescription && (
                  <Text style={styles.episodeDescription} numberOfLines={2}>
                    {cleanDescription}
                  </Text>
                )}
                <View style={styles.episodeMetaRow}>
                  {latestEpisode.published_at && (
                    <Text style={styles.episodeDate}>
                      {new Date(latestEpisode.published_at).toLocaleDateString()}
                    </Text>
                  )}
                  {latestEpisode.duration && (
                    <Text style={styles.episodeDuration}>{latestEpisode.duration}</Text>
                  )}
                </View>
                {latestEpisode.audio_url && (
                  <View style={styles.playerContainer}>
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => isPlaying ? pauseEpisode() : (isCurrentEpisode ? resumeEpisode() : playEpisode(latestEpisode))}
                    >
                      <Text style={styles.playButtonText}>
                        {isBuffering && isCurrentEpisode ? '...' : (isPlaying ? '⏸' : '▶')}
                      </Text>
                    </TouchableOpacity>
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
                        <View style={styles.controlsRow}>
                          <TouchableOpacity style={styles.controlButton} onPress={rewindTenSeconds}>
                            <Text style={styles.controlButtonText}>⏪ 10s</Text>
                          </TouchableOpacity>
                          <View style={styles.speedControls}>
                            {[1.0, 1.25, 1.5, 2.0].map((rate) => (
                              <TouchableOpacity
                                key={rate}
                                style={[styles.speedButton, playbackRate === rate && styles.speedButtonActive]}
                                onPress={() => changePlaybackSpeed(rate)}
                              >
                                <Text style={[styles.speedButtonText, playbackRate === rate && styles.speedButtonTextActive]}>
                                  {rate}x
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          <TouchableOpacity style={styles.controlButton} onPress={skipThirtySeconds}>
                            <Text style={styles.controlButtonText}>⏩ 30s</Text>
                          </TouchableOpacity>
                        </View>
                        {isBuffering && isCurrentEpisode && !connectionIssue && (
                          <View style={styles.bufferingContainer}>
                            <ActivityIndicator size="small" color="#4B3BE7" />
                            <Text style={styles.bufferingText}>Buffering…</Text>
                          </View>
                        )}
                        {connectionIssue && (
                          <View style={styles.reconnectContainer}>
                            <Text style={styles.connectionIssueText}>{connectionIssue}</Text>
                            <TouchableOpacity style={styles.reconnectButton} onPress={reconnectCurrentEpisode}>
                              <Text style={styles.reconnectButtonText}>
                                {isReconnecting ? `Retrying... (${retryAttempt}/${MAX_RECONNECT_ATTEMPTS})` : 'Reconnect'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      })()}

      {/* All Episodes Section */}
      <View style={styles.allEpisodesContainer}>
        <Text style={styles.sectionHeader}>All Episodes</Text>

        {/* Episodes List Loading/Error States */}
        {loading && (
          <View testID="podcasts-loading" style={styles.centerContent}>
            <ActivityIndicator size="large" color="#4B3BE7" />
            <Text style={styles.loadingText}>Loading episodes...</Text>
          </View>
        )}
        {!loading && error && (
          <View testID="podcasts-error" style={styles.centerContent}>
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
  ), [loading, error, filteredEpisodes.length, searchQuery, fetchEpisodes, refreshKey, episodes, playingEpisodeId, isPlaying, isBuffering, playbackPosition, playbackDuration, playbackRate, connectionIssue, isReconnecting, retryAttempt, pauseEpisode, resumeEpisode, playEpisode, seekTo, rewindTenSeconds, skipThirtySeconds, changePlaybackSpeed, reconnectCurrentEpisode]);

  return (
    <View style={styles.container}>
      {/* Search Field at Top */}
      <View style={styles.topSearchContainer}>
        <View style={styles.topSearchRow}>
          <TextInput
            testID="podcasts-search"
            style={[styles.searchInput, styles.searchInputFlex]}
            placeholder="Search episodes..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={styles.refreshScreenButton}
            onPress={refreshScreen}
            disabled={isRefreshing}
          >
            <Text style={styles.refreshScreenButtonText}>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={!loading && !error && filteredEpisodes.length > 0 ? (searchQuery ? filteredEpisodes : filteredEpisodes.slice(1)) : []}
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
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 50, backgroundColor: '#F1EFE7' },
  topSearchContainer: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 0,
    backgroundColor: '#F1EFE7',
    zIndex: 10,
  },
  topSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#1A1A1A', textAlign: 'center', marginTop: 16 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1A1A1A', textAlign: 'center', marginTop: 8 },
  latestEpisodeContainer: { width: '100%', maxWidth: 640, marginBottom: 16, alignSelf: 'center', marginHorizontal: 0 },
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
  searchInputFlex: {
    flex: 1,
  },
  refreshScreenButton: {
    backgroundColor: '#4B3BE7',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshScreenButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
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
  bufferingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingVertical: 6,
  },
  bufferingText: {
    fontSize: 13,
    color: '#666',
  },
  reconnectContainer: {
    marginTop: 10,
    gap: 8,
    backgroundColor: '#f4f1ff',
    borderRadius: 8,
    padding: 10,
  },
  connectionIssueText: {
    fontSize: 12,
    color: '#4A3B96',
  },
  reconnectButton: {
    backgroundColor: '#4B3BE7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  reconnectButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
