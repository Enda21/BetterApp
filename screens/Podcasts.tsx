
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Linking
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Podcasts = () => {
  const openYouTubeMusic = () => {
    Linking.openURL('https://music.youtube.com/playlist?list=PL4rdqGk8y-AXlEr4yT-xbn3V-8xczX4MI');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Podcasts</Text>
        <TouchableOpacity style={styles.linkButton} onPress={openYouTubeMusic}>
          <Ionicons name="open-outline" size={20} color="#4B3BE7" />
          <Text style={styles.linkButtonText}>Open in YouTube Music</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Podcast Channel Info */}
        <View style={styles.podcastInfo}>
          <Text style={styles.podcastTitle}>Be Better Podcast</Text>
          <Text style={styles.podcastDescription}>
            Latest episodes from the Be Better podcast channel
          </Text>
        </View>

        {/* Embedded Player */}
        <View style={styles.playerContainer}>
          <WebView
            style={styles.webview}
            source={{
              uri: 'https://music.youtube.com/playlist?list=PL4rdqGk8y-AXlEr4yT-xbn3V-8xczX4MI'
            }}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            mixedContentMode="compatibility"
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About the Podcast</Text>
          <Text style={styles.infoText}>
            Listen to the latest episodes from the Be Better podcast. Get insights on fitness, 
            nutrition, mindset, and personal development to help you become a better version of yourself.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F7',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    gap: 6,
  },
  linkButtonText: {
    color: '#4B3BE7',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  podcastInfo: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  podcastTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  podcastDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  playerContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    height: 500,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  webview: {
    flex: 1,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});

export default Podcasts;
