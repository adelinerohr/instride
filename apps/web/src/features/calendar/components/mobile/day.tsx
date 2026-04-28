import { isWorkingHour } from "@instride/shared";
import { areIntervalsOverlapping, format, isSameDay, parseISO } from "date-fns";
import * as React from "react";

import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { cn } from "@/shared/lib/utils";

import { useCalendar } from "../../hooks/use-calendar";
import { useRangeSwipe } from "../../hooks/use-range-swipe";
import { HOURS, SLOT_HEIGHT, START_HOUR } from "../../lib/constants";
import { getLessonBlockStyle, groupLessons } from "../../utils/lesson";
import { HourCell } from "../views/fragments/hour-cell";
import { LessonBlock } from "../views/fragments/lesson-block";
import { CalendarTimeline } from "../views/fragments/timeline";

export function MobileDayView() {
  const { swipeHandlers, swipeClassName, wheelTargetRef } = useRangeSwipe({
    enabled: true,
  });
  const {
    selectedDate,
    lessons,
    selectedTrainerIds,
    trainerBusinessHours,
    slotHeight,
  } = useCalendar();

  const currentTrainerBusinessHours =
    trainerBusinessHours[selectedTrainerIds[0]];

  const groupedLessons = groupLessons(
    lessons.filter((lesson) => lesson.trainer?.id === selectedTrainerIds[0])
  );

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
    const targetHour = isSameDay(now, selectedDate) ? now.getHours() : 9;
    const offset = Math.max(0, (targetHour - START_HOUR - 1) * slotHeight);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: offset, behavior: "smooth" });
    });
  }, [selectedDate, slotHeight]);

  return (
    <div
      className={cn("flex-1 min-h-0", swipeClassName)}
      onPointerDownCapture={(e) => console.log("down", e.pointerType)}
      {...swipeHandlers}
    >
      <ScrollArea className="h-full" ref={setViewportRef}>
        <div className="relative flex">
          {/* Hour labels */}
          <div className="w-14 shrink-0">
            {HOURS.map((hour, index) => (
              <div
                key={hour}
                className="relative"
                style={{ height: `${SLOT_HEIGHT}px` }}
              >
                {index !== 0 && (
                  <span className="absolute -top-2 right-2 text-xs text-muted-foreground">
                    {format(new Date().setHours(hour, 0, 0, 0), "h a")}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Day timeline */}
          <div className="relative flex-1 border-l">
            {HOURS.map((hour, index) => {
              const isDisabled = !isWorkingHour({
                day: selectedDate,
                hour,
                businessHours: currentTrainerBusinessHours,
              });

              return (
                <HourCell
                  key={hour}
                  isDisabled={isDisabled}
                  index={index}
                  day={selectedDate}
                  hour={hour}
                />
              );
            })}

            {groupedLessons.map((group, groupIndex) =>
              group.map((lesson) => {
                let style = getLessonBlockStyle(
                  lesson,
                  selectedDate,
                  groupIndex,
                  groupedLessons.length,
                  slotHeight
                );
                const hasOverlap = groupedLessons.some(
                  (otherGroup, otherIndex) =>
                    otherIndex !== groupIndex &&
                    otherGroup.some((otherLesson) =>
                      areIntervalsOverlapping(
                        {
                          start: parseISO(lesson.start),
                          end: parseISO(lesson.end),
                        },
                        {
                          start: parseISO(otherLesson.start),
                          end: parseISO(otherLesson.end),
                        }
                      )
                    )
                );

                if (!hasOverlap)
                  style = { ...style, width: "100%", left: "0%" };

                return (
                  <div key={lesson.id} className="absolute p-1" style={style}>
                    <LessonBlock lesson={lesson} />
                  </div>
                );
              })
            )}

            {/* Current time indicator (only when viewing today) */}
            {isSameDay(selectedDate, new Date()) && <CalendarTimeline />}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
