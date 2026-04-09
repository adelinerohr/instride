import * as React from "react";

import { SLOT_HEIGHT, START_HOUR } from "../../lib/constants";

/** A red line showing the current time, updating every minute. */
export function TimeIndicator() {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const top =
    (now.getHours() - START_HOUR + now.getMinutes() / 60) * SLOT_HEIGHT;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
      style={{ top }}
    >
      <div className="h-2 w-2 flex-none rounded-full bg-destructive" />
      <div className="h-px flex-1 bg-destructive" />
    </div>
  );
}
