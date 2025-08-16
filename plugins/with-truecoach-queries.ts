// plugins/with-truecoach-queries.ts
import {
  ConfigPlugin,
  withInfoPlist,
  withAndroidManifest,
} from "@expo/config-plugins";

type Options = {
  scheme?: string;          // i.e. "truecoach"
  androidPackage?: string;  // i.e. "com.truecoach"
};

const withTrueCoachQueries: ConfigPlugin<Options> = (config, props = {}) => {
  const scheme = props.scheme ?? "truecoach";
  const androidPackage = props.androidPackage ?? "com.truecoach";

  // --- iOS: allow canOpenURL for the custom scheme
  config = withInfoPlist(config, (cfg) => {
    const existing = cfg.modResults.LSApplicationQueriesSchemes ?? [];
    const set = new Set<string>(existing);
    set.add(scheme);
    cfg.modResults.LSApplicationQueriesSchemes = Array.from(set);
    return cfg;
  });

  // --- Android: package visibility + intent for the scheme
  config = withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;

    // Ensure <queries> exists
    if (!manifest.manifest.queries) manifest.manifest.queries = [{}];
    const queries = manifest.manifest.queries[0];

    // Add <package android:name="com.truecoach" />
    queries.package = queries.package ?? [];
    if (!queries.package.some((p: any) => p.$["android:name"] === androidPackage)) {
      queries.package.push({ $: { "android:name": androidPackage } });
    }

    // Add an intent that matches the scheme
    queries.intent = queries.intent ?? [];
    const hasIntent = queries.intent.some((i: any) => {
      const action = i.action?.[0]?.$["android:name"];
      const data = i.data?.[0]?.$["android:scheme"];
      return action === "android.intent.action.VIEW" && data === scheme;
    });

    if (!hasIntent) {
      queries.intent.push({
        action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
        data: [{ $: { "android:scheme": scheme } }],
      });
    }

    return cfg;
  });

  return config;
};

export default withTrueCoachQueries;
