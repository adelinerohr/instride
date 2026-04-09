import { format } from "date-fns";

import { HOURS, SLOT_HEIGHT } from "../../lib/constants";

/** Left-side column showing hour labels aligned to grid rows. */
export function CalendarHours() {
  return (
    <div className="w-14 flex-none border-r select-none">
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="relative flex items-start justify-end pr-2"
          style={{ height: SLOT_HEIGHT }}
        >
          <span className="-translate-y-2.5 text-xs text-muted-foreground">
            {format(new Date(0, 0, 0, hour), "h a")}
          </span>
        </div>
      ))}
    </div>
  );
}
