import type { LessonInstance } from "@instride/api";
import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { CalendarX2Icon } from "lucide-react";
import * as React from "react";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import {
  LessonCard,
  LessonCardVariant,
} from "@/features/lessons/components/fragments/lesson-card";
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/shared/components/ui/empty";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { cn } from "@/shared/lib/utils";

export function AgendaView() {
  const { lessons } = useCalendar();

  const lessonsByDay = React.useMemo(() => {
    const allDates = new Map<
      string,
      { date: Date; lessons: LessonInstance[] }
    >();

    lessons.forEach((lesson) => {
      const lessonDate = parseISO(lesson.start);
      const dateKey = format(lessonDate, "yyyy-MM-dd");

      if (!allDates.has(dateKey)) {
        allDates.set(dateKey, { date: startOfDay(lessonDate), lessons: [] });
      }

      allDates.get(dateKey)?.lessons.push(lesson);
    });

    return Array.from(allDates.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  }, [lessons]);

  const hasAnyLessons = lessons.length > 0;

  // TODO: Add auto-scroll to current day

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        {lessonsByDay.map((dayGroup) => {
          const sortedLessons = [...dayGroup.lessons].sort(
            (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
          );

          const hasPassed = isBefore(dayGroup.date, startOfDay(new Date()));

          return (
            <div
              className={cn("space-y-4", hasPassed && "opacity-50")}
              key={dayGroup.date.toISOString()}
            >
              <div className="sticky top-0 flex items-center gap-2 bg-background">
                <span className="text-2xl font-display leading-none font-semibold">
                  {format(dayGroup.date, "dd")}
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-medium">
                    {format(dayGroup.date, "EEEE")}
                  </span>
                </span>
                <div className="w-full h-px bg-border" />
                <span className="text-xs text-muted-foreground text-nowrap">
                  {sortedLessons.length} lesson
                  {sortedLessons.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-2">
                {sortedLessons.length > 0 &&
                  sortedLessons.map((lesson) => (
                    <LessonCard
                      variant={LessonCardVariant.AGENDA}
                      lesson={lesson}
                    />
                  ))}
              </div>
            </div>
          );
        })}

        {!hasAnyLessons && (
          <Empty className="border border-dashed w-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarX2Icon className="size-6" />
              </EmptyMedia>
              <EmptyTitle>No lessons scheduled</EmptyTitle>
              <EmptyDescription>
                You don't have any lessons scheduled for the selected month.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </ScrollArea>
  );
}
