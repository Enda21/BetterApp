// plugins/with-rnfirebase-static-framework.js
//
// When iOS uses static frameworks (expo-build-properties: ios.useFrameworks = "static"),
// React Native Firebase's Objective-C modules (e.g. RNFBApp) end up importing
// non-modular React-Core headers from inside a framework module, which Xcode treats
// as an error under -Werror ("include of non-modular header inside framework module").
//
// Two Podfile changes are required, and both must survive `expo prebuild` on EAS:
//
// 1. `$RNFirebaseAsStaticFramework = true` at the top of the Podfile — React Native
//    Firebase's documented static-frameworks switch (https://rnfirebase.io/).
//
// 2. CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES on the RNFB* pod
//    targets, injected into the existing post_install hook. RNFB headers import
//    non-modular React-Core headers (RCTConvert.h, RCTBridgeModule.h,
//    RCTEventEmitter.h), and clang errors on that while precompiling the framework
//    module. This setting is scoped to targets whose name starts with "RNFB" so no
//    unrelated pods are affected.
const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const STATIC_MARKER = "$RNFirebaseAsStaticFramework = true";
const CLANG_SETTING = "CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES";

const POST_INSTALL_SNIPPET = `
    # Added by plugins/with-rnfirebase-static-framework.js:
    # RNFB pods import non-modular React-Core headers from inside a framework
    # module; allow that for RNFB targets only.
    installer.pods_project.targets.each do |target|
      if target.name.start_with?('RNFB')
        target.build_configurations.each do |build_config|
          build_config.build_settings['${CLANG_SETTING}'] = 'YES'
        end
      end
    end
`;

function withRNFirebaseStaticFramework(config) {
  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, "Podfile");
      let contents = fs.readFileSync(podfilePath, "utf8");

      if (!contents.includes(STATIC_MARKER)) {
        contents = `${STATIC_MARKER}\n\n${contents}`;
      }

      if (!contents.includes(CLANG_SETTING)) {
        const anchor = /^[ \t]*post_install do \|installer\|[ \t]*$/m;
        const match = contents.match(anchor);
        if (!match) {
          throw new Error(
            "with-rnfirebase-static-framework: could not find `post_install do |installer|` " +
              "in the generated Podfile. The Expo Podfile template may have changed; " +
              "update this plugin's anchor regex to match it."
          );
        }
        contents = contents.replace(anchor, `${match[0]}\n${POST_INSTALL_SNIPPET}`);
      }

      fs.writeFileSync(podfilePath, contents);
      return cfg;
    },
  ]);
}

module.exports = withRNFirebaseStaticFramework;
