import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <View className="flex-1 items-center justify-center gap-3 px-6">
        <Ionicons name="notifications-outline" size={48} color="gray" />
        <Text className="text-base font-semibold text-foreground">
          No notifications
        </Text>
        <Text className="text-center text-sm text-muted-foreground">
          You're all caught up. New activity will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}
