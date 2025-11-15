import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width } = Dimensions.get('window');

// Use loose typing so this component can be registered easily in the navigator.
const LessonViewer: React.FC<any> = ({ route }: any) => {
  const navigation: any = useNavigation();
  const lesson = route?.params?.lesson ?? { title: 'No lesson', summary: '', videoUrl: '' };

  // Extract YouTube video ID from various URL formats
  const getYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
    );
    return match ? match[1] : '';
  };
  const videoId = getYouTubeId(lesson.videoUrl || '');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{lesson.title}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.summary}>{lesson.summary}</Text>
        <View style={styles.videoContainer}>
          {videoId ? (
            <YoutubePlayer
              height={(width * 9) / 16}
              width={width}
              videoId={videoId}
              play={false}
              webViewStyle={styles.webview}
            />
          ) : (
            <View style={{padding:20}}><Text>No video available.</Text></View>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1EFE7' },
  header: { backgroundColor: '#0947aaff', paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  body: { flex: 1, padding: 16 },
  summary: { fontSize: 16, color: '#222', marginBottom: 12 },
  videoContainer: { height: (width * 9) / 16, width: '100%', backgroundColor: '#000' },
  webview: { flex: 1 },
  backBtn: { marginTop: 10, alignSelf: 'flex-start', padding: 6 },
  backText: { color: '#0947aa', fontSize: 16 },
});

export default LessonViewer;
