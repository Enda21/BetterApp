// plugins/with-rnfirebase-static-framework.js
//
// When iOS uses static frameworks (expo-build-properties: ios.useFrameworks = "static"),
// React Native Firebase requires `$RNFirebaseAsStaticFramework = true` in the Podfile
// before pod install runs — its podspecs check this variable to opt in to
// `static_framework = true` (see RNFBApp.podspec). https://rnfirebase.io/
//
// Note: an earlier revision of this plugin also injected
// CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES into post_install for
// RNFB targets. That was removed: it traded the non-modular-include error for a
// "must be imported from module ... before it is required" failure
// (invertase/react-native-firebase#8657). The canonical fix is
// expo-build-properties ios.buildReactNativeFromSource = true (see app.config.ts),
// which disables the prebuilt React-Core (RCT_USE_PREBUILT_RNCORE) that conflicts
// with static frameworks.
const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const MARKER = "$RNFirebaseAsStaticFramework = true";

function withRNFirebaseStaticFramework(config) {
  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, "Podfile");
      const contents = fs.readFileSync(podfilePath, "utf8");
      if (!contents.includes(MARKER)) {
        fs.writeFileSync(podfilePath, `${MARKER}\n\n${contents}`);
      }
      return cfg;
    },
  ]);
}

module.exports = withRNFirebaseStaticFramework;
