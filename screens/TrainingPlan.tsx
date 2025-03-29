import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TrainingPlan = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Your Training Plan will appear here.</Text>
    </View>
  );
};

export default TrainingPlan;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20 },
});
