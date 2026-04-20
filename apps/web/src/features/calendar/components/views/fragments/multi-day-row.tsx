import type { types } from "@instride/api";
import { cva } from "class-variance-authority";
import {
  parseISO,
  startOfWeek,
  endOfWeek,
  addDays,
  differenceInDays,
  isBefore,
  isAfter,
  format,
  startOfDay,
  endOfDay,
  isSameDay,
} from "date-fns";
import * as React from "react";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { CalendarView } from "@/features/calendar/lib/types";
import { cn } from "@/shared/lib/utils";

export function MultiDayRow() {
  const {
    selectedDate,
    organizationEvents,
    events,
    selectedView,
    selectedTrainerIds,
  } = useCalendar();

  const weekStart = startOfWeek(selectedDate);
  const weekEnd = endOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // In day view, only show organization events in the multi-day row
  // In week view, use the filtered events (which already includes organization events)
  const isDayView = selectedView === CalendarView.DAY;
  const eventsToProcess = isDayView ? organizationEvents : events;

  const multiDayEvents = React.useMemo(() => {
    return eventsToProcess
      .filter((orgEvent) => {
        // Only include events that span multiple days OR are all-day events
        const evt = orgEvent.event;

        // All-day events (no time specified)
        if (evt.startTime === null && evt.endTime === null) {
          return true;
        }

        // Multi-day events (different dates)
        const startDate = parseISO(evt.startDate);
        const endDate = parseISO(evt.endDate);

        return !isSameDay(startDate, endDate);
      })
      .map((orgEvent) => {
        const evt = orgEvent.event;
        const isAllDay = evt.startTime === null && evt.endTime === null;

        return {
          ...evt,
          isAllDay,
        };
      });
  }, [eventsToProcess]);

  const processedEvents = React.useMemo(() => {
    return (
      multiDayEvents
        .map((event) => {
          if (!event) return null;

          const start = parseISO(event.startDate);
          const end = parseISO(event.endDate);
          const adjustedStart = isBefore(start, weekStart) ? weekStart : start;
          const adjustedEnd = isAfter(end, weekEnd) ? weekEnd : end;
          const startIndex = differenceInDays(adjustedStart, weekStart);
          const endIndex = differenceInDays(adjustedEnd, weekStart);

          return {
            ...event,
            isAllDay: event.isAllDay,
            adjustedStart,
            adjustedEnd,
            startIndex,
            endIndex,
          };
        })
        .sort((a, b) => {
          if (!a || !b) return 0;

          const startDiff =
            a.adjustedStart.getTime() - b.adjustedStart.getTime();
          if (startDiff !== 0) return startDiff;
          return b.endIndex - b.startIndex - (a.endIndex - a.startIndex);
        }) ?? []
    );
  }, [multiDayEvents, weekStart, weekEnd]);

  const eventRows = React.useMemo(() => {
    const rows: (typeof processedEvents)[] = [];

    processedEvents.forEach((event) => {
      if (!event) return;

      let rowIndex = rows.findIndex((row) =>
        row.every(
          (e) =>
            e !== null &&
            (e.endIndex < event.startIndex || e.startIndex > event.endIndex)
        )
      );

      if (rowIndex === -1) {
        rowIndex = rows.length;
        rows.push([]);
      }

      rows[rowIndex].push(event);
    });

    return rows;
  }, [processedEvents]);

  const hasEventsInWeek = React.useMemo(() => {
    return multiDayEvents.some((event) => {
      const start = parseISO(event.startDate);
      const end = parseISO(event.endDate);

      return (
        // Event starts within the week
        (start >= weekStart && start <= weekEnd) ||
        // Event ends within the week
        (end >= weekStart && end <= weekEnd) ||
        // Event spans the entire week
        (start <= weekStart && end >= weekEnd)
      );
    });
  }, [multiDayEvents, weekStart, weekEnd]);

  if (!hasEventsInWeek) {
    return null;
  }

  // In day view with trainers, show one column per trainer
  // In week view, show one column per day
  const isDayViewWithTrainers =
    selectedView === CalendarView.DAY && selectedTrainerIds.length > 0;
  const columns = isDayViewWithTrainers
    ? selectedTrainerIds.length
    : weekDays.length;

  return (
    <div className="hidden overflow-hidden sm:flex">
      <div className="w-18 border-b"></div>
      <div
        className={cn("grid flex-1 border-b border-l py-1")}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${eventRows.length}, 26px)`,
          gap: "4px 0",
        }}
      >
        {eventRows.map((row, rowIndex) => {
          return Array.from({ length: columns }).map((_, columnIndex) => {
            // In day view, all columns show the same day (selectedDate)
            // In week view, each column shows a different day
            const day = isDayViewWithTrainers
              ? selectedDate
              : weekDays[columnIndex];
            const dayIndex = isDayViewWithTrainers
              ? differenceInDays(selectedDate, weekStart)
              : columnIndex;

            const event = row.find(
              (e) =>
                e !== null && e.startIndex <= dayIndex && e.endIndex >= dayIndex
            );

            if (!event) {
              return (
                <div
                  key={`${rowIndex}-${columnIndex}`}
                  className="h-6.5"
                  style={{
                    gridRow: rowIndex + 1,
                    gridColumn: columnIndex + 1,
                    borderRight:
                      columnIndex < columns - 1
                        ? "1px solid hsl(var(--border))"
                        : "none",
                  }}
                />
              );
            }

            // In day view, only render organization events in the first column (they span all)
            // In week view, render normally
            if (isDayViewWithTrainers && columnIndex > 0) {
              return (
                <div
                  key={`${rowIndex}-${columnIndex}`}
                  className="h-6.5"
                  style={{
                    gridRow: rowIndex + 1,
                    gridColumn: columnIndex + 1,
                    borderRight:
                      columnIndex < columns - 1
                        ? "1px solid hsl(var(--border))"
                        : "none",
                  }}
                />
              );
            }

            let position: "first" | "middle" | "last" | "none" = "none";

            if (dayIndex === event.startIndex && dayIndex === event.endIndex) {
              position = "none";
            } else if (dayIndex === event.startIndex) {
              position = "first";
            } else if (dayIndex === event.endIndex) {
              position = "last";
            } else {
              position = "middle";
            }

            return (
              <MultiDayRowItem
                key={`${rowIndex}-${columnIndex}`}
                event={event}
                isAllDay={event.isAllDay}
                cellDate={day}
                eventCurrentDay={
                  isDayViewWithTrainers ? rowIndex + 1 : undefined
                }
                eventTotalDays={
                  isDayViewWithTrainers ? eventRows.length : undefined
                }
                position={position}
                spanAllColumns={isDayViewWithTrainers}
                totalColumns={columns}
                rowIndex={rowIndex}
                columnIndex={columnIndex}
              />
            );
          });
        })}
      </div>
    </div>
  );
}

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
    defaultVariants: {
      color: "amber",
    },
  }
);

function MultiDayRowItem({
  event,
  cellDate,
  eventCurrentDay,
  eventTotalDays,
  position: propPosition,
  isAllDay = true,
  spanAllColumns = false,
  totalColumns = 1,
  rowIndex,
  columnIndex,
  className,
}: {
  event: types.GetEventResponse["event"];
  cellDate: Date;
  eventCurrentDay?: number;
  eventTotalDays?: number;
  position?: "first" | "middle" | "last" | "none";
  isAllDay: boolean;
  spanAllColumns?: boolean;
  totalColumns?: number;
  rowIndex: number;
  columnIndex: number;
  className?: string;
}) {
  const itemStart = startOfDay(parseISO(event.startDate));
  const itemEnd = endOfDay(parseISO(event.endDate));

  if (cellDate < itemStart || cellDate > itemEnd) return null;

  let position: "first" | "middle" | "last" | "none" | undefined;

  if (propPosition) {
    position = propPosition;
  } else if (eventCurrentDay && eventTotalDays) {
    position = "none";
  } else if (isSameDay(itemStart, itemEnd)) {
    position = "none";
  } else if (isSameDay(cellDate, itemStart)) {
    position = "first";
  } else if (isSameDay(cellDate, itemEnd)) {
    position = "last";
  } else {
    position = "middle";
  }

  const eventBadgeClasses = cn(
    eventBadgeVariants({
      color: "amber",
      multiDayPosition: position,
      className,
    })
  );

  const renderBadgeText = ["first", "none"].includes(position);

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
      className={eventBadgeClasses}
      style={{
        gridRow: rowIndex + 1,
        gridColumn: spanAllColumns
          ? `1 / span ${totalColumns}`
          : columnIndex + 1,
      }}
    >
      <div className="flex items-center gap-1.5 truncate">
        {renderBadgeText && (
          <p className="flex-1 truncate font-semibold">
            {eventCurrentDay && (
              <span className="text-xs">
                Day {eventCurrentDay} of {eventTotalDays} •{" "}
              </span>
            )}
            {event.title}
          </p>
        )}
      </div>

      {renderBadgeText && !isAllDay && (
        <span>{format(new Date(event.startDate), "h:mm a")}</span>
      )}
    </div>
  );
}
