import type { types } from "@instride/api";
import { cva } from "class-variance-authority";
import { format, parseISO, startOfDay } from "date-fns";

import { cn } from "@/shared/lib/utils";

const eventBadgeVariants = cva(
  "mx-1 flex size-auto h-6.5 select-none items-center justify-between gap-1.5 truncate whitespace-nowrap rounded-md border px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  {
    variants: {
      color: {
        amber:
          "border-category-amber-border bg-category-amber-bg text-category-amber-fg [&_.event-dot]:fill-category-amber-dot",
        sage: "border-category-sage-border bg-category-sage-bg text-category-sage-fg [&_.event-dot]:fill-category-sage-dot",
        terracotta:
          "border-category-terracotta-border bg-category-terracotta-bg text-category-terracotta-fg [&_.event-dot]:fill-category-terracotta-dot",
        plum: "border-category-plum-border bg-category-plum-bg text-category-plum-fg [&_.event-dot]:fill-category-plum-dot",
        clay: "border-category-clay-border bg-category-clay-bg text-category-clay-fg [&_.event-dot]:fill-category-clay-dot",
      },
      multiDayPosition: {
        first:
          "relative z-10 mr-0 w-[calc(100%_-_3px)] rounded-r-none border-r-0 [&>span]:mr-2.5",
        middle:
          "relative z-10 mx-0 w-[calc(100%_+_1px)] rounded-none border-x-0",
        last: "ml-0 rounded-l-none border-l-0",
        none: "",
      },
    },
    defaultVariants: { color: "amber" },
  }
);

interface MultiDayRowItemProps {
  event: types.Event;
  cellDate: Date;
  eventCurrentDay?: number;
  eventTotalDays?: number;
  position: "first" | "middle" | "last" | "none";
  isAllDay: boolean;
  rowIndex: number;
  colStart: number;
  colSpan: number;
  className?: string;
  onEventClick: (event: types.Event) => void;
}

export function MultiDayRowItem({
  event,
  className,
  ...props
}: MultiDayRowItemProps) {
  const itemStart = startOfDay(parseISO(event.startDate));
  const itemEnd = startOfDay(parseISO(event.endDate));

  if (props.cellDate < itemStart || props.cellDate > itemEnd) return null;

  const renderBadgeText =
    props.position === "first" || props.position === "none";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (e.currentTarget instanceof HTMLElement) e.currentTarget.click();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => props.onEventClick(event)}
      className={cn(
        eventBadgeVariants({
          color: "amber",
          multiDayPosition: props.position,
          className,
        })
      )}
      style={{
        gridRow: props.rowIndex + 1,
        gridColumn: `${props.colStart} / span ${props.colSpan}`,
      }}
    >
      <div className="flex items-center gap-1.5 truncate">
        {renderBadgeText && (
          <p className="flex-1 truncate font-semibold">
            {props.eventCurrentDay && (
              <span className="text-xs">
                Day {props.eventCurrentDay} of {props.eventTotalDays} •{" "}
              </span>
            )}
            {event.title}
          </p>
        )}
      </div>

      {renderBadgeText && !props.isAllDay && (
        <span>{format(new Date(event.startDate), "h:mm a")}</span>
      )}
    </div>
  );
}
