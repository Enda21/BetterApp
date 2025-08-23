// plugins/with-truecoach-queries.js
const { withInfoPlist, withAndroidManifest } = require("@expo/config-plugins");

/** @param {any} config @param {{scheme?: string, androidPackages?: string[]}} opts */
function withTrueCoachQueries(config, opts = {}) {
  const scheme = opts.scheme ?? "truecoach";
  const androidPackages = opts.androidPackages ?? [
    "co.truecoach.client", // client app
    "co.truecoach.coach",  // coach app (harmless to include)
    "co.truecoach.client.beta", // Beta client app (likely what you have)
    "com.truecoach.client",    // Alternative package name
    "com.truecoach.beta", 
  ];

  // iOS: allow canOpenURL for the scheme
  config = withInfoPlist(config, (cfg) => {
    const set = new Set(cfg.modResults.LSApplicationQueriesSchemes ?? []);
    set.add(scheme);
    cfg.modResults.LSApplicationQueriesSchemes = Array.from(set);
    return cfg;
  });

  // Android: package visibility + multiple intent queries
  config = withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    if (!manifest.manifest.queries) manifest.manifest.queries = [{}];
    const queries = (manifest.manifest.queries[0] ??= {});

    // <package android:name="..."/>
    queries.package = queries.package ?? [];
    for (const pkg of androidPackages) {
      if (!queries.package.some((p) => p.$["android:name"] === pkg)) {
        queries.package.push({ $: { "android:name": pkg } });
      }
    }

    // <intent> with VIEW + scheme
    queries.intent = queries.intent ?? [];
    const hasSchemeIntent = queries.intent.some(
      (i) =>
        i.action?.[0]?.$["android:name"] === "android.intent.action.VIEW" &&
        i.data?.[0]?.$["android:scheme"] === scheme
    );
    if (!hasSchemeIntent) {
      queries.intent.push({
        action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
        data: [{ $: { "android:scheme": scheme } }],
      });
    }

    // Add MAIN intent for package launching
    const hasMainIntent = queries.intent.some(
      (i) => i.action?.[0]?.$["android:name"] === "android.intent.action.MAIN"
    );
    if (!hasMainIntent) {
      queries.intent.push({
        action: [{ $: { "android:name": "android.intent.action.MAIN" } }],
        category: [{ $: { "android:name": "android.intent.category.LAUNCHER" } }],
      });
    }

    return cfg;
  });

  return config;
}

module.exports = withTrueCoachQueries;
