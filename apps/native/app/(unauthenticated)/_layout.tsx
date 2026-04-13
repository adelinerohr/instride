import { useSession } from "@instride/api";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function UnauthenticatedLayout() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (session?.session) {
    return <Redirect href="/(authenticated)/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
