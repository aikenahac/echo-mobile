// @ts-check
/**
 * Adopt the UIScene life cycle on iOS (required by the iOS 27 SDK, which
 * asserts at launch otherwise).
 *
 * SDK 57 ships `ExpoAppSceneDelegate` but its prebuild template still starts
 * React Native from the app delegate. This backports what the SDK 58 template
 * does: declare a scene manifest that uses Expo's scene delegate, make the
 * AppDelegate an `ExpoReactNativeFactoryProvider`, and stop it creating the
 * window itself. Remove this plugin after upgrading to SDK 58.
 */
const { withAppDelegate, withInfoPlist } = require("expo/config-plugins");

const SCENE_DELEGATE = "EXExpoAppSceneDelegate"; // @objc name of ExpoAppSceneDelegate

const WINDOW_BLOCK =
  /\n#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n\s*factory\.startReactNative\([\s\S]*?\)\n#endif\n/;

/** @type {import("expo/config-plugins").ConfigPlugin} */
const withIosSceneLifecycle = (config) => {
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default Configuration",
            UISceneDelegateClassName: SCENE_DELEGATE,
          },
        ],
      },
    };
    return cfg;
  });

  config = withAppDelegate(config, (cfg) => {
    if (cfg.modResults.language !== "swift") {
      throw new Error("with-ios-scene-lifecycle: expected a Swift AppDelegate");
    }
    let src = cfg.modResults.contents;

    if (!src.includes("ExpoReactNativeFactoryProvider")) {
      const declaration = "class AppDelegate: ExpoAppDelegate {";
      if (!src.includes(declaration)) {
        throw new Error("with-ios-scene-lifecycle: AppDelegate declaration not found; check the template");
      }
      src = src.replace(declaration, "class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {");
    }

    if (WINDOW_BLOCK.test(src)) {
      src = src.replace(
        WINDOW_BLOCK,
        "\n    // The window is created and React Native is started by the scene delegate\n" +
          "    // (UIScene life cycle, required by the iOS 27 SDK).\n",
      );
    } else if (src.includes("window = UIWindow(frame:")) {
      throw new Error("with-ios-scene-lifecycle: window setup block not found; check the template");
    }

    cfg.modResults.contents = src;
    return cfg;
  });

  return config;
};

module.exports = withIosSceneLifecycle;
