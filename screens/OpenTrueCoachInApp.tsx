// screens/OpenTrueCoachInApp.tsx
import React, { useCallback } from "react";
import { View, Button, Alert, Linking, Platform } from "react-native";

const TRUECOACH_SCHEME = "truecoach://";
const PLAY_SEARCH = "https://play.google.com/store/search?q=TrueCoach&c=apps";
const APPLE_SEARCH = "https://apps.apple.com/us/search?term=truecoach";

export default function OpenTrueCoachInApp() {
  const open = useCallback(async () => {
    try {
      const supported = await Linking.canOpenURL(TRUECOACH_SCHEME);
      if (supported) {
        await Linking.openURL(TRUECOACH_SCHEME);
        return;
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
