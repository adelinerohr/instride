import { useCreateTimeBlock, useTrainers } from "@instride/api";
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
import { z } from "zod";

import { useCurrentMember } from "@/contexts/organization-context";
import { useAppForm } from "@/hooks/use-form";

export default function CreateTimeBlockScreen() {
  const router = useRouter();
  const createTimeBlock = useCreateTimeBlock();
  const { toast } = useToast();
  const { member, isTrainer } = useCurrentMember();

  const { data: trainers = [], isPending: trainersPending } = useTrainers();

  const form = useAppForm({
    defaultValues: {
      trainerId: isTrainer && member?.id ? member.id : "",
      start: "",
      end: "",
      reason: null as string | null,
    },
    validators: {
      onSubmit: z
        .object({
          trainerId: z.string().min(1, "Please select a trainer."),
          start: z.string().min(1),
          end: z.string().min(1),
          reason: z.string().nullable(),
        })
        .refine((data) => {
          const startDate = new Date(data.start);
          const endDate = new Date(data.end);

          if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
          ) {
            return "Please enter valid dates.";
          }

          if (endDate <= startDate) {
            return "End time must be after start time.";
          }

          return true;
        }),
    },
    onSubmit: ({ value }) => {
      createTimeBlock.mutateAsync(value, {
        onSuccess: () => {
          toast.show({
            variant: "success",
            label: "Time block created successfully.",
          });
          router.back();
        },
        onError: (error) => {
          toast.show({
            variant: "danger",
            label: "Failed to create time block.",
          });
          console.error(error);
        },
      });
    },
  });

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

          <form.AppField
            name="trainerId"
            children={(field) => (
              <field.SelectField
                label="Trainer"
                description="Select the trainer for this time block"
                placeholder="Select a trainer"
                options={trainers ?? []}
                itemToValue={(trainer) => trainer.id}
                itemToLabel={(trainer) => trainer.member?.authUser?.name ?? ""}
                required
              />
            )}
          />

          <form.AppField
            name="start"
            children={(field) => (
              <field.DatetimeField label="Start date & time" />
            )}
          />

          <form.AppField
            name="end"
            children={(field) => (
              <field.DatetimeField label="End date & time" />
            )}
          />

          <form.AppField
            name="reason"
            children={(field) => <field.TextField label="Reason" textarea />}
          />

          <form.AppForm>
            <form.SubmitButton label="Create time block" />
          </form.AppForm>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
