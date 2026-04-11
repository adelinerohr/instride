import { useCreateTimeBlock, useTrainers } from "@instride/api";
import { useRouter } from "expo-router";
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

function FormField({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <View>
      <Text className="mb-1.5 text-sm font-medium text-foreground">
        {label}
      </Text>
      {children}
      {hint && (
        <Text className="mt-1 text-xs text-muted-foreground">{hint}</Text>
      )}
    </View>
  );
}

export default function CreateTimeBlockScreen() {
  const router = useRouter();
  const { data: trainers = [], isPending: trainersPending } = useTrainers();

  const [trainerId, setTrainerId] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 2);
    return d.toISOString().slice(0, 16);
  });
  const [error, setError] = useState<string | null>(null);

  const { mutate: createTimeBlock, isPending } = useCreateTimeBlock({
    mutationConfig: {
      onSuccess: () => router.back(),
      onError: (err) =>
        setError(err.message ?? "Failed to create time block."),
    },
  });

  const trainerItems = trainers.map((t) => ({
    id: t.id,
    name: t.member?.authUser?.name ?? t.id,
  }));

  const handleCreate = () => {
    setError(null);

    if (!trainerId) {
      setError("Please select a trainer.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError("Please enter valid start and end dates.");
      return;
    }

    if (end <= start) {
      setError("End time must be after start time.");
      return;
    }

    createTimeBlock({
      trainerId,
      title: title.trim() || null,
      notes: notes.trim() || null,
      start: start.toISOString(),
      end: end.toISOString(),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 py-4 gap-5 pb-8"
          keyboardShouldPersistTaps="handled"
        >
          {trainersPending && (
            <View className="items-center py-4">
              <ActivityIndicator />
            </View>
          )}

          <FormField label="Title (optional)">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Unavailable"
              className="rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground"
            />
          </FormField>

          <FormField label="Start date & time">
            <TextInput
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DDTHH:MM"
              keyboardType="numbers-and-punctuation"
              className="rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground"
            />
          </FormField>

          <FormField label="End date & time">
            <TextInput
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DDTHH:MM"
              keyboardType="numbers-and-punctuation"
              className="rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground"
            />
          </FormField>

          <FormField label="Trainer">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="py-1"
            >
              <View className="flex-row gap-2">
                {trainerItems.map((trainer) => (
                  <Pressable
                    key={trainer.id}
                    onPress={() => setTrainerId(trainer.id)}
                    className={`rounded-lg border px-3 py-2 ${
                      trainer.id === trainerId
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        trainer.id === trainerId
                          ? "font-medium text-primary"
                          : "text-foreground"
                      }`}
                    >
                      {trainer.name}
                    </Text>
                  </Pressable>
                ))}
                {trainerItems.length === 0 && !trainersPending && (
                  <Text className="py-2 text-sm text-muted-foreground">
                    No trainers available
                  </Text>
                )}
              </View>
            </ScrollView>
          </FormField>

          <FormField label="Notes (optional)">
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional context…"
              multiline
              numberOfLines={3}
              className="rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground"
              style={{ minHeight: 80, textAlignVertical: "top" }}
            />
          </FormField>

          {error && (
            <Text className="text-sm text-destructive">{error}</Text>
          )}

          <Pressable
            onPress={handleCreate}
            disabled={isPending}
            className="items-center rounded-xl bg-primary py-3.5 active:opacity-80 disabled:opacity-50"
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-base font-semibold text-primary-foreground">
                Create time block
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
