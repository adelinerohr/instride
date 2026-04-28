import { isTrainerWorkingOnDay } from "@instride/shared";
import { format, isSameDay } from "date-fns";
import * as React from "react";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { useRangeSwipe } from "@/features/calendar/hooks/use-range-swipe";
import { HOURS, START_HOUR } from "@/features/calendar/lib/constants";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { cn } from "@/shared/lib/utils";

import { MultiDayRow } from "../fragments/multi-day-row";
import { CalendarTimeline } from "../fragments/timeline";
import { DayColumn } from "./column";

export function DayView() {
  const { swipeHandlers, swipeClassName, wheelTargetRef } = useRangeSwipe({
    enabled: true,
  });
  const {
    selectedTrainerIds,
    trainers,
    selectedDate,
    trainerBusinessHours,
    slotHeight,
  } = useCalendar();

  const selectedTrainers = trainers.filter((trainer) =>
    selectedTrainerIds.includes(trainer.id)
  );

  const availableTrainers = trainers.filter((trainer) => {
    const hours = trainerBusinessHours[trainer.id];
    if (!hours) return true; // still loading -> show by default, don't flicker
    return isTrainerWorkingOnDay({ day: selectedDate, businessHours: hours });
  });

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
    <div className="flex h-full">
      <div className="flex flex-1 flex-col">
        {/* Day header */}
        <div>
          <MultiDayRow />
          <div className="relative z-20 flex border-b">
            <div className="w-18"></div>
            {selectedTrainers.map((trainer) => (
              <span
                key={trainer.id}
                className="flex-1 border-l py-2 text-center text-xs font-medium text-muted-foreground"
              >
                {trainer.member?.authUser?.name}
              </span>
            ))}
          </div>
        </div>

        <div
          className={cn("flex-1 min-h-0", swipeClassName)}
          onPointerDownCapture={(e) => console.log("down", e.pointerType)}
          {...swipeHandlers}
        >
          <ScrollArea className="h-full" ref={setViewportRef}>
            <div className="flex relative">
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
              {/* Day grid */}
              <div className="relative flex-1 flex">
                {availableTrainers.length > 0 ? (
                  availableTrainers.map((trainer) => (
                    <div className="relative flex-1 border-l" key={trainer.id}>
                      <DayColumn
                        key={trainer.id}
                        trainer={trainer}
                        date={selectedDate}
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                    No trainers available on{" "}
                    {format(selectedDate, "EEEE, MMM d")}
                  </div>
                )}

                {isSameDay(selectedDate, new Date()) && <CalendarTimeline />}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
