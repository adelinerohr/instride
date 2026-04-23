import { CalendarView } from "@/features/calendar/lib/types";
import { useIsMobile } from "@/shared/hooks/use-mobile";

import { useCalendar } from "../hooks/use-calendar";
import { CalendarHeader } from "./header";
import { MobileCalendar } from "./mobile/calendar";
import { AgendaView } from "./views/agenda";
import { DayView } from "./views/day";
import { MultiDayView } from "./views/multi-day";
import { WeekView } from "./views/week";

export function Calendar() {
  const isMobile = useIsMobile();
  const { selectedView } = useCalendar();

  if (isMobile) {
    return <MobileCalendar />;
  }

  return (
    <div className="flex min-h-0 h-full flex-col overflow-hidden">
      <CalendarHeader />
      <div className="flex-1 min-h-0">
        {selectedView === CalendarView.WEEK && <WeekView />}
        {selectedView === CalendarView.MULTI_DAY && <MultiDayView />}
        {selectedView === CalendarView.DAY && <DayView />}
        {selectedView === CalendarView.AGENDA && <AgendaView />}
      </div>
    </div>
  );
}
