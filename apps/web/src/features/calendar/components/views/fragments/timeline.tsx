import { format } from "date-fns";
import * as React from "react";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { END_HOUR, START_HOUR } from "@/features/calendar/lib/constants";

export function CalendarTimeline() {
  const { slotHeight } = useCalendar();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  if (currentHour < START_HOUR || currentHour >= END_HOUR + 1) return null;

  const minutes = currentHour * 60 + currentTime.getMinutes();
  const top = ((minutes - START_HOUR * 60) / 60) * slotHeight;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-50 border-t border-accent"
      style={{ top: `${top}px` }}
    >
      <div className="absolute left-0 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
      <div className="absolute -left-18 flex w-16 -translate-y-1/2 justify-end bg-background pr-1 text-[9px] sm:text-xs font-medium text-accent">
        {format(currentTime, "h:mm a")}
      </div>
    </div>
  );
}
