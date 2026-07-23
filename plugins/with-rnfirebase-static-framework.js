// plugins/with-rnfirebase-static-framework.js
//
// When iOS uses static frameworks (expo-build-properties: ios.useFrameworks = "static"),
// React Native Firebase's Objective-C modules (e.g. RNFBApp) end up importing
// non-modular React-Core headers from inside a framework module, which Xcode treats
// as an error under -Werror ("include of non-modular header inside framework module").
//
// React Native Firebase's documented fix is to set `$RNFirebaseAsStaticFramework = true`
// in the Podfile before pod install runs, which changes how its podspecs declare
// static_framework support and avoids the modular-header conflict.
// https://rnfirebase.io/ (iOS "Static Frameworks" setup)
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
