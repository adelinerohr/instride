import type { Event } from "@instride/api";
import { isTrainerWorkingOnDay } from "@instride/shared";
import {
  parseISO,
  isSameDay,
  max as dateMax,
  min as dateMin,
  differenceInDays,
  startOfDay,
} from "date-fns";
import * as React from "react";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { CalendarView } from "@/features/calendar/lib/types";
import {
  dayColumnRange,
  getMultiDayLayout,
  layoutDays,
  layoutTotalColumns,
} from "@/features/calendar/utils/multi-day";

import { eventModalHandler } from "../../../modals/event-modal";
import { MultiDayRowItem } from "./item";

export function MultiDayRow() {
  const {
    visibleDays,
    organizationEvents,
    events,
    selectedView,
    selectedTrainerIds,
    trainers,
    trainerBusinessHours,
  } = useCalendar();

  const selectedTrainers = trainers.filter((t) =>
    selectedTrainerIds.includes(t.id)
  );

  const trainersPerDay = visibleDays.map(
    (day) =>
      selectedTrainers.filter((trainer) => {
        const hours = trainerBusinessHours[trainer.id];
        if (!hours) return true;
        return isTrainerWorkingOnDay({ day, businessHours: hours });
      }).length
  );

  const layout = React.useMemo(
    () =>
      getMultiDayLayout({
        selectedView,
        visibleDays,
        trainersPerDay:
          selectedView === CalendarView.MULTI_DAY
            ? trainersPerDay
            : (trainersPerDay[0] ?? 0),
      }),
    [selectedView, visibleDays, selectedTrainerIds]
  );

  const days = layoutDays(layout);
  const rangeStart = days[0];
  const rangeEnd = days[days.length - 1];
  const totalColumns = layoutTotalColumns(layout);

  // In non-week views with trainers, multi-day row shows only org-scoped events.
  // In week view, use the filtered events (which already includes org events).
  const showOnlyOrgEvents =
    layout.kind === "day" || layout.kind === "multi-day";
  const eventsToProcess = showOnlyOrgEvents ? organizationEvents : events;

  const multiDayEvents = React.useMemo(() => {
    return eventsToProcess
      .filter((event) => {
        // All-day events (no time specified)
        if (event.startTime === null && event.endTime === null) return true;
        // Multi-day events (different dates)
        const startDate = parseISO(event.startDate);
        const endDate = parseISO(event.endDate);
        return !isSameDay(startDate, endDate);
      })
      .map((event) => {
        const isAllDay = event.startTime === null && event.endTime === null;
        return {
          ...event,
          isAllDay,
        };
      });
  }, [eventsToProcess]);

  const processedEvents = React.useMemo(() => {
    return multiDayEvents
      .map((event) => {
        const start = parseISO(event.startDate);
        const end = parseISO(event.endDate);
        const adjustedStart = dateMax([rangeStart, start]);
        const adjustedEnd = dateMin([rangeEnd, end]);
        const startIndex = differenceInDays(
          startOfDay(adjustedStart),
          startOfDay(rangeStart)
        );
        const endIndex = differenceInDays(
          startOfDay(adjustedEnd),
          startOfDay(rangeStart)
        );

        return {
          ...event,
          adjustedStart,
          adjustedEnd,
          startIndex,
          endIndex,
        };
      })
      .sort((a, b) => {
        const startDiff = a.adjustedStart.getTime() - b.adjustedStart.getTime();
        if (startDiff !== 0) return startDiff;
        return b.endIndex - b.startIndex - (a.endIndex - a.startIndex);
      });
  }, [multiDayEvents, rangeStart, rangeEnd]);

  const eventRows = React.useMemo(() => {
    const rows: (typeof processedEvents)[] = [];
    processedEvents.forEach((event) => {
      let rowIndex = rows.findIndex((row) =>
        row.every(
          (e) => e.endIndex < event.startIndex || e.startIndex > event.endIndex
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

  const hasEventsInRange = React.useMemo(() => {
    const rangeStartDay = startOfDay(rangeStart);
    const rangeEndDay = startOfDay(rangeEnd);
    return multiDayEvents.some((event) => {
      const start = parseISO(event.startDate);
      const end = parseISO(event.endDate);
      return (
        (start >= rangeStartDay && start <= rangeEndDay) ||
        (end >= rangeStartDay && end <= rangeEndDay) ||
        (start <= rangeStartDay && end >= rangeEndDay)
      );
    });
  }, [multiDayEvents, rangeStart, rangeEnd]);

  if (!hasEventsInRange) return null;

  const onEventClick = (event: Event) => {
    const fullEvent = events.find((e) => e.id === event.id);
    if (fullEvent) {
      eventModalHandler.openWithPayload(fullEvent);
    }
  };

  return (
    <div className="hidden overflow-hidden sm:flex">
      <div className="w-18 border-b" />
      <div
        className="grid flex-1 border-b border-l py-1"
        style={{
          gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${eventRows.length}, 26px)`,
          gap: "4px 0",
        }}
      >
        {eventRows.map((row, rowIndex) =>
          days.map((day, dayIndex) => {
            const event = row.find(
              (e) => e.startIndex <= dayIndex && e.endIndex >= dayIndex
            );

            const { start: colStart, span: colSpan } = dayColumnRange(
              layout,
              dayIndex
            );

            if (!event) {
              return (
                <div
                  key={`empty-${rowIndex}-${dayIndex}`}
                  className="h-6.5"
                  style={{
                    gridRow: rowIndex + 1,
                    gridColumn: `${colStart} / span ${colSpan}`,
                  }}
                />
              );
            }

            let position: "first" | "middle" | "last" | "none";
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
                key={`event-${event.id}-${rowIndex}-${dayIndex}`}
                event={event}
                isAllDay={event.isAllDay}
                cellDate={day}
                eventCurrentDay={
                  layout.kind === "day" ? rowIndex + 1 : undefined
                }
                eventTotalDays={
                  layout.kind === "day" ? eventRows.length : undefined
                }
                onEventClick={onEventClick}
                position={position}
                rowIndex={rowIndex}
                colStart={colStart}
                colSpan={colSpan}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
