import React from 'react';
import { View, Text, StyleSheet, Linking, Button,Alert } from 'react-native';

const openTrueCoach = async () => {
  const url = 'truecoach://';
  const fallbackUrl = 'https://www.truecoach.co';

  const supported = await Linking.canOpenURL(url);

  if (supported) {
    Linking.openURL(url);
  } else {
    Alert.alert(
      'TrueCoach App Not Installed',
      'We couldn’t open the TrueCoach app. Opening the website instead.',
      [
        { text: 'OK', onPress: () => Linking.openURL(fallbackUrl) },
      ]
    );
  }
};

const ExternalLinks = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Open external platforms:</Text>
      <Button title="Go to Skool" onPress={() => Linking.openURL('https://www.skool.com')} />
      <Button title="Go to TrueCoach App" onPress={openTrueCoach} />
    </View>
  );
};

export default ExternalLinks;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  text: { fontSize: 20, marginBottom: 20 },
});
