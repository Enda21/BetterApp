import React from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { TouchableOpacity, Platform } from 'react-native';
import { View, Text, StyleSheet, Image } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useAppUpdate } from '../hooks/useAppUpdate';

type RootStackParamList = {
  Home: undefined;
  ReportIssue: undefined;
};

const Home = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { updateAvailable, latestVersion, openStore } = useAppUpdate();
  const storeName = Platform.OS === 'ios' ? 'App Store' : 'Play Store';

  return (
    <View style={styles.container}>
      {updateAvailable && (
        <TouchableOpacity style={styles.updateBanner} onPress={openStore} activeOpacity={0.85}>
          <View style={styles.updateContent}>
            <Ionicons name="arrow-up-circle" size={28} color="#FFFFFF" />
            <View style={styles.updateTextWrap}>
              <Text style={styles.updateTitle}>Update available</Text>
              <Text style={styles.updateText}>
                Version {latestVersion} is ready. Tap to open the {storeName}.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.mainContent}>
        <Image source={require('../assets/BetterLogo2.png')} style={styles.logo} />
        <Text style={styles.text}>Welcome to Better.</Text>

        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => navigation.navigate('ReportIssue')}
        >
          <Text style={styles.reportText}>Report Issue</Text>
        </TouchableOpacity>

        <Text style={styles.version}>v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFE7',
  },
  updateBanner: {
    backgroundColor: '#4B3BE7',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 16,
  },
  updateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  updateTextWrap: {
    flex: 1,
  },
  updateTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  updateText: {
    color: '#EDE9FE',
    fontSize: 13,
    lineHeight: 18,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
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
  version: {
    marginTop: 24,
    fontSize: 12,
    color: '#6B7280',
  },
});
