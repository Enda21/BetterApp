import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function Community() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Community</Text>
      <WebView
        source={{ uri: 'https://www.skool.com/be-a-a-better-man-5157' }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        mixedContentMode="always"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        contentInset={{ top: 0, right: 0, bottom: 0, left: 0 }}
        automaticallyAdjustContentInsets={false}
        scrollEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFE7',
    paddingTop: 0,
    marginTop: 0,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#F1EFE7',
    color: '#1A1A1A',
  },
  webview: {
    flex: 1,
    marginTop: 0,
  },
});
