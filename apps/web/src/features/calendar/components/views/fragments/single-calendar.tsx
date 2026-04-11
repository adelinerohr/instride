import * as React from "react";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { Calendar } from "@/shared/components/ui/calendar";

export function SingleCalendar() {
  const { selectedDate, setSelectedDate } = useCalendar();
  const [currentMonth, setCurrentMonth] = React.useState(selectedDate);

  return (
    <Calendar
      className="p-3 mx-auto w-fit"
      mode="single"
      selected={selectedDate}
      onSelect={setSelectedDate}
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      autoFocus
    />
  );
}
