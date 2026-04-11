import type { LessonInstance } from "@instride/shared";
import { LessonInstanceStatus } from "@instride/shared";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

interface LessonItemProps {
  lesson: LessonInstance;
}

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusBadgeClass(status: LessonInstance["status"]) {
  switch (status) {
    case LessonInstanceStatus.CANCELLED:
      return "bg-destructive/10 text-destructive";
    case LessonInstanceStatus.COMPLETED:
      return "bg-muted text-muted-foreground";
    default:
      return "bg-primary/10 text-primary";
  }
}

function statusLabel(status: LessonInstance["status"]) {
  switch (status) {
    case LessonInstanceStatus.CANCELLED:
      return "Cancelled";
    case LessonInstanceStatus.COMPLETED:
      return "Completed";
    default:
      return "Scheduled";
  }
}

export function LessonItem({ lesson }: LessonItemProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        router.push(`/(authenticated)/lessons/${lesson.id}` as never)
      }
      className="mb-3 rounded-xl border border-border bg-card p-4 active:opacity-70"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-card-foreground">
            {lesson.name ?? lesson.service?.name ?? "Lesson"}
          </Text>
          <Text className="mt-0.5 text-sm text-muted-foreground">
            {formatTime(lesson.start)} – {formatTime(lesson.end)}
          </Text>
          {lesson.board && (
            <Text className="mt-0.5 text-sm text-muted-foreground">
              {lesson.board.name}
            </Text>
          )}
        </View>

        <View
          className={`rounded-full px-2.5 py-1 ${statusBadgeClass(lesson.status)}`}
        >
          <Text className="text-xs font-medium">
            {statusLabel(lesson.status)}
          </Text>
        </View>
      </View>

      <View className="mt-2 flex-row items-center gap-3">
        <Text className="text-xs text-muted-foreground">
          {lesson.maxRiders} max riders
        </Text>
      </View>
    </Pressable>
  );
}
