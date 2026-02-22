// screens/OpenTrueCoachInApp.tsx
import React, { useCallback } from "react";
import { View, Button, Alert, Linking, Platform } from "react-native";
import * as IntentLauncher from "expo-intent-launcher";

const TRUECOACH_SCHEME = "truecoach://";
const TRUECOACH_PACKAGES = [
  "co.truecoach.client",     // Production client app
  "co.truecoach.client.beta", // Beta client app (likely what you have)
  "com.truecoach.client",    // Alternative package name
  "com.truecoach.client.beta" // Alternative beta package name
];
const PLAY_SEARCH = "https://play.google.com/store/search?q=TrueCoach&c=apps";
const APPLE_SEARCH = "https://apps.apple.com/us/search?term=truecoach";

export default function OpenTrueCoachInApp() {
  const open = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        // Method 1: Try opening the scheme directly (skip canOpenURL - it often returns false
        // on Android even when the app is installed, causing incorrect Play Store redirects)
        try {
          await Linking.openURL(TRUECOACH_SCHEME);
          return;
        } catch (error) {
          // Scheme didn't work, try other methods
        }

        // Method 2: Launch by package name using IntentLauncher (requires dev/production build, not Expo Go)
        // This opens the installed app directly instead of relying on URL schemes
        // which often incorrectly report as unavailable and send users to Play Store
        for (const packageName of TRUECOACH_PACKAGES) {
          try {
            IntentLauncher.openApplication(packageName);
            return; // App launched successfully
          } catch {
            // App not installed for this package, try next
          }
        }

        // Method 3: App not installed - open Play Store
        for (const packageName of TRUECOACH_PACKAGES) {
          try {
            await Linking.openURL(`market://details?id=${packageName}`);
            return;
          } catch (error) {
            console.log(`Market URL failed for ${packageName}:`, error);
          }
        }

        for (const packageName of TRUECOACH_PACKAGES) {
          try {
            await Linking.openURL(`https://play.google.com/store/apps/details?id=${packageName}`);
            return;
          } catch (error) {
            console.log(`Play Store HTTPS URL failed for ${packageName}:`, error);
          }
        }

        await Linking.openURL(PLAY_SEARCH);
      } else {
        // iOS logic - uses LSApplicationQueriesSchemes configured in app config
        const supported = await Linking.canOpenURL(TRUECOACH_SCHEME);
        if (supported) {
          await Linking.openURL(TRUECOACH_SCHEME);
          return;
        }
        await Linking.openURL(APPLE_SEARCH);
      }
    } catch (e) {
      Alert.alert("Unable to open TrueCoach", String(e));
    }
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: '#F1EFE7' }}>
      <Button title="Open TrueCoach" onPress={open} color="#4B3BE7" />
    </View>
  );
}
