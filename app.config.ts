import { ConfigPlugin, withAndroidManifest } from "@expo/config-plugins";

export default {
  expo: {
    name: "Better",
    slug: "betterapp",
    owner: "brody32", // optional but recommended
    extra: {
      eas: {
        projectId: "4dc1c75e-9745-4348-90e7-2d5241a419e3", // <- from your screenshot
      },
    },
    ios: {
      bundleIdentifier: "com.brody32.better",
      infoPlist: { LSApplicationQueriesSchemes: ["truecoach"] },
    },
    android: {
      package: "com.brody32.better",
    },
    plugins: [
      ["./plugins/with-truecoach-queries.js",{ 
        scheme: "truecoach", 
        androidPackage: [
          "co.truecoach.client",     // Production client app
          "co.truecoach.client.beta", // Beta client app (likely what you have)
          "com.truecoach.client",    // Alternative package name
          "com.truecoach.beta",      // Coach app (harmless to include
        ]
    }],
  ]
  },
};
