import { ExpoConfig, ConfigContext } from "expo/config";

if (!process.env.ORGANIZATION_SLUG) {
  throw new Error("ORGANIZATION_SLUG is not set");
}

const organizationSlug = process.env.ORGANIZATION_SLUG;
const organizationName = process.env.ORGANIZATION_NAME;
const bundleIdSuffix = process.env.BUNDLE_ID_SUFFIX ?? "instride";
const primaryColor = process.env.PRIMARY_COLOR ?? "#000000";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: organizationName,
  slug: organizationSlug,
  orientation: "portrait",
  userInterfaceStyle: "light",
  version: "1.0.0",
  icon: `./assets/organizations/${organizationSlug}/icon.png`,
  splash: {
    image: `./assets/organizations/${organizationSlug}/splash.png`,
    backgroundColor: primaryColor,
  },
  ios: {
    bundleIdentifier: `com.instride.${bundleIdSuffix}`,
    buildNumber: "1",
  },
  android: {
    package: `com.instride.${bundleIdSuffix}`,
    adaptiveIcon: {
      foregroundImage: `./assets/organizations/${organizationSlug}/adaptive-icon.png`,
      backgroundColor: primaryColor,
    },
  },
  plugins: ["expo-font"],
  extra: {
    organizationSlug: organizationSlug,
    primaryColor,
  },
  experiments: {
    typedRoutes: true,
  },
});
