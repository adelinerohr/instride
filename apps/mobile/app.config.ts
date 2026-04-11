import type { ConfigContext, ExpoConfig } from "expo/config";

// Set per EAS build profile via the `env` block in eas.json
const ORGANIZATION_SLUG = process.env.ORGANIZATION_SLUG ?? "instride";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: ORGANIZATION_SLUG,
  slug: ORGANIZATION_SLUG,
  scheme: ORGANIZATION_SLUG,
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  web: {
    bundler: "metro",
  },
  ios: {
    bundleIdentifier: `com.instride.${ORGANIZATION_SLUG}`,
    supportsTablet: true,
  },
  android: {
    package: `com.instride.${ORGANIZATION_SLUG.replace(/-/g, "")}`,
    adaptiveIcon: {
      backgroundColor: "#ffffff",
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
