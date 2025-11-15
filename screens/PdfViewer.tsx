import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useNavigation, useRoute } from '@react-navigation/native';

type RouteParams = {
  title?: string;
  url: string; // can be http(s) or file:// uri
};

const isHttpUrl = (u?: string) => !!u && /^https?:\/\//i.test(u);

const PdfViewer: React.FC = () => {
  const navigation: any = useNavigation();
  const route = useRoute();
  const params = (route.params || {}) as RouteParams;

  const { title = 'Document', url } = params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use Mozilla PDF.js Viewer for remote PDFs to avoid Google Docs size limits (~20-25MB)
  const viewerUri = useMemo(() => {
    if (!url) return '';
    if (isHttpUrl(url)) {
      const enc = encodeURIComponent(url);
      // PDF.js official demo viewer supports larger files and works well in WebView
      // We prefer this over Google Docs Viewer to support files >20MB
      return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${enc}`;
    }
    // Local file URI; iOS WebView often handles this directly. Android typically cannot render PDFs natively.
    return url;
  }, [url]);

  const onShareExternal = useCallback(async () => {
    try {
      if (!url) return;
      if (isHttpUrl(url)) {
        // Download to cache then share
        const filenameGuess = (url.split('?')[0].split('#')[0].split('/').pop() || 'document.pdf');
        const dest = `${FileSystem.cacheDirectory}${filenameGuess}`;
        const { uri: localUri } = await FileSystem.downloadAsync(url, dest);
        await Sharing.shareAsync(localUri);
      } else {
        await Sharing.shareAsync(url);
      }
    } catch (e) {
      Alert.alert('Unable to share', 'This file could not be opened externally.');
    }
  }, [url]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityLabel="Go back">
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <TouchableOpacity onPress={onShareExternal} style={styles.actionBtn} accessibilityLabel="Open externally">
          <Text style={styles.actionText}>Open</Text>
        </TouchableOpacity>
      </View>

      {!!viewerUri && (
        <WebView
          originWhitelist={["*"]}
          source={{ uri: viewerUri }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          cacheEnabled={false}
          onLoadStart={() => { setLoading(true); setError(null); }}
          onLoadEnd={() => setLoading(false)}
          onHttpError={() => {
            setLoading(false);
            setError('Could not load the document preview.');
          }}
          onError={() => {
            setLoading(false);
            setError('Could not load the document preview.');
          }}
        />
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0947aa" />
          <Text style={styles.loadingText}>Loading document…</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          {(!isHttpUrl(url) && Platform.OS === 'android') ? (
            <Text style={styles.errorHint}>
              Android cannot preview local PDFs in-app reliably. Use "Open" to view externally.
            </Text>
          ) : (
            <Text style={styles.errorHint}>You can still use "Open" to view it externally.</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1EFE7' },
  header: {
    height: 64,
    backgroundColor: '#0947aaff',
    paddingTop: 20,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  backBtn: { padding: 8 },
  backText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', flex: 1 },
  actionBtn: { padding: 8 },
  actionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  webview: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: { color: '#0947aa', marginTop: 6 },
  errorBox: { padding: 12, backgroundColor: '#fde68a', borderRadius: 10, margin: 12 },
  errorText: { color: '#7c3e00', fontWeight: '700' },
  errorHint: { color: '#7c3e00', marginTop: 6 },
});

export default PdfViewer;
