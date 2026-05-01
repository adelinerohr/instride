import { availabilityOptions, type Organization } from "@instride/api";
import { useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import * as React from "react";

import { riderCreateLessonFormOpts } from "@/features/lessons/lib/rider.form";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  FieldDescription,
  FieldError,
  FieldLegend,
  FieldSet,
} from "@/shared/components/ui/field";
import { withForm } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

export const BookingCalendar = withForm({
  ...riderCreateLessonFormOpts,
  props: {
    organization: {} as Organization,
  },
  render: ({ form, organization }) => {
    const boardId = useStore(form.store, (s) => s.values.boardId);
    const trainerId = useStore(form.store, (s) => s.values.trainerId);
    const serviceId = useStore(form.store, (s) => s.values.serviceId);
    const riderId = useStore(form.store, (s) => s.values.riderId);
    const startDate = useStore(form.store, (s) => s.values.start.date);
    const startTime = useStore(form.store, (s) => s.values.start.time);

    const enabled = !!(boardId && trainerId && serviceId && riderId);

    const [currentMonthStart, setCurrentMonthStart] = React.useState(() =>
      startOfMonth(new Date())
    );

    const visibleDate = React.useMemo(() => {
      if (startDate) return parseISO(startDate);
      return currentMonthStart;
    }, [startDate, currentMonthStart]);

    const monthEnd = endOfMonth(currentMonthStart);

    const { data: availableSlots } = useQuery({
      ...availabilityOptions.availableSlots({
        boardId,
        trainerId,
        serviceId,
        riderId,
        startDate: format(currentMonthStart, "yyyy-MM-dd"),
        endDate: format(monthEnd, "yyyy-MM-dd"),
      }),
      enabled,
    });

    const allSlots = availableSlots ?? [];

    // Slots for the visible day, filtered from the week response.
    const slotsForDay = React.useMemo(() => {
      const dayStr = format(visibleDate, "yyyy-MM-dd");
      return allSlots.filter(
        (slot) =>
          formatInTimeZone(slot.start, organization.timezone, "yyyy-MM-dd") ===
          dayStr
      );
    }, [allSlots, visibleDate, organization.timezone]);

    // Dates with at least one available slot — for the calendar dots.
    const { datesWithAvailability, firstDateWithAvailability } =
      React.useMemo(() => {
        const dates = new Set<string>();
        let min: string | undefined;

        for (const slot of allSlots) {
          const ymd = formatInTimeZone(
            slot.start,
            organization.timezone,
            "yyyy-MM-dd"
          );
          dates.add(ymd);
          if (min === undefined || ymd < min) min = ymd;
        }

        return { datesWithAvailability: dates, firstDateWithAvailability: min };
      }, [allSlots, organization.timezone]);

    const initialSelectedDate = startDate
      ? parseISO(startDate)
      : firstDateWithAvailability
        ? parseISO(firstDateWithAvailability)
        : currentMonthStart;

    const handleSlotClick = (slotStart: string) => {
      form.setFieldValue("start", {
        date: formatInTimeZone(slotStart, organization.timezone, "yyyy-MM-dd"),
        time: formatInTimeZone(slotStart, organization.timezone, "HH:mm"),
      });
    };

    const handleDateClick = (date: Date) => {
      // Move the visible day in the slot grid; clear the time since the
      // confirmed slot is no longer valid for the new day.
      form.setFieldValue("start.date", format(date, "yyyy-MM-dd"));
      form.setFieldValue("start.time", "");
    };

    return (
      <form.Field name="start">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <FieldSet>
              <FieldLegend>
                Date &amp; time <span className="text-destructive">*</span>
              </FieldLegend>

              {!enabled && (
                <FieldDescription>
                  Select a service to see available times.
                </FieldDescription>
              )}

              {enabled && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr]">
                  <Calendar
                    mode="single"
                    required
                    className="bg-white rounded-lg border"
                    defaultMonth={initialSelectedDate}
                    onMonthChange={setCurrentMonthStart}
                    selected={
                      firstDateWithAvailability
                        ? parseISO(firstDateWithAvailability)
                        : undefined
                    }
                    onSelect={handleDateClick}
                    disabled={(date) =>
                      !datesWithAvailability.has(format(date, "yyyy-MM-dd"))
                    }
                    modifiers={{
                      disabled: (date) =>
                        !datesWithAvailability.has(format(date, "yyyy-MM-dd")),
                    }}
                    modifiersClassNames={{
                      disabled: "opacity-100",
                    }}
                  />
                  <div>
                    <div className="mb-3 text-sm">
                      <span className="font-medium">
                        {format(visibleDate, "EEEE, MMMM d")}
                      </span>
                      <span className="ml-2 text-muted-foreground">
                        {slotsForDay.length}{" "}
                        {slotsForDay.length === 1 ? "slot" : "slots"} available
                      </span>
                    </div>

                    {slotsForDay.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No slots on this day.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {slotsForDay.map((slot) => {
                          const time = formatInTimeZone(
                            slot.start,
                            organization.timezone,
                            "HH:mm"
                          );
                          const displayTime = formatInTimeZone(
                            slot.start,
                            organization.timezone,
                            "h:mm a"
                          );
                          const isSelected =
                            startDate === format(visibleDate, "yyyy-MM-dd") &&
                            startTime === time;

                          return (
                            <button
                              key={slot.start}
                              type="button"
                              onClick={() => handleSlotClick(slot.start)}
                              className={cn(
                                "flex flex-col bg-white items-start rounded-md border px-3 py-2 text-left transition",
                                isSelected && "border-primary bg-primary/5",
                                !isSelected &&
                                  "border-border hover:border-muted-foreground/40"
                              )}
                            >
                              <span className="text-sm font-medium">
                                {displayTime}
                              </span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                                <span>{slot.service.name}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </FieldSet>
          );
        }}
      </form.Field>
    );
  },
});
