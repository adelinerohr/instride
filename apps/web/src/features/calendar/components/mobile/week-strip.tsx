import { addDays, format, isSameDay, startOfWeek } from "date-fns";

import { cn } from "@/shared/lib/utils";

import { useCalendar } from "../../hooks/use-calendar";

export function MobileWeekStrip() {
  const { selectedDate, setSelectedDate } = useCalendar();

  const today = new Date();
  const weekStart = startOfWeek(selectedDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex items-center justify-between gap-1 px-2 pb-3 text-primary-foreground">
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
