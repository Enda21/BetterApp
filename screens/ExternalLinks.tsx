import React from 'react';
import { View, Text, StyleSheet, Linking, Button,Alert } from 'react-native';


const ExternalLinks = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Open external platforms:</Text>
      <Button title="Go to Skool" onPress={() => Linking.openURL('https://www.skool.com')} />
    </View>
  );
};

export default ExternalLinks;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  text: { fontSize: 20, marginBottom: 20 },
});
