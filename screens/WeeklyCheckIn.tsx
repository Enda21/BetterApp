import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';

const forms = [
  {
    name: 'Rapid Fire',
    linkGoogleForm: 'https://kmfitnesscoaching.typeform.com/Rapidfire',
    description: 'Your quick-fire weekly check-in to stay aligned and focused.',
  },
  {
    name: 'Progress Pit Stop',
    linkGoogleForm: 'https://kmfitnesscoaching.typeform.com/pitstopsessions',
    description: 'Reflect on your progress and assess where you need support.',
  },
];

const WeeklyCheckIn = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Check-In</Text>
        <Text style={styles.headerSubtitle}>Select a check-in option below:</Text>
      </View>

      <View style={styles.content}>
        {forms.map((form, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => Linking.openURL(form.linkGoogleForm)}
          >
            <Text style={styles.cardTitle}>{form.name}</Text>
            <Text style={styles.cardDescription}>{form.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4B3BE7',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
});

export default WeeklyCheckIn;
