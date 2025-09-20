// screens/OpenTrueCoachInApp.tsx
import React, { useCallback } from "react";
import { View, Button, Alert, Linking, Platform } from "react-native";

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
        // Method 1: Check if TrueCoach app is installed using canOpenURL
        // This works reliably because the manifest queries are configured via plugin
        try {
          const supported = await Linking.canOpenURL(TRUECOACH_SCHEME);
          if (supported) {
            await Linking.openURL(TRUECOACH_SCHEME);
            return; // Successfully opened the app
          }
        } catch (error) {
          console.log('Custom scheme detection/launch failed:', error);
        }

        // Method 2: App not detected via scheme, try market:// URLs for Play Store app
        for (const packageName of TRUECOACH_PACKAGES) {
          try {
            await Linking.openURL(`market://details?id=${packageName}`);
            return; // Successfully opened Play Store app
          } catch (error) {
            console.log(`Market URL failed for ${packageName}:`, error);
          }
        }

        // Method 3: Try Google Play Store HTTPS URLs as fallback
        for (const packageName of TRUECOACH_PACKAGES) {
          try {
            await Linking.openURL(`https://play.google.com/store/apps/details?id=${packageName}`);
            return; // Successfully opened Play Store in browser
          } catch (error) {
            console.log(`Play Store HTTPS URL failed for ${packageName}:`, error);
          }
        }

        // Final fallback: Play Store search
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
