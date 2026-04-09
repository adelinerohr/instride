import {
  addDays,
  addMonths,
  addWeeks,
  formatDate,
  subMonths,
  subDays,
  subWeeks,
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

import { useCalendarSearch } from "../../hooks/use-calendar-search";
import { CalendarView } from "../../lib/types";
import { rangeText } from "../../utils/date";

export interface DateNavigatorProps {
  date: Date;
  view: CalendarView;
}

export function DateNavigator({ date, view }: DateNavigatorProps) {
  const { setDate } = useCalendarSearch(false);

  const today = new Date();

  const handleToday = () => setDate(new Date().toISOString());

  const handlePrevious = () => {
    const nextDate =
      view === CalendarView.DAY
        ? subDays(date, 1)
        : view === CalendarView.WEEK
          ? subWeeks(date, 1)
          : subMonths(date, 1);

    setDate(nextDate.toISOString());
  };

  const handleNext = () => {
    const nextDate =
      view === CalendarView.DAY
        ? addDays(date, 1)
        : view === CalendarView.WEEK
          ? addWeeks(date, 1)
          : addMonths(date, 1);

    setDate(nextDate.toISOString());
  };

  const month = formatDate(date, "MMMM");
  const year = date.getFullYear();

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        className="flex size-14 flex-col items-center justify-between p-0 text-center overflow-hidden"
        onClick={handleToday}
      >
        <span className="w-full bg-primary py-1 leading-none text-xs font-semibold text-primary-foreground">
          {formatDate(today, "MMM").toUpperCase()}
        </span>
        <span className="text-lg font-bold leading-none flex-1">
          {today.getDate()}
        </span>
      </Button>
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">
            {month} {year}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-6"
            onClick={handlePrevious}
          >
            <ChevronLeftIcon />
          </Button>
          <span className="text-sm text-muted-foreground">
            {rangeText(view, date)}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-6"
            onClick={handleNext}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
