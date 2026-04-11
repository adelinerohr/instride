import { useSession } from "@instride/api";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useOrganization } from "@/contexts/organization-context";

export default function AuthenticatedLayout() {
  const { data: session, isPending: isSessionPending } = useSession();
  const { isReady: isOrgReady, error: orgError } = useOrganization();

  if (isSessionPending || !isOrgReady) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session?.session || orgError) {
    return <Redirect href="/(unauthenticated)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="lessons/[id]"
        options={{
          presentation: "card",
          headerShown: true,
          headerTitle: "Lesson",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="lessons/create"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: "New Lesson",
        }}
      />
      <Stack.Screen
        name="time-blocks/create"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: "New Time Block",
        }}
      />
    </Stack>
  );
}
