import { useSession } from "@instride/api";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCurrentMember } from "@/contexts/organization-context";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/query-client";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  trainer: "Trainer",
  rider: "Rider",
  guardian: "Guardian",
};

export default function ProfileScreen() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { member, roles } = useCurrentMember();

  const handleSignOut = async () => {
    await authClient.signOut();
    await queryClient.clear();
    router.replace("/(unauthenticated)/login" as never);
  };

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  const user = session?.user;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <View className="flex-1 px-6 pt-6">
        {/* Avatar placeholder */}
        <View className="mb-6 items-center">
          <View className="size-20 items-center justify-center rounded-full bg-muted">
            <Text className="text-3xl font-bold text-muted-foreground">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <Text className="mt-3 text-xl font-semibold text-foreground">
            {user?.name ?? "—"}
          </Text>
          <Text className="mt-0.5 text-sm text-muted-foreground">
            {user?.email ?? "—"}
          </Text>

          {roles.length > 0 && (
            <View className="mt-2 flex-row flex-wrap justify-center gap-1.5">
              {roles.map((role) => (
                <View
                  key={role}
                  className="rounded-full bg-primary/10 px-2.5 py-1"
                >
                  <Text className="text-xs font-medium text-primary">
                    {ROLE_LABELS[role] ?? role}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Info rows */}
        <View className="rounded-xl border border-border bg-card">
          {user?.phone ? (
            <View className="border-b border-border px-4 py-3">
              <Text className="text-xs text-muted-foreground">Phone</Text>
              <Text className="mt-0.5 text-sm text-foreground">
                {user.phone}
              </Text>
            </View>
          ) : null}

          <View className="px-4 py-3">
            <Text className="text-xs text-muted-foreground">Member since</Text>
            <Text className="mt-0.5 text-sm text-foreground">
              {member?.createdAt
                ? new Date(member.createdAt).toLocaleDateString()
                : "—"}
            </Text>
          </View>
        </View>

        <View className="mt-6">
          <Pressable
            onPress={handleSignOut}
            className="items-center rounded-xl border border-destructive/50 py-3.5 active:opacity-70"
          >
            <Text className="text-base font-medium text-destructive">
              Sign out
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
