import { format } from "date-fns";
import * as React from "react";

import {
  END_HOUR,
  SLOT_HEIGHT,
  START_HOUR,
} from "@/features/calendar/lib/constants";

export function CalendarTimeline() {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  if (currentHour < START_HOUR || currentHour >= END_HOUR) return null;

  const minutes = currentHour * 60 + currentTime.getMinutes();
  const top = ((minutes - START_HOUR * 60) / 60) * SLOT_HEIGHT;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-50 border-t border-primary"
      style={{ top: `${top}px` }}
    >
      <div className="absolute left-0 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
      <div className="absolute -left-18 flex w-16 -translate-y-1/2 justify-end bg-background pr-1 text-xs font-medium text-primary">
        {format(currentTime, "h:mm a")}
      </div>
    </div>
  );
}
