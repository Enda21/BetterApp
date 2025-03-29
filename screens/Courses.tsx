import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Courses = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Courses from Skool will go here.</Text>
    </View>
  );
};

export default Courses;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20 },
});