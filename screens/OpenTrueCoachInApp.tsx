// screens/OpenTrueCoachInApp.tsx
import React, { useCallback } from "react";
import { View, Button, Alert, Linking, Platform } from "react-native";

const TRUECOACH_SCHEME = "truecoach://";
const TRUECOACH_PACKAGES = [
  "co.truecoach.client.beta", // beta first (your device)
  "co.truecoach.client",
  "com.truecoach.client",
  "co.truecoach.client",
  "co.truecoach.beta",
  "co.truecoach",
  "com.truecoach",
  "com.truecoach.beta",
  "com.truecoach.client.beta",
];
const PLAY_SEARCH = "https://play.google.com/store/search?q=TrueCoach&c=apps";
const APPLE_SEARCH = "https://apps.apple.com/us/search?term=truecoach";

export default function OpenTrueCoachInApp() {
  const open = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        // Method 1: Try the custom scheme first (most reliable for React Native)
        try {
          const supported = await Linking.canOpenURL(TRUECOACH_SCHEME);
          if (supported) {
            await Linking.openURL(TRUECOACH_SCHEME);
            return;
          }
        } catch (error) {
          console.log('Scheme failed:', error);
        }

        // Method 2: Try market://details for each possible package
        for (const packageName of TRUECOACH_PACKAGES) {
          try {
            await Linking.openURL(`market://details?id=${packageName}`);
            return;
          } catch (error) {
            console.log(`Market URL failed for ${packageName}:`, error);
          }
        }

        // Method 3: Try Google Play Store direct links
        for (const packageName of TRUECOACH_PACKAGES) {
          try {
            await Linking.openURL(`https://play.google.com/store/apps/details?id=${packageName}`);
            return;
          } catch (error) {
            console.log(`Play Store direct link failed for ${packageName}:`, error);
          }
        }

        // Final fallback: Play Store search
        await Linking.openURL(PLAY_SEARCH);
      } else {
        // iOS logic remains the same
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
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Button title="Open TrueCoach" onPress={open} />
    </View>
  );
}
