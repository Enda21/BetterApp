import { ConfigPlugin, withAndroidManifest } from "@expo/config-plugins";
import { version } from "react";

export default {
  expo: {
    name: "Better",
    slug: "betterapp",
    owner: "brody32", // optional but recommended
    version: "1.1.0",
    icon: "./assets/BetterLogo2.png",
    extra: {
      eas: {
        projectId: "4dc1c75e-9745-4348-90e7-2d5241a419e3", // <- from your screenshot
      }
      // Typeform Personal Access Token removed for security
    },
    ios: {
      bundleIdentifier: "com.brody32.better",
      buildNumber: "1.0.4",
      infoPlist: {
        LSApplicationQueriesSchemes: ["truecoach"],
        ITSAppUsesNonExemptEncryption: false,
        NSPhotoLibraryUsageDescription: "Allow Better to access your photos so you can attach screenshots when reporting an issue."
      },
       icon: "./assets/BetterLogo2.png"
    },
    android: {
      package: "com.brody32.better",
      versionCode: 5,
      Permissions: [],
       foregroundImage: "./assets/adaptive-icon.png", // transparent PNG
        backgroundColor: "#FFFFFF",
        // optional but nice for Android 13 "themed icons":
        monochromeImage: "./assets/adaptive-icon-mono.png"
    },
    plugins: [
      ["./plugins/with-truecoach-queries.js",{ 
        scheme: "truecoach", 
        androidPackages: [
          "co.truecoach.client",     // Production client app
          "co.truecoach.client.beta", // Beta client app (likely what you have)
          "com.truecoach.client",    // Alternative package name
          "com.truecoach.beta",      // Coach app (harmless to include
        ]
    }],
  ],
  "updates": {
    "url": "https://u.expo.dev/4dc1c75e-9745-4348-90e7-2d5241a419e3"
  },
  "runtimeVersion": {
    "policy": "appVersion"
  }
  },
};
