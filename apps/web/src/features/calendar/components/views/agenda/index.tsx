import type { types } from "@instride/api";
import { format, parseISO, startOfDay } from "date-fns";
import { CalendarX2Icon } from "lucide-react";
import * as React from "react";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/shared/components/ui/empty";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

import { AgendaLessonCard } from "./lesson-card";

export function AgendaView() {
  const { lessons } = useCalendar();

  const lessonsByDay = React.useMemo(() => {
    const allDates = new Map<
      string,
      { date: Date; lessons: types.LessonInstance[] }
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

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        {lessonsByDay.map((dayGroup) => {
          const sortedLessons = [...dayGroup.lessons].sort(
            (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
          );

          return (
            <div className="space-y-4">
              <div className="sticky top-0 flex items-center gap-4 bg-background py-4">
                <p className="text-sm font-semibold">
                  {format(dayGroup.date, "EEEE, MMMM d, yyyy")}
                </p>
              </div>
              <div className="space-y-2">
                {sortedLessons.length > 0 &&
                  sortedLessons.map((lesson) => (
                    <AgendaLessonCard key={lesson.id} lesson={lesson} />
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
