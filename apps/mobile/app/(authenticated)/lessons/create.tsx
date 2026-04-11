import {
  useBoards,
  useCreateLessonSeries,
  useServices,
  useTrainers,
} from "@instride/api";
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

function SelectPicker<T extends { id: string; name: string }>({
  items,
  selectedId,
  onSelect,
  placeholder,
}: {
  items: T[];
  selectedId: string;
  onSelect: (id: string) => void;
  placeholder: string;
}) {
  const selected = items.find((i) => i.id === selectedId);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="py-1"
    >
      <View className="flex-row gap-2">
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            className={`rounded-lg border px-3 py-2 ${
              item.id === selectedId
                ? "border-primary bg-primary/10"
                : "border-border bg-card"
            }`}
          >
            <Text
              className={`text-sm ${
                item.id === selectedId
                  ? "font-medium text-primary"
                  : "text-foreground"
              }`}
            >
              {item.name}
            </Text>
          </Pressable>
        ))}
        {items.length === 0 && (
          <Text className="py-2 text-sm text-muted-foreground">
            {placeholder}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

export default function CreateLessonScreen() {
  const router = useRouter();

  const { data: boards = [], isPending: boardsPending } = useBoards();
  const { data: services = [], isPending: servicesPending } = useServices();
  const { data: trainers = [], isPending: trainersPending } = useTrainers();

  const [name, setName] = useState("");
  const [boardId, setBoardId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [trainerId, setTrainerId] = useState("");
  const [maxRiders, setMaxRiders] = useState("6");
  const [duration, setDuration] = useState("60");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
  });
  const [error, setError] = useState<string | null>(null);

  const { mutate: createLesson, isPending } = useCreateLessonSeries({
    mutationConfig: {
      onSuccess: () => router.back(),
      onError: (err) =>
        setError(err.message ?? "Failed to create lesson."),
    },
  });

  const boardItems = boards.map((b) => ({ id: b.id, name: b.name }));
  const serviceItems = services.map((s) => ({ id: s.id, name: s.name }));
  const trainerItems = trainers.map((t) => ({
    id: t.id,
    name: t.member?.authUser?.name ?? t.id,
  }));

  const handleCreate = () => {
    setError(null);

    if (!boardId || !serviceId || !trainerId) {
      setError("Please select a board, service, and trainer.");
      return;
    }

    const durationNum = parseInt(duration, 10);
    const maxRidersNum = parseInt(maxRiders, 10);

    if (Number.isNaN(durationNum) || durationNum <= 0) {
      setError("Duration must be a positive number of minutes.");
      return;
    }
    if (Number.isNaN(maxRidersNum) || maxRidersNum <= 0) {
      setError("Max riders must be a positive number.");
      return;
    }

    createLesson({
      name: name.trim() || null,
      boardId,
      serviceId,
      trainerMemberId: trainerId,
      maxRiders: maxRidersNum,
      duration: durationNum,
      notes: notes.trim() || null,
      start: new Date(startDate).toISOString(),
      isRecurring: false,
      recurrenceFrequency: null,
      recurrenceByDay: null,
      recurrenceEnd: null,
      levelId: null,
      effectiveFrom: null,
      lastPlannedUntil: null,
    });
  };

  const isLoading = boardsPending || servicesPending || trainersPending;

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
          {isLoading && (
            <View className="items-center py-4">
              <ActivityIndicator />
            </View>
          )}

          <FormField label="Name (optional)">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Morning Dressage"
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

          <FormField label="Duration (minutes)">
            <TextInput
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              className="rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground"
            />
          </FormField>

          <FormField label="Max riders">
            <TextInput
              value={maxRiders}
              onChangeText={setMaxRiders}
              keyboardType="number-pad"
              className="rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground"
            />
          </FormField>

          <FormField label="Board">
            <SelectPicker
              items={boardItems}
              selectedId={boardId}
              onSelect={setBoardId}
              placeholder="No boards available"
            />
          </FormField>

          <FormField label="Service">
            <SelectPicker
              items={serviceItems}
              selectedId={serviceId}
              onSelect={setServiceId}
              placeholder="No services available"
            />
          </FormField>

          <FormField label="Trainer">
            <SelectPicker
              items={trainerItems}
              selectedId={trainerId}
              onSelect={setTrainerId}
              placeholder="No trainers available"
            />
          </FormField>

          <FormField label="Notes (optional)">
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional notes…"
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
                Create lesson
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
