import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';

type Coach = {
  name: string;
  calendlyUrl: string;
};

const coaches: Coach[] = [
  { name: 'Enda', calendlyUrl: 'https://calendly.com/endabrody' },
  { name: 'Kieran', calendlyUrl: 'https://calendly.com/kieran-kmfitness' },
  { name: 'Paul', calendlyUrl: 'https://calendly.com/paul-kmfitness' },
  { name: 'Owen', calendlyUrl: 'https://calendly.com/owen-kmfitness' },
  { name: 'Tomas', calendlyUrl: 'https://calendly.com/tomas-kmfitness' },
];

const CoachBooking = () => {
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  if (selectedCoach) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => setSelectedCoach(null)}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📅 Book with {selectedCoach.name}</Text>
        </View>
        <WebView
          source={{ uri: selectedCoach.calendlyUrl }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📅 Book a Call</Text>
        <Text style={styles.headerSubtitle}>Select a coach to view available times</Text>
      </View>

      <View style={styles.content}>
        {coaches.map((coach) => (
          <TouchableOpacity
            key={coach.name}
            style={styles.coachCard}
            onPress={() => setSelectedCoach(coach)}
          >
            <Text style={styles.coachName}>{coach.name}</Text>
            <Text style={styles.coachAction}>View Available Times →</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default CoachBooking;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFE7',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F1EFE7',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4B3BE7',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  coachCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4B3BE7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coachName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  coachAction: {
    fontSize: 14,
    color: '#4B3BE7',
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
});
