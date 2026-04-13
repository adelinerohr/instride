import { ExpoConfig, ConfigContext } from "expo/config";

if (!process.env.ORGANIZATION_SLUG) {
  throw new Error("ORGANIZATION_SLUG is not set");
}

// Set per EAS build profile via the `env` block in eas.json
const ORGANIZATION_SLUG = process.env.ORGANIZATION_SLUG ?? "instride";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: ORGANIZATION_SLUG,
  slug: ORGANIZATION_SLUG,
  orientation: "portrait",
  userInterfaceStyle: "light",
  version: "1.0.0",
  ios: {
    bundleIdentifier: `com.instride.${ORGANIZATION_SLUG}`,
    supportsTablet: true,
  },
  android: {
    package: `com.instride.${ORGANIZATION_SLUG}`,
    adaptiveIcon: {
      backgroundColor: "#000000",
    },
  },
  plugins: ["expo-font", "expo-secure-store"],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    organizationSlug: ORGANIZATION_SLUG,
  },
});
