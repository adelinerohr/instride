import React, { useCallback, useMemo, useRef } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const DAY_CELL_WIDTH = 44;
const DAY_CELL_MARGIN = 4;

interface WeekStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  /** Number of days to render on each side of today (default 30) */
  windowDays?: number;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function WeekStrip({
  selectedDate,
  onSelectDate,
  windowDays = 30,
}: WeekStripProps) {
  const scrollRef = useRef<ScrollView>(null);
  const today = useMemo(() => new Date(), []);

  const days = useMemo(() => {
    const result: Date[] = [];
    for (let i = -windowDays; i <= windowDays; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      result.push(d);
    }
    return result;
  }, [today, windowDays]);

  const scrollToSelected = useCallback(() => {
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
            style={{ width: DAY_CELL_WIDTH, marginHorizontal: DAY_CELL_MARGIN }}
            className={`items-center rounded-xl py-2 ${
              isSelected ? "bg-primary" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                isSelected
                  ? "text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {DAY_LABELS[day.getDay()]}
            </Text>
            <Text
              className={`mt-1 text-sm font-semibold ${
                isSelected
                  ? "text-primary-foreground"
                  : isToday
                    ? "text-primary"
                    : "text-foreground"
              }`}
            >
              {day.getDate()}
            </Text>
            {isToday && !isSelected && (
              <View className="mt-1 size-1 rounded-full bg-primary" />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
