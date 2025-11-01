import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

// Use loose typing so this component can be registered easily in the navigator.
const LessonViewer: React.FC<any> = ({ route }: any) => {
  const navigation: any = useNavigation();
  const lesson = route?.params?.lesson ?? { title: 'No lesson', summary: '', videoUrl: '' };

  // Normalize common YouTube watch URLs to embed URLs
  let videoSrc = lesson.videoUrl || '';
  if (/youtube\.com\/watch\?v=/.test(videoSrc)) {
    videoSrc = videoSrc.replace('watch?v=', 'embed/');
  }
  if (/youtu\.be\//.test(videoSrc)) {
    videoSrc = videoSrc.replace('youtu.be/', 'www.youtube.com/embed/');
  }

  // Basic HTML wrapper with a fullscreen-capable iframe and no scrollbars.
  const html = `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0" />
        <style>html,body{margin:0;padding:0;height:100%;overflow:hidden;background:#000}</style>
      </head>
      <body>
        <iframe
          src="${videoSrc}"
          width="100%"
          height="100%"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </body>
    </html>
  `;

  // If the videoSrc is empty, show a small placeholder instead of trying to load an empty page.
  const webviewSource = videoSrc ? { html } : { html: '<html><body><div style="padding:20px;font-size:16px">No video available.</div></body></html>' };

  // For native smoother playback you can swap WebView for expo-av in future changes.
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{lesson.title}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.summary}>{lesson.summary}</Text>
        <View style={styles.videoContainer}>
          <WebView
            originWhitelist={["*"]}
            source={webviewSource}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback
            mixedContentMode="always"
          />
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
