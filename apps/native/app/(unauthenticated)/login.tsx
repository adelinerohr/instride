import { useRouter } from "expo-router";
import { LinkButton, useToast } from "heroui-native";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useOrganization } from "@/contexts/organization-context";
import { useAppForm } from "@/hooks/use-form";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/query-client";

export default function LoginScreen() {
  const router = useRouter();
  const { organization } = useOrganization();
  const { toast } = useToast();

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signIn.email({
        email: value.email,
        password: value.password,
      });

      if (error) {
        toast.show({
          variant: "danger",
          label: "Error signing in",
          description: error.message,
        });
        return;
      }

      // Invalidate session cache so the layout rechecks authentication
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      router.replace("/(authenticated)/(tabs)");
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          <View className="mb-8 items-center">
            <Text className="text-2xl font-bold text-foreground">
              Welcome back
            </Text>
            <Text className="mt-1 text-center text-sm text-muted-foreground">
              Sign in to {organization?.name}
            </Text>
          </View>

          <View className="gap-4">
            <form.AppField
              name="email"
              validators={{
                onSubmit: ({ value }) =>
                  value.trim().length > 0 ? undefined : "Email is required",
              }}
              children={(field) => (
                <field.TextField
                  label="Email"
                  placeholder="Enter your email"
                  required
                />
              )}
            />
            <form.AppField
              name="password"
              validators={{
                onSubmit: ({ value }) => {
                  if (value.trim().length === 0) {
                    return "Password is required";
                  }

                  if (value.trim().length < 8) {
                    return "Password must be at least 8 characters";
                  }

                  return undefined;
                },
              }}
              children={(field) => (
                <field.TextField
                  label="Password"
                  placeholder="Enter your password"
                  required
                />
              )}
            />
            <form.AppForm>
              <form.SubmitButton label="Sign in" />
            </form.AppForm>
          </View>

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-sm text-muted-foreground">
              Don't have an account?
            </Text>
            <LinkButton
              onPress={() => router.push("/(unauthenticated)/register")}
            >
              <LinkButton.Label className="text-accent">
                Sign up
              </LinkButton.Label>
            </LinkButton>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
