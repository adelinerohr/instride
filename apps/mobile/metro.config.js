const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable monorepo support — resolve workspace packages
const { resolver } = config;
config.resolver = {
  ...resolver,
  unstable_enablePackageExports: true,
};

const uniwindConfig = withUniwindConfig(
  wrapWithReanimatedMetroConfig(config),
  {
    cssEntryFile: "./global.css",
    dtsFile: "./uniwind-types.d.ts",
  }
);

module.exports = uniwindConfig;
