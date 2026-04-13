import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-xl font-semibold text-foreground">
          Page not found
        </Text>
        <Text className="mt-2 text-center text-sm text-muted-foreground">
          The screen you're looking for doesn't exist.
        </Text>
        <Link href="/" className="mt-6">
          <Text className="text-sm font-medium text-primary">Go home</Text>
        </Link>
      </View>
    </>
  );
}
