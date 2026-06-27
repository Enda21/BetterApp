import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { requestSkoolAccountDeletionAfterModal } from '../utils/requestSkoolAccountDeletion';

const SKOOL_CLASSROOM_URL = 'https://www.skool.com/be-a-a-better-man-5157/classroom';

export default function Courses() {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);
  const isFirstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      setWebViewKey((key) => key + 1);
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.topChrome}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Courses</Text>
          <TouchableOpacity
            style={styles.accountButton}
            onPress={() => setShowAccountMenu(true)}
          >
            <Ionicons name="person-circle-outline" size={28} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <View style={styles.banner}>
          <Ionicons name="information-circle-outline" size={16} color="#4B5563" />
          <Text style={styles.bannerText}>
            These courses are hosted by Skool, a third-party service. Any account
            you create is managed by Skool, not by Better.
          </Text>
        </View>
      </View>

      <WebView
        key={webViewKey}
        source={{ uri: SKOOL_CLASSROOM_URL }}
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

      <Modal
        visible={showAccountMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAccountMenu(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setShowAccountMenu(false)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Skool Account</Text>
            <Text style={styles.modalDescription}>
              Your courses account is managed by Skool, a third-party service.
              To delete your account, an email will be sent to Skool's support
              team (help@skool.com) on your behalf.
            </Text>

            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={() =>
                requestSkoolAccountDeletionAfterModal(() => setShowAccountMenu(false))
              }
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.modalButtonText}>Delete Skool Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAccountMenu(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  topChrome: {
    zIndex: 2,
    elevation: 2,
    backgroundColor: '#F1EFE7',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#F1EFE7',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1A1A1A',
    flex: 1,
  },
  accountButton: {
    position: 'absolute',
    right: 20,
    top: 60,
    padding: 4,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 12,
    marginBottom: 4,
    borderRadius: 8,
    gap: 8,
  },
  bannerText: {
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
  },
  webview: {
    flex: 1,
    marginTop: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
});
