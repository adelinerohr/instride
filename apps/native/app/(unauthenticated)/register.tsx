import { useRouter } from "expo-router";
import { LinkButton } from "heroui-native";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useOrganization } from "@/contexts/organization-context";
import { useAppForm } from "@/hooks/use-form";

export default function RegisterScreen() {
  const router = useRouter();
  const { organization } = useOrganization();

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8 items-center">
            <Text className="text-2xl font-bold text-foreground">
              Create an account
            </Text>
            <Text className="mt-1 text-center text-sm text-muted">
              Join {organization?.name}
            </Text>
          </View>

          <View className="space-y-4">
            <form.AppField
              name="name"
              children={(field) => (
                <field.TextField
                  label="Name"
                  placeholder="Enter your name"
                  required
                />
              )}
            />
            <form.AppField
              name="email"
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
              children={(field) => (
                <field.TextField
                  label="Password"
                  placeholder="Enter your password"
                  required
                />
              )}
            />
            <form.AppField
              name="confirmPassword"
              children={(field) => (
                <field.TextField
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  required
                />
              )}
            />
            <form.AppForm>
              <form.SubmitButton label="Create account" />
            </form.AppForm>
          </View>

          <View className="mt-8 flex-row items-center justify-between gap-1">
            <Text className="text-sm text-muted">Already have an account?</Text>
            <LinkButton onPress={() => router.push("/(unauthenticated)/login")}>
              <LinkButton.Label className="text-accent">
                Sign in
              </LinkButton.Label>
            </LinkButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
