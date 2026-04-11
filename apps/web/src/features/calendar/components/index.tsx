import { CalendarView } from "@/features/calendar/lib/types";

import { useCalendar } from "../hooks/use-calendar";
import { CalendarHeader } from "./header";
import { AgendaView } from "./views/agenda";
import { DayView } from "./views/day";
import { WeekView } from "./views/week";

export function Calendar() {
  const { selectedView } = useCalendar();

  return (
    <div className="flex min-h-0 h-full flex-col overflow-hidden">
      <CalendarHeader />
      <div className="flex-1 min-h-0">
        {selectedView === CalendarView.WEEK && <WeekView />}
        {selectedView === CalendarView.DAY && <DayView />}
        {selectedView === CalendarView.AGENDA && <AgendaView />}
      </div>
    </div>
  );
}
