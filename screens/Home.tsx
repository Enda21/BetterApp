import React from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { View, Text, StyleSheet, Image } from 'react-native';

// Define your stack param list type
type RootStackParamList = {
  Home: undefined;
  ReportIssue: undefined;
};

const Home = () => {
   const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <View style={styles.container}>
      <Image source={require('../assets/BetterLogo2.png')} style={styles.logo} />
      <Text style={styles.text}>Welcome to Better.</Text>

      <TouchableOpacity style={styles.reportButton} onPress={() => navigation.navigate('ReportIssue')}>
        <Text style={styles.reportText}>Report Issue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  reportButton: {
  marginTop: 20,
  padding: 12,
  backgroundColor: '#EF4444',
  borderRadius: 8,
},
reportText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},
});
