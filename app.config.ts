import { ConfigPlugin, withAndroidManifest } from "@expo/config-plugins";
import withTrueCoachQueries from "./plugins/with-truecoach-queries";


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
    plugins: [[withTrueCoachQueries, { scheme: "truecoach", androidPackage: "com.truecoach" }]],
  },
};
