import { LessonInstanceEnrollment, useLessonInstance } from "@instride/api";
import {
  LessonInstanceEnrollmentStatus,
  LessonInstanceStatus,
} from "@instride/shared";
import { useLocalSearchParams } from "expo-router";
import { cn } from "heroui-native";
import { ActivityIndicator, ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const ENROLLMENT_STATUS_MAP = {
  [LessonInstanceEnrollmentStatus.ENROLLED]: "Enrolled",
  [LessonInstanceEnrollmentStatus.WAITLISTED]: "Waitlisted",
  [LessonInstanceEnrollmentStatus.CANCELLED]: "Cancelled",
  [LessonInstanceEnrollmentStatus.ATTENDED]: "Attended",
  [LessonInstanceEnrollmentStatus.NO_SHOW]: "No Show",
};

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: lesson, isPending, isError } = useLessonInstance(id);

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !lesson) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-sm text-destructive">
          Failed to load lesson details.
        </Text>
      </View>
    );
  }

  const enrollments =
    (lesson as { enrollments?: LessonInstanceEnrollment[] }).enrollments ?? [];

  const isCancelled = lesson.status === LessonInstanceStatus.CANCELLED;
  const isCompleted = lesson.status === LessonInstanceStatus.COMPLETED;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <ScrollView className="flex-1" contentContainerClassName="px-4 py-4 pb-8">
        {/* Header */}
        <View className="mb-4 flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-xl font-bold text-foreground">
              {lesson.name ?? lesson.service?.name ?? "Lesson"}
            </Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              {lesson.service?.name}
            </Text>
          </View>
          <View
            className={cn("rounded-full px-3 py-1", {
              "bg-destructive/10": isCancelled,
              "bg-muted": isCompleted,
              "bg-accent/10": !isCancelled && !isCompleted,
            })}
          >
            <Text
              className={cn("text-sm font-medium", {
                "text-destructive": isCancelled,
                "text-muted-foreground": isCompleted,
                "text-accent": !isCancelled && !isCompleted,
              })}
            >
              {isCancelled
                ? "Cancelled"
                : isCompleted
                  ? "Completed"
                  : "Scheduled"}
            </Text>
          </View>
        </View>

        {/* Details card */}
        <View className="mb-4 overflow-hidden rounded-xl border border-border bg-card">
          <InfoRow label="Start" value={formatDateTime(lesson.start)} />
          <InfoRow label="End" value={formatDateTime(lesson.end)} />
          <InfoRow label="Board" value={lesson.board?.name ?? "—"} />
          <InfoRow label="Max riders" value={String(lesson.maxRiders)} />
          {lesson.notes && <InfoRow label="Notes" value={lesson.notes} />}
        </View>

        {/* Enrollments */}
        {enrollments.length > 0 && (
          <View>
            <Text className="mb-2 text-sm font-semibold text-foreground">
              Enrollments ({enrollments.length})
            </Text>
            <View className="overflow-hidden rounded-xl border border-border bg-card">
              {enrollments.map((enrollment, idx) => (
                <View
                  key={enrollment.id}
                  className={`flex-row items-center justify-between px-4 py-3 ${
                    idx < enrollments.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <Text className="text-sm text-foreground">
                    {enrollment.rider?.member?.authUser?.name}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {ENROLLMENT_STATUS_MAP[enrollment.status]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {lesson.cancelReason && (
          <View className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <Text className="text-xs font-medium text-destructive">
              Cancellation reason
            </Text>
            <Text className="mt-1 text-sm text-foreground">
              {lesson.cancelReason}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="border-b border-border px-4 py-3 last:border-b-0">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="mt-0.5 text-sm text-foreground">{value}</Text>
    </View>
  );
}
