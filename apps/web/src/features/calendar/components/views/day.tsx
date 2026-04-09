import { isToday } from "date-fns";

import { CalendarGrid } from "@/features/calendar/components/fragments/grid";
import { CalendarHours } from "@/features/calendar/components/fragments/hours";
import { TOTAL_HEIGHT } from "@/features/calendar/lib/constants";

import type { DayTrainerColumn } from "../../lib/types";
import { isTodayWithinVisibleHours } from "../../utils/date";
import { LessonCard } from "../fragments/lesson-card";
import { TimeBlockCard } from "../fragments/time-block-card";
import { TimeIndicator } from "../fragments/timeline";

export interface DayViewProps {
  date: Date;
  columns: DayTrainerColumn[];
}

export function DayView({ date, columns }: DayViewProps) {
  if (columns.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No trainers selected.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Trainer column headers */}
      <div className="flex border-b bg-background sticky top-0 z-20">
        <div className="w-14 flex-none" />
        {columns.map((column) => (
          <div
            key={column.trainer.id}
            className="flex-1 py-3 text-center border-l text-sm font-medium"
          >
            {column.trainer.member.authUser.name}
          </div>
        ))}
      </div>

      {/* Scrollable time grid */}
      <div className="flex-1 overflow-auto">
        <div className="flex" style={{ minHeight: TOTAL_HEIGHT }}>
          <CalendarHours />

          {columns.map((column) => (
            <div
              key={column.trainer.id}
              className="relative flex-1 border-l"
              style={{ height: TOTAL_HEIGHT, minHeight: TOTAL_HEIGHT }}
            >
              <CalendarGrid />

              {column.timeBlocks.map((item) => (
                <TimeBlockCard key={item.id} item={item} />
              ))}

              {column.lessons.map((item) => (
                <LessonCard
                  key={item.id}
                  item={item}
                  trainer={column.trainer}
                />
              ))}

              {isToday(date) && isTodayWithinVisibleHours(date) && (
                <TimeIndicator />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
