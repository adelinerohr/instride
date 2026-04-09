import type { types } from "@instride/api";
import { format, isSameMonth, isToday } from "date-fns";

import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { cn } from "@/shared/lib/utils";

import { TOTAL_HEIGHT } from "../../lib/constants";
import type { WeekDayColumn } from "../../lib/types";
import { isTodayWithinVisibleHours } from "../../utils/date";
import { CalendarGrid } from "../fragments/grid";
import { CalendarHours } from "../fragments/hours";
import { LessonCard } from "../fragments/lesson-card";
import { TimeBlockCard } from "../fragments/time-block-card";
import { TimeIndicator } from "../fragments/timeline";

export interface WeekViewProps {
  days: WeekDayColumn[];
  trainersById: Record<string, types.Trainer>;
}

export function WeekView({ days, trainersById }: WeekViewProps) {
  const anchorDate = days[0].date ?? new Date();

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="flex border-b bg-background sticky top-0 z-20">
        <div className="w-14 flex-none" />
        {days.map((day) => (
          <div
            key={day.date.toISOString()}
            className={cn(
              "flex-1 py-2 text-center border-l",
              !isSameMonth(day.date, anchorDate) && "opacity-40"
            )}
          >
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              {format(day.date, "EEE")}
            </div>
            <div
              className={cn(
                "mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                isToday(day.date) && "bg-primary text-primary-foreground"
              )}
            >
              {format(day.date, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Scrollable time grid */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex" style={{ minHeight: TOTAL_HEIGHT }}>
          <CalendarHours />

          {days.map((day) => (
            <div
              key={day.date.toISOString()}
              className="relative flex-1 border-l"
              style={{ height: TOTAL_HEIGHT, minHeight: TOTAL_HEIGHT }}
            >
              <CalendarGrid />

              {day.timeBlocks.map((item) => (
                <TimeBlockCard key={item.id} item={item} />
              ))}

              {day.lessons.map((item) => (
                <LessonCard
                  key={item.id}
                  item={item}
                  trainer={trainersById[item.lesson.trainerMemberId]}
                />
              ))}

              {isTodayWithinVisibleHours(day.date) && <TimeIndicator />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
