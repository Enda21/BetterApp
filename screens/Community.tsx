import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as MailComposer from 'expo-mail-composer';

const SKOOL_COMMUNITY_URL = 'https://www.skool.com/be-a-a-better-man-5157';

export default function Community() {
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const requestAccountDeletion = async () => {
    setShowAccountMenu(false);

    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert(
        'Email Not Available',
        'Please send an email to help@skool.com requesting account deletion.',
        [{ text: 'OK' }]
      );
      return;
    }

    await MailComposer.composeAsync({
      recipients: ['help@skool.com'],
      subject: 'Account Deletion Request',
      body: 'Hi Skool Support,\n\nI would like to request the complete deletion of my Skool account and all associated data.\n\nThank you.',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Community</Text>
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
          This community is hosted by Skool, a third-party service. Any account
          you create is managed by Skool, not by Better.
        </Text>
      </View>

      <WebView
        source={{ uri: SKOOL_COMMUNITY_URL }}
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
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAccountMenu(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Skool Account</Text>
            <Text style={styles.modalDescription}>
              Your community account is managed by Skool, a third-party service.
              To delete your account, an email will be sent to Skool's support
              team (help@skool.com) on your behalf.
            </Text>

            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={requestAccountDeletion}
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
        </TouchableOpacity>
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
