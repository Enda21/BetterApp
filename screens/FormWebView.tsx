import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';

interface FormWebViewProps {
  url: string;
  onClose: () => void;
  title?: string;
}

const FormWebView = ({ url, onClose, title }: FormWebViewProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          {title ? <Text style={styles.headerTitle}>{title}</Text> : null}
        </View>
      </View>
      <WebView source={{ uri: url }} style={styles.webview} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFE7',
  },
  header: {
    height: 60,
    backgroundColor: '#0947aaff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  webview: {
    flex: 1,
  },
});

export default FormWebView;
