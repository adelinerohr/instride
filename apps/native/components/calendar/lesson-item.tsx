import { types } from "@instride/api";
import { LessonInstanceStatus } from "@instride/shared";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { cn } from "heroui-native";
import { Pressable, Text, View } from "react-native";

const STATUS_LABEL = {
  [LessonInstanceStatus.CANCELLED]: "Cancelled",
  [LessonInstanceStatus.COMPLETED]: "Completed",
  [LessonInstanceStatus.SCHEDULED]: "Scheduled",
};

interface LessonItemProps {
  lesson: types.LessonInstance;
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
            {format(lesson.start, "h:mm a")} – {format(lesson.end, "h:mm a")}
          </Text>
          {lesson.board && (
            <Text className="mt-0.5 text-sm text-muted-foreground">
              {lesson.board.name}
            </Text>
          )}
        </View>

        <View
          className={cn(
            "rounded-full px-2.5 py-1",
            lesson.status === LessonInstanceStatus.CANCELLED &&
              "bg-destructive/10 text-destructive",
            lesson.status === LessonInstanceStatus.COMPLETED &&
              "bg-muted text-accent-foreground",
            lesson.status === LessonInstanceStatus.SCHEDULED &&
              "bg-accent/10 text-accent"
          )}
        >
          <Text className="text-xs font-medium">
            {STATUS_LABEL[lesson.status]}
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
