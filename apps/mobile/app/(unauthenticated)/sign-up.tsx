import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/lib/auth-client";
import { queryClient as appQueryClient } from "@/lib/query-client";

const ORGANIZATION_SLUG =
  process.env.EXPO_PUBLIC_ORGANIZATION_SLUG ?? "instride";

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Sign up failed.");
        return;
      }

      await appQueryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      router.replace("/(authenticated)/(tabs)" as never);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
              Create account
            </Text>
            <Text className="mt-1 text-center text-sm text-muted-foreground">
              Join {ORGANIZATION_SLUG}
            </Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="mb-1.5 text-sm font-medium text-foreground">
                Full name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Jane Smith"
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
                className="rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground"
              />
            </View>

            <View>
              <Text className="mb-1.5 text-sm font-medium text-foreground">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
                className="rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground"
              />
            </View>

            <View>
              <Text className="mb-1.5 text-sm font-medium text-foreground">
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
                className="rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground"
              />
              <Text className="mt-1 text-xs text-muted-foreground">
                Minimum 8 characters
              </Text>
            </View>

            {error && (
              <Text className="text-sm text-destructive">{error}</Text>
            )}

            <Pressable
              onPress={handleSignUp}
              disabled={isLoading}
              className="mt-2 items-center rounded-xl bg-primary py-3.5 active:opacity-80 disabled:opacity-50"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-semibold text-primary-foreground">
                  Create account
                </Text>
              )}
            </Pressable>
          </View>

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-sm text-muted-foreground">
              Already have an account?
            </Text>
            <Link href="/(unauthenticated)/login" asChild>
              <Pressable>
                <Text className="text-sm font-medium text-primary">
                  Sign in
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
