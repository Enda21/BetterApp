import React from 'react';
import * as Sharing from 'expo-sharing';
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

const mealPlans = [
  {
    title: '1800 Meal Options (On the Go)',
    filename: '1800_Meal_Options_for_on_the_go.pdf',
    uri: FileSystem.documentDirectory + '1800_Meal_Options_for_on_the_go.pdf',
    remoteAsset: require('../assets/1800_Meal_Options_for_on_the_go.pdf'),
  },
  {
    title: 'High Protein Snack Ideas',
    filename: 'High_protein_snack_ideas.pdf',
    uri: FileSystem.documentDirectory + 'High_protein_snack_ideas.pdf',
    remoteAsset: require('../assets/High_protein_snack_ideas.pdf'),
  },
  {
    title: 'Snacks on the Go',
    filename: 'snacks_on_the_go.pdf',
    uri: FileSystem.documentDirectory + 'snacks_on_the_go.pdf',
    remoteAsset: require('../assets/snacks_on_the_go.pdf'),
  },
  {
    title: 'The BABM Travel Bible',
    filename: 'The_BABM_Travel_Bible.pdf',
    uri: FileSystem.documentDirectory + 'The_BABM_Travel_Bible.pdf',
    remoteAsset: require('../assets/The_BABM_Travel_Bible.pdf'),
  },
  {
    title: 'Evening Snacking The Slient Saboteur',
    filename: 'Evening_Snacking_The_Silent_Saboteur.pdf',
    uri: FileSystem.documentDirectory + 'Evening_Snacking_The_Silent_Saboteur.pdf',
    remoteAsset: require('../assets/Evening_Snacking_The_Silent_Saboteur.pdf'),
  }
];

const Nutrition = () => {
  const handleOpenPDF = async (item: typeof mealPlans[0]) => {
    const fileUri = item.uri;

    // Check if the file already exists
    let fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      try {
        const asset = Asset.fromModule(item.remoteAsset);
        await asset.downloadAsync();
        if (!asset.localUri) {
          return Alert.alert('Error', 'Could not get local URI for the PDF asset.');
        }
        await FileSystem.copyAsync({
          from: asset.localUri,
          to: fileUri,
        });
      } catch (error) {
        return Alert.alert('Error', 'Failed to download the PDF.');
      }
      // Re-check after download
      fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        return Alert.alert('Error', 'PDF file not found after download.');
      }
    }

    // Use expo-sharing to open the PDF with an external app
    try {
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert('Error', `Could not share/open the PDF. URI: ${fileUri}\n${error}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Meal Plans</Text>
      {mealPlans.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() => handleOpenPDF(item)}
        >
          <Text style={styles.cardTitle}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0A1628',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderLeftColor: '#10B981',
    borderLeftWidth: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default Nutrition;