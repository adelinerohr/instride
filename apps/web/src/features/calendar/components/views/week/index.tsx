import { isWorkingHour } from "@instride/shared";
import {
  addDays,
  areIntervalsOverlapping,
  format,
  isSameDay,
  isSameWeek,
  parseISO,
  startOfWeek,
} from "date-fns";
import * as React from "react";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { useRangeSwipe } from "@/features/calendar/hooks/use-range-swipe";
import { HOURS, START_HOUR } from "@/features/calendar/lib/constants";
import { getBlockStyle, groupEvents } from "@/features/calendar/utils/lesson";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { cn } from "@/shared/lib/utils";

import { HourCell } from "../fragments/hour-cell";
import { LessonBlock } from "../fragments/lesson-block";
import { MultiDayRow } from "../fragments/multi-day-row";
import { TimeBlock } from "../fragments/time-block";
import { CalendarTimeline } from "../fragments/timeline";

export function WeekView() {
  const { swipeHandlers, swipeClassName, wheelTargetRef } = useRangeSwipe({
    enabled: true,
  });
  const {
    selectedDate,
    organizationBusinessHours,
    lessons,
    timeBlocks,
    slotHeight,
  } = useCalendar();

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Scroll to "now" on mount / selected date change
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Combined ref callback for both scrollRef and wheelTargetRef
  const setViewportRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      scrollRef.current = el;
      wheelTargetRef.current = el;
    },
    [wheelTargetRef]
  );

  React.useLayoutEffect(() => {
    const now = new Date();
    const targetHour = isSameWeek(now, weekStart) ? now.getHours() : 9;
    const offset = Math.max(0, (targetHour - START_HOUR - 1) * slotHeight);

    // Ensure layout is committed before scrolling the viewport.
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: offset, behavior: "smooth" });
    });
  }, [weekStart, slotHeight]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0">
        <MultiDayRow />
        <div className="relative z-20 flex border-b">
          <div className="w-18" />
          <div className="grid flex-1 grid-cols-7 divide-x border-l">
            {weekDays.map((day, index) => (
              <span
                key={index}
                className={cn(
                  "py-2 text-center text-xs font-medium text-muted-foreground",
                  isSameDay(day, new Date()) && "text-accent"
                )}
              >
                {format(day, "EE")}
                <span
                  className={cn(
                    "ml-1 font-semibold text-foreground",
                    isSameDay(day, new Date()) && "text-accent"
                  )}
                >
                  {format(day, "d")}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={cn("flex-1 min-h-0", swipeClassName)} {...swipeHandlers}>
        <ScrollArea className="flex-1 min-h-0 h-full" ref={setViewportRef}>
          <div className="flex overflow-hidden">
            {/* Hours column */}
            <div className="relative w-18 shrink-0">
              {HOURS.map((hour, index) => (
                <div
                  key={hour}
                  className="relative"
                  style={{ height: `${slotHeight}px` }}
                >
                  <div className="absolute -top-3 right-2 flex h-6 items-center">
                    {index !== 0 && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date().setHours(hour, 0, 0, 0), "hh a")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Week grid */}
            <div className="relative flex-1 border-l">
              <div className="grid grid-cols-7 divide-x">
                {weekDays.map((day, dayIndex) => {
                  const dayLessons = lessons.filter((lesson) =>
                    isSameDay(new Date(lesson.start), day)
                  );
                  const dayTimeBlocks = timeBlocks.filter((timeBlock) =>
                    isSameDay(new Date(timeBlock.start), day)
                  );
                  const groupedEvents = groupEvents(dayLessons, dayTimeBlocks);

                  return (
                    <div key={dayIndex} className="relative">
                      {HOURS.map((hour, index) => {
                        const isDisabled = !isWorkingHour({
                          day,
                          hour,
                          businessHours: organizationBusinessHours,
                        });

                        return (
                          <HourCell
                            key={hour}
                            day={day}
                            hour={hour}
                            isDisabled={isDisabled}
                            index={index}
                          />
                        );
                      })}

                      {groupedEvents.map((group, groupIndex) =>
                        group.map((event) => {
                          let style = getBlockStyle({
                            start: event.start,
                            end: event.end,
                            day,
                            groupIndex,
                            groupSize: groupedEvents.length,
                            slotHeight,
                          });

                          const hasOverlap = groupedEvents.some(
                            (otherGroup, otherIndex) =>
                              otherIndex !== groupIndex &&
                              otherGroup.some((otherEvent) =>
                                areIntervalsOverlapping(
                                  {
                                    start: parseISO(event.start),
                                    end: parseISO(event.end),
                                  },
                                  {
                                    start: parseISO(otherEvent.start),
                                    end: parseISO(otherEvent.end),
                                  }
                                )
                              )
                          );

                          if (!hasOverlap)
                            style = { ...style, width: "100%", left: "0%" };

                          if ("reason" in event) {
                            return (
                              <div
                                key={event.id}
                                className="absolute p-1"
                                style={style}
                              >
                                <TimeBlock timeBlock={event} />
                              </div>
                            );
                          }

                          return (
                            <div
                              key={event.id}
                              className="absolute p-1"
                              style={style}
                            >
                              <LessonBlock lesson={event} />
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
              <CalendarTimeline />
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
