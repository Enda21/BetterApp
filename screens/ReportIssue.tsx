import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
  ScrollView,
  Linking,
  SafeAreaView,
} from 'react-native';
import * as MailComposer from 'expo-mail-composer';
import * as Device from 'expo-device';
import * as ImagePicker from 'expo-image-picker';

const RECIPIENT = 'tapp38420@gmail.com';

const ReportIssue = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const platformType = Platform.OS === 'ios' ? 'iOS' : 'Android';
  const [deviceInfo, setDeviceInfo] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);

  useEffect(() => {
    const model = Device.modelName ?? 'Unknown Model';
    const brand = Device.brand ?? 'Unknown Brand';
    setDeviceInfo(`${brand} ${model}`);
  }, []);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'You need to allow access to your media library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      setScreenshot(result.assets[0].uri);
    }
  };

  const buildBody = () =>
    `Name: ${name}
Platform: ${platformType}
Device: ${deviceInfo}

Description:
${description}`;

  const openMailto = async (body: string) => {
    const url =
      `mailto:${RECIPIENT}` +
      `?subject=${encodeURIComponent('Issue Report')}` +
      `&body=${encodeURIComponent(body)}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        'Email Not Available',
        `No email app found. Please email ${RECIPIENT} directly.`,
      );
    }
  };

  const handleSend = async () => {
    if (!name || !description) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    const body = buildBody();
    const isAvailable = await MailComposer.isAvailableAsync();

    if (isAvailable) {
      await MailComposer.composeAsync({
        recipients: [RECIPIENT],
        subject: 'Issue Report',
        body,
        attachments: screenshot ? [screenshot] : [],
      });
      return;
    }

    if (screenshot) {
      Alert.alert(
        'Open Email App',
        'Apple Mail is not set up on this device. Your email app will open with the report details — please attach the screenshot manually before sending.',
        [{ text: 'Continue', onPress: () => openMailto(body) }],
      );
      return;
    }

    await openMailto(body);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Report an Issue</Text>

        <TextInput
          placeholder="Your Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Describe the issue"
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={5}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Platform:</Text>
        <View style={styles.readOnlyBox}>
          <Text>{platformType}</Text>
        </View>

        <Text style={styles.label}>Device Info:</Text>
        <View style={styles.readOnlyBox}>
          <Text>{deviceInfo}</Text>
        </View>

        <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
          <Text style={styles.imagePickerText}>Add Screenshot</Text>
        </TouchableOpacity>

        {screenshot && (
          <Image source={{ uri: screenshot }} style={styles.previewImage} />
        )}

        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default ReportIssue;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F1EFE7',
  },
  scrollContainer: {
      flexGrow: 1,
      backgroundColor: '#F1EFE7',
  },
  container: { flex: 1, padding: 20, backgroundColor: '#F1EFE7' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1A1A1A' },
  input: { borderWidth: 1, borderColor: '#4B3BE7', padding: 10, borderRadius: 8, marginBottom: 15, color: '#1A1A1A', backgroundColor: '#FFFFFF' },
  textArea: { height: 120, textAlignVertical: 'top', color: '#1A1A1A', backgroundColor: '#FFFFFF' },
  label: { marginBottom: 4, fontWeight: '600', color: '#1A1A1A' },
  readOnlyBox: {
    borderWidth: 1,
    borderColor: '#4B3BE7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
    imagePicker: {
        backgroundColor: '#4B3BE7',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        alignItems: 'center',
    },
  imagePickerText: { color: '#1A1A1A', fontWeight: 'bold' },
    previewImage: {
        width: '100%',
        height: 200,
        marginBottom: 15,
        borderRadius: 8,
        resizeMode: 'contain',
    },
    sendButton: {
        backgroundColor: '#10B981',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
  sendButtonText: { color: '#1A1A1A', fontWeight: 'bold', fontSize: 16 },
});


