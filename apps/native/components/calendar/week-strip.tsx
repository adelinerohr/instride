import { format, isSameDay } from "date-fns";
import { cn } from "heroui-native";
import * as React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { DAY_CELL_MARGIN, DAY_CELL_WIDTH } from "@/lib/constants";

interface WeekStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  windowDays?: number;
}

export function WeekStrip({
  selectedDate,
  onSelectDate,
  windowDays = 60,
}: WeekStripProps) {
  const scrollRef = React.useRef<ScrollView>(null);
  const today = React.useMemo(() => new Date(), []);

  const days = React.useMemo(() => {
    const result: Date[] = [];
    for (let i = -windowDays; i <= windowDays; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      result.push(d);
    }
    return result;
  }, [today, windowDays]);

  const scrollToSelected = React.useCallback(() => {
    const idx = days.findIndex((d) => isSameDay(d, selectedDate));
    if (idx !== -1) {
      scrollRef.current?.scrollTo({
        x: idx * (DAY_CELL_WIDTH + DAY_CELL_MARGIN * 2) - 120,
        animated: true,
      });
    }
  }, [days, selectedDate]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={scrollToSelected}
      className="py-2"
      contentContainerClassName="px-2"
    >
      {days.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);

        return (
          <Pressable
            key={day.toISOString()}
            onPress={() => onSelectDate(day)}
            className={cn(
              "text-xs font-medium",
              isSelected ? "text-primary" : "text-accent-foreground"
            )}
          >
            <Text className="text-sm font-medium">{format(day, "E")}</Text>
            <Text
              className={cn(
                "mt-1 text-sm font-semibold",
                isSelected && "text-accent-foreground",
                isToday ? "text-accent" : "text-foreground"
              )}
            >
              {day.getDate()}
            </Text>
            {isToday && !isSelected && (
              <View className="mt-1 size-1 rounded-full bg-accent" />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
