import "@/global.css";
import { configureApiClient } from "@instride/api";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AppThemeProvider } from "@/contexts/app-theme-context";
import { OrganizationProvider } from "@/contexts/organization-context";
import { encoreFetcher } from "@/lib/encore-fetcher";
import { queryClient } from "@/lib/query-client";

// Wire up the cookie-aware fetcher for all Encore API calls before any
// component renders. This ensures @instride/api hooks work on mobile.
configureApiClient({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL,
  fetcher: encoreFetcher,
});

export const unstable_settings = {
  initialRouteName: "(authenticated)",
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <AppThemeProvider>
            <HeroUINativeProvider>
              <OrganizationProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(authenticated)" />
                  <Stack.Screen name="(unauthenticated)" />
                </Stack>
              </OrganizationProvider>
            </HeroUINativeProvider>
          </AppThemeProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
