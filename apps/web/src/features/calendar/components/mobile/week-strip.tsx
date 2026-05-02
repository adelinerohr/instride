import { addDays, addWeeks, format, isSameDay, startOfWeek } from "date-fns";
import * as React from "react";

import { cn } from "@/shared/lib/utils";

import { useCalendar } from "../../hooks/use-calendar";
import { useHorizontalSwipeNavigate } from "../../hooks/use-horizontal-swipe-navigate";

export function MobileWeekStrip() {
  const { selectedDate, setSelectedDate } = useCalendar();

  /** Monday of the week shown in the strip; swipe only updates this, not `selectedDate`. */
  const [stripWeekStart, setStripWeekStart] = React.useState(() =>
    startOfWeek(selectedDate, { weekStartsOn: 1 })
  );

  React.useEffect(() => {
    const target = startOfWeek(selectedDate, { weekStartsOn: 1 });
    setStripWeekStart((prev) =>
      prev.getTime() === target.getTime() ? prev : target
    );
  }, [selectedDate]);

  const navigateWeek = React.useCallback((direction: "previous" | "next") => {
    setStripWeekStart((prev) => addWeeks(prev, direction === "next" ? 1 : -1));
  }, []);

  const { swipeHandlers, swipeClassName, wheelTargetRef } =
    useHorizontalSwipeNavigate({
      onNavigate: navigateWeek,
    });

  const setStripRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      wheelTargetRef.current = el;
    },
    [wheelTargetRef]
  );

  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => addDays(stripWeekStart, i));

  return (
    <div
      ref={setStripRef}
      className={cn(
        "flex items-center justify-between gap-1 px-2 pb-3 text-primary-foreground",
        swipeClassName
      )}
      {...swipeHandlers}
    >
      {days.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);
        return (
          <button
            key={day.toISOString()}
            type="button"
            onClick={() => setSelectedDate(day)}
            className={cn(
              "flex flex-1 flex-col items-center rounded-md py-1.5 text-[10px] font-medium tracking-wide transition-colors",
              isSelected
                ? "bg-accent text-accent-foreground"
                : "text-primary-foreground/70 hover:bg-primary-foreground/10",
              isToday && !isSelected && "text-accent"
            )}
          >
            <span className="uppercase">{format(day, "EEE")}</span>
            <span className="text-base font-bold">{format(day, "d")}</span>
          </button>
        );
      })}
    </div>
  );
}
