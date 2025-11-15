import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import FormWebView from './FormWebView';
import ProgressPitStop from './ProgressPitStop';

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
  const [showRapidFire, setShowRapidFire] = useState(false);
  const [showProgressPitStop, setShowProgressPitStop] = useState(false);

  if (showRapidFire) {
    return (
      <FormWebView
        url={'https://kmfitnesscoaching.typeform.com/Rapidfire'}
        title={'Rapid Fire'}
        onClose={() => setShowRapidFire(false)}
      />
    );
  }

  if (showProgressPitStop) {
    return <ProgressPitStop onClose={() => setShowProgressPitStop(false)} />;
  }

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
            onPress={() => {
              if (form.name === 'Rapid Fire') {
                setShowRapidFire(true);
              } else if (form.name === 'Progress Pit Stop') {
                setShowProgressPitStop(true);
              }
            }}
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
    backgroundColor: '#F1EFE7',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#0947aaff',
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
    backgroundColor: '#0947aaff',
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
