import * as React from "react";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { CalendarView } from "@/features/calendar/lib/types";

import { MobileDayView } from "./day";
import { MobileHeader } from "./header";
import { MobileWeekStrip } from "./week-strip";

export function MobileCalendar() {
  const { selectedView, setSelectedView } = useCalendar();

  React.useEffect(() => {
    if (selectedView !== CalendarView.DAY) {
      setSelectedView(CalendarView.DAY);
    }
  }, [selectedView, setSelectedView]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 bg-primary">
        <MobileHeader />
        <MobileWeekStrip />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <MobileDayView />
      </div>
    </div>
  );
}
