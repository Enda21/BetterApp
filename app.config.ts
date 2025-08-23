import { ConfigPlugin, withAndroidManifest } from "@expo/config-plugins";

export default {
  expo: {
    name: "better",
    slug: "better",
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
          "co.truecoach.client",
          "co.truecoach.client.beta",
          "co.truecoach.beta",
          "co.truecoach",
          "com.truecoach",
          "com.truecoach.client",
          "com.truecoach.beta",
          "com.truecoach.client.beta"
        ]
    }],
  ]
  },
};
