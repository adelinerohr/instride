import { HOURS, SLOT_HEIGHT } from "../../lib/constants";

/** Renders horizontal hour/half-hour divider lines that fill a day column. */
export function CalendarGrid() {
  return (
    <>
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="relative border-b border-border/40"
          style={{ height: SLOT_HEIGHT }}
        >
          {/* Half-hour dashed line */}
          <div
            className="absolute inset-x-0 border-b border-dashed border-border/20"
            style={{ top: SLOT_HEIGHT / 2 }}
          />
        </div>
      ))}
    </>
  );
}
