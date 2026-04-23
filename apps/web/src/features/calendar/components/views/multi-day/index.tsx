import { isTrainerWorkingOnDay } from "@instride/shared";
import { addDays, format, isSameDay } from "date-fns";
import * as React from "react";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import {
  HOURS,
  SLOT_HEIGHT,
  START_HOUR,
} from "@/features/calendar/lib/constants";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { cn } from "@/shared/lib/utils";

import { DayColumn } from "../day/column";
import { MultiDayRow } from "../fragments/multi-day-row";
import { CalendarTimeline } from "../fragments/timeline";

export function MultiDayView() {
  const {
    selectedDate,
    selectedTrainerIds,
    trainers,
    selectedMultiDayCount,
    trainerBusinessHours,
  } = useCalendar();

  const days = Array.from({ length: selectedMultiDayCount }, (_, i) =>
    addDays(selectedDate, i)
  );

  const selectedTrainers = trainers.filter((trainer) =>
    selectedTrainerIds.includes(trainer.id)
  );

  const daysWithTrainers = days.map((day) => ({
    day,
    trainers: selectedTrainers.filter((trainer) => {
      const hours = trainerBusinessHours[trainer.id];
      if (!hours) return true; // still loading -> show by default, don't flicker
      return isTrainerWorkingOnDay({ day, businessHours: hours });
    }),
  }));

  const scrollRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const now = new Date();
    const targetHour = days.some((day) => isSameDay(day, now))
      ? now.getHours()
      : 9;
    const offset = Math.max(0, (targetHour - START_HOUR - 1) * SLOT_HEIGHT);

    // Ensure layout is committed before scrolling the viewport.
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: offset, behavior: "smooth" });
    });
  }, [days]);

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col">
        <div>
          <MultiDayRow />

          {/* Two-tier header: day row, then trainer row under it */}
          <div className="relative z-20 flex border-b">
            <div className="w-18" />
            <div
              className="grid flex-1"
              style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
            >
              {days.map((day, dayIdx) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "py-2 text-center text-xs font-medium text-foreground border-l",
                    isSameDay(day, new Date()) && "text-accent",
                    dayIdx !== 0 && "border-primary/30"
                  )}
                >
                  {format(day, "EE")}{" "}
                  <span className="font-semibold">{format(day, "d")}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-20 flex border-b">
            <div className="w-18" />
            <div className="flex flex-1">
              {daysWithTrainers.map(({ day, trainers }, dayIdx) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "flex-1 flex border-l",
                    dayIdx !== 0 && "border-primary/30"
                  )}
                >
                  {trainers.length > 0 ? (
                    trainers.map((trainer, i) => (
                      <span
                        key={trainer.id}
                        className={cn(
                          "flex-1 py-1 text-center text-xs font-medium text-muted-foreground",
                          i !== 0 && "border-l"
                        )}
                      >
                        {trainer.member?.authUser?.name}
                      </span>
                    ))
                  ) : (
                    <span className="flex-1 py-1 text-center text-xs font-medium italic text-muted-foreground">
                      No trainers
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="flex relative">
            {/* Hours column — unchanged */}
            <div className="relative w-18 shrink-0">
              {HOURS.map((hour, index) => (
                <div
                  key={hour}
                  className="relative"
                  style={{ height: `${SLOT_HEIGHT}px` }}
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

            {/* Grid: for each day, render all trainer columns */}
            <div className="relative flex-1 flex">
              {daysWithTrainers.map(({ day, trainers }, dayIdx) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "relative flex-1 flex border-l",
                    dayIdx !== 0 && "border-primary/30"
                  )}
                >
                  {trainers.length > 0 ? (
                    trainers.map((trainer, i) => (
                      <div
                        key={trainer.id}
                        className={cn("relative flex-1", i !== 0 && "border-l")}
                      >
                        <DayColumn trainer={trainer} date={day} />
                      </div>
                    ))
                  ) : (
                    <div className="relative flex-1 flex items-center justify-center text-xs italic text-muted-foreground">
                      No trainers available
                    </div>
                  )}

                  {isSameDay(day, new Date()) && <CalendarTimeline />}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
