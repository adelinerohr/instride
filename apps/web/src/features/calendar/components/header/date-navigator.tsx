import { formatDate } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

import { useCalendar } from "../../hooks/use-calendar";
import { navigateDate, rangeText } from "../../utils/date";

export function DateNavigator() {
  const { selectedDate, setSelectedDate, lessons } = useCalendar();

  const month = formatDate(selectedDate, "MMMM");
  const year = selectedDate.getFullYear();

  const lessonCount = React.useMemo(() => lessons.length, [lessons]);

  const handlePrevious = React.useCallback(
    () => setSelectedDate(navigateDate("previous")),
    [setSelectedDate]
  );

  const handleNext = React.useCallback(
    () => setSelectedDate(navigateDate("next")),
    [setSelectedDate]
  );

  return (
    <div className="flex items-center gap-3">
      <button
        className="flex size-14 flex-col items-start overflow-hidden rounded-lg border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        onClick={() => setSelectedDate(new Date())}
      >
        <p className="flex h-6 w-full items-center justify-center bg-primary text-center text-xs font-semibold text-primary-foreground">
          {formatDate(new Date(), "MMM").toUpperCase()}
        </p>
        <p className="flex w-full items-center justify-center text-lg font-bold">
          {new Date().getDate()}
        </p>
      </button>
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">
            {month} {year}
          </span>
          <Badge variant="outline" className="px-1.5">
            {lessonCount} lessons
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-6.5 px-0 [&_svg]:size-4.5"
            onClick={handlePrevious}
          >
            <ChevronLeftIcon />
          </Button>
          <span className="text-sm text-muted-foreground">{rangeText()}</span>
          <Button
            variant="outline"
            size="icon"
            className="size-6.5 px-0 [&_svg]:size-4.5"
            onClick={handleNext}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
