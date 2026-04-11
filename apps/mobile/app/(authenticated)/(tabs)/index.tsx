import { useListLessonInstances } from "@instride/api";
import type { LessonInstance } from "@instride/shared";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LessonItem } from "@/components/calendar/lesson-item";
import { WeekStrip } from "@/components/calendar/week-strip";
import { useCurrentMember } from "@/contexts/organization-context";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CalendarScreen() {
  const router = useRouter();
  const { isAdminOrTrainer } = useCurrentMember();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch a rolling 60-day window centred on today
  const rangeFrom = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return startOfDay(d);
  }, []);

  const rangeTo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return endOfDay(d);
  }, []);

  const { data: instances, isPending, isError } = useListLessonInstances(rangeFrom, rangeTo);

  const dayLessons = useMemo<LessonInstance[]>(() => {
    if (!instances) return [];
    return instances.filter((lesson) =>
      isSameDay(new Date(lesson.start), selectedDate)
    );
  }, [instances, selectedDate]);

  const formattedDate = selectedDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <View className="border-b border-border" />

      <View className="flex-1 px-4 pt-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-base font-semibold text-foreground">
            {formattedDate}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {dayLessons.length} lesson{dayLessons.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {isPending ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-sm text-destructive">
              Failed to load lessons
            </Text>
          </View>
        ) : (
          <FlatList
            data={dayLessons}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <LessonItem lesson={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerClassName={
              dayLessons.length === 0 ? "flex-1" : "pb-24"
            }
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-16">
                <Text className="text-sm text-muted-foreground">
                  No lessons on this day
                </Text>
              </View>
            }
          />
        )}
      </View>

      {isAdminOrTrainer && (
        <View className="absolute bottom-8 right-6 gap-3">
          <Pressable
            onPress={() =>
              router.push("/(authenticated)/time-blocks/create" as never)
            }
            className="size-12 items-center justify-center rounded-full bg-secondary shadow-md active:opacity-70"
          >
            <Text className="text-xl font-bold text-secondary-foreground">
              ⏱
            </Text>
          </Pressable>
          <Pressable
            onPress={() =>
              router.push("/(authenticated)/lessons/create" as never)
            }
            className="size-14 items-center justify-center rounded-full bg-primary shadow-lg active:opacity-70"
          >
            <Text className="text-2xl font-bold text-primary-foreground">
              +
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
