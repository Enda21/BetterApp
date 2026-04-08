import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';

interface RapidFireProps {
  onClose: () => void;
}

const RapidFire = ({ onClose }: RapidFireProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Rapid Fire</Text>
        <View style={styles.rightPlaceholder} />
      </View>
      <WebView
        source={{ uri: 'https://kmfitnesscoaching.typeform.com/Rapidfire' }}
        style={styles.webview}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFE7',
  },
  header: {
    minHeight: 56,
    backgroundColor: '#0947aaff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  cancelButton: {
    padding: 8,
    width: 80,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
  title: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  rightPlaceholder: {
    width: 80,
  },
});

export default RapidFire;