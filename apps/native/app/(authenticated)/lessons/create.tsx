import Ionicons from "@expo/vector-icons/Ionicons";
import {
  useBoards,
  useCreateLessonSeries,
  useLevels,
  useServices,
  useTrainers,
} from "@instride/api";
import {
  LessonSeriesInputSchema,
  lessonSeriesInputSchema,
} from "@instride/shared";
import { useRouter } from "expo-router";
import { useToast } from "heroui-native";
import * as React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppForm } from "@/hooks/use-form";

export default function CreateLessonScreen() {
  const router = useRouter();
  const createLesson = useCreateLessonSeries();
  const { toast } = useToast();

  const { data: boards, isPending: isPendingBoards } = useBoards();
  const { data: services, isPending: isPendingServices } = useServices();
  const { data: trainers, isPending: isPendingTrainers } = useTrainers();
  const { data: levels, isPending: isPendingLevels } = useLevels();

  const form = useAppForm({
    defaultValues: {
      name: "",
      boardId: "",
      start: new Date().toISOString(),
      trainerId: "",
      levelId: "",
      serviceId: "",
      duration: 0,
      maxRiders: 0,
      isRecurring: false,
      recurrenceFrequency: null,
      recurrenceByDay: null,
      recurrenceEnd: null,
      effectiveFrom: null,
      lastPlannedUntil: null,
      notes: "",
      riderIds: [],
    } as LessonSeriesInputSchema,
    validators: {
      onSubmit: lessonSeriesInputSchema,
    },
    onSubmit: ({ value }) => {
      console.log(value);
      const { riderIds, ...data } = value;

      createLesson.mutateAsync(
        {
          ...value,
          start: data.start,
          effectiveFrom: data.effectiveFrom?.toISOString() ?? null,
          levelId: data.levelId?.trim() === "" ? undefined : data.levelId,
          riderIds,
        },
        {
          onSuccess: () => {
            router.back();
          },
          onError: (error) => {
            toast.show({
              variant: "danger",
              label: "Error creating lesson",
              description: error.message,
              icon: <Ionicons name="alert-circle-outline" />,
            });
          },
        }
      );
    },
  });

  const isLoading =
    isPendingBoards ||
    isPendingServices ||
    isPendingTrainers ||
    isPendingLevels;

  return (
    <SafeAreaView>
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.AppField
              name="name"
              children={(field) => (
                <field.TextField
                  label="Name"
                  placeholder="e.g. Morning Group"
                />
              )}
            />
            <form.AppField
              name="trainerId"
              children={(field) => (
                <field.SelectField
                  label="Trainer"
                  placeholder="Select a trainer"
                  options={trainers ?? []}
                  itemToLabel={(trainer) =>
                    trainer.member?.authUser?.name ?? ""
                  }
                  itemToValue={(trainer) => trainer.id}
                  required
                />
              )}
            />
            <form.AppField
              name="boardId"
              children={(field) => (
                <field.SelectField
                  label="Board"
                  placeholder="Select a board"
                  required
                  options={boards ?? []}
                  itemToLabel={(board) => board.name}
                  itemToValue={(board) => board.id}
                />
              )}
            />
            <form.AppField
              name="levelId"
              children={(field) => (
                <field.SelectField
                  label="Level"
                  placeholder="Select a level"
                  options={levels ?? []}
                  itemToLabel={(level) => level.name}
                  itemToValue={(level) => level.id}
                  required
                />
              )}
            />
            <form.AppField
              name="serviceId"
              children={(field) => (
                <field.SelectField
                  label="Service"
                  placeholder="Select a service"
                  options={services ?? []}
                  itemToLabel={(service) => service.name}
                  itemToValue={(service) => service.id}
                  required
                />
              )}
            />
            <form.AppField
              name="start"
              children={(field) => (
                <field.DatetimeField
                  label="Start"
                  required
                  description="The start date and time of the lesson"
                />
              )}
            />
            <form.AppField
              name="duration"
              children={(field) => (
                <field.TextField
                  label="Duration"
                  placeholder="Enter the duration of the lesson"
                  keyboardType="numeric"
                  required
                />
              )}
            />
            <form.AppForm>
              <form.SubmitButton label="Create Lesson" />
            </form.AppForm>
          </form>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
