// screens/OpenTrueCoachInApp.tsx
import React, { useCallback } from "react";
import { View, Button, Alert, Linking, Platform } from "react-native";

const TRUECOACH_SCHEME = "truecoach://";
const TRUECOACH_PACKAGE = "co.truecoach.client";
const PLAY_SEARCH = "https://play.google.com/store/search?q=TrueCoach&c=apps";
const APPLE_SEARCH = "https://apps.apple.com/us/search?term=truecoach";

export default function OpenTrueCoachInApp() {
  const open = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        // Try to open the app directly using the package name
        try {
          await Linking.openURL(`intent://app/#Intent;package=${TRUECOACH_PACKAGE};scheme=truecoach;end`);
          return;
        } catch (error) {
          // If that fails, try the scheme
          try {
            const supported = await Linking.canOpenURL(TRUECOACH_SCHEME);
            if (supported) {
              await Linking.openURL(TRUECOACH_SCHEME);
              return;
            }
          } catch (schemeError) {
            // Both methods failed, open Play Store
            await Linking.openURL(PLAY_SEARCH);
            return;
          }
        }
      } else {
        // iOS logic remains the same
        const supported = await Linking.canOpenURL(TRUECOACH_SCHEME);
        if (supported) {
          await Linking.openURL(TRUECOACH_SCHEME);
          return;
        }
      }
      // Fallback: open store search
      await Linking.openURL(Platform.select({ android: PLAY_SEARCH, ios: APPLE_SEARCH })!);
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
