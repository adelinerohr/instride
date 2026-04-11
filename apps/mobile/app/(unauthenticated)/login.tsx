import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/lib/auth-client";
import { queryClient as appQueryClient } from "@/lib/query-client";

const ORGANIZATION_SLUG =
  process.env.EXPO_PUBLIC_ORGANIZATION_SLUG ?? "instride";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Sign in failed.");
        return;
      }

      // Invalidate session cache so the layout re-checks auth
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
        <View className="flex-1 justify-center px-6">
          <View className="mb-8 items-center">
            <Text className="text-2xl font-bold text-foreground">
              Welcome back
            </Text>
            <Text className="mt-1 text-center text-sm text-muted-foreground">
              Sign in to {ORGANIZATION_SLUG}
            </Text>
          </View>

          <View className="gap-4">
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
                autoComplete="current-password"
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
                className="rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground"
              />
            </View>

            {error && (
              <Text className="text-sm text-destructive">{error}</Text>
            )}

            <Pressable
              onPress={handleSignIn}
              disabled={isLoading}
              className="mt-2 items-center rounded-xl bg-primary py-3.5 active:opacity-80 disabled:opacity-50"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-semibold text-primary-foreground">
                  Sign in
                </Text>
              )}
            </Pressable>
          </View>

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-sm text-muted-foreground">
              Don't have an account?
            </Text>
            <Link href="/(unauthenticated)/sign-up" asChild>
              <Pressable>
                <Text className="text-sm font-medium text-primary">
                  Sign up
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
