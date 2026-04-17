import { type availability, useAvailableSlots } from "@instride/api";
import {
  addDays,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/shared/components/ui/button";
import { ButtonGroup } from "@/shared/components/ui/button-group";
import { CardContent, CardHeader } from "@/shared/components/ui/card";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

import { TimeSlotButton } from "./time-slot";

interface BookingCalendarProps {
  boardId: string;
  trainerId: string;
  serviceId: string;
  riderId: string;
  /** Slot `start` from the API (ISO string) */
  onSlotSelect: (slotStartIso: string) => void;
  selectedSlotStart?: string;
}

export function BookingCalendar({
  boardId,
  trainerId,
  serviceId,
  riderId,
  onSlotSelect,
  selectedSlotStart,
}: BookingCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = React.useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [currentMobileDay, setCurrentMobileDay] = React.useState(
    () => new Date()
  );

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });

  // Fetch available slots for the current week
  const { data: availableSlots } = useAvailableSlots({
    boardId,
    trainerId,
    serviceId,
    riderId,
    startDate: format(currentWeekStart, "yyyy-MM-dd"),
    endDate: format(weekEnd, "yyyy-MM-dd"),
  });

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  const handlePreviousDay = () => {
    setCurrentMobileDay((prev) => addDays(prev, -1));
  };

  const handleNextDay = () => {
    setCurrentMobileDay((prev) => addDays(prev, 1));
  };

  // Group slots by day
  const slotsByDay = new Map<string, availability.AvailableSlot[]>();
  if (availableSlots) {
    availableSlots.forEach((slot) => {
      const slotDate = parseISO(slot.start);
      const dayKey = format(slotDate, "yyyy-MM-dd");
      if (!slotsByDay.has(dayKey)) {
        slotsByDay.set(dayKey, []);
      }
      slotsByDay.get(dayKey)!.push(slot);
    });
  }

  // Generate array of days for the week
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

  if (availableSlots === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  // Mobile day view
  const mobileDayKey = format(currentMobileDay, "yyyy-MM-dd");
  const mobileDaySlots = slotsByDay.get(mobileDayKey) || [];

  const isDateBeforeToday = (dateToCheck: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(dateToCheck);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h3 className="text-lg font-semibold">Pick an Available Time</h3>
          <ButtonGroup className="hidden md:flex">
            <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              {format(currentWeekStart, "dd MMM")} -{" "}
              {format(weekEnd, "dd MMM yyyy")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              <ChevronRightIcon className="size-4" />
            </Button>
          </ButtonGroup>
          <ButtonGroup className="md:hidden w-full">
            <Button variant="outline" size="sm" onClick={handlePreviousDay}>
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setCurrentMobileDay(new Date())}
            >
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextDay}>
              <ChevronRightIcon className="size-4" />
            </Button>
          </ButtonGroup>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Week View */}
        <div className="hidden md:block border rounded-lg overflow-hidden">
          {/* Week Grid */}
          <div className="grid grid-cols-7 border-b bg-muted/50">
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className="p-3 text-center border-r last:border-r-0"
              >
                <div
                  className={cn(
                    "text-sm font-medium",
                    isSameDay(day, new Date()) && "text-primary",
                    isDateBeforeToday(day) && "text-muted-foreground"
                  )}
                >
                  {format(day, "EEEE")}
                </div>
                <div
                  className={cn(
                    "text-2xl font-semibold mt-1",
                    isSameDay(day, new Date()) && "text-primary",
                    isDateBeforeToday(day) && "text-muted-foreground"
                  )}
                >
                  {format(day, "dd")}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots Grid */}
          <div className="grid grid-cols-7 min-h-[400px]">
            {weekDays.map((day) => {
              const dayKey = format(day, "yyyy-MM-dd");
              const daySlots = slotsByDay.get(dayKey) || [];

              if (isDateBeforeToday(day)) {
                return (
                  <div
                    key={day.toISOString()}
                    className="bg-muted/50 border-r last:border-r-0"
                  />
                );
              }

              return (
                <div
                  key={day.toISOString()}
                  className="border-r last:border-r-0 p-3 space-y-2"
                >
                  {daySlots.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No available times
                    </div>
                  ) : (
                    daySlots.map((slot, index) => (
                      <TimeSlotButton
                        key={`${slot.start}-${index}`}
                        slot={slot}
                        isSelected={slot.start === selectedSlotStart}
                        onClick={() => onSlotSelect(slot.start)}
                      />
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Day View */}
        <div className="md:hidden border rounded-lg overflow-hidden">
          {/* Day Header */}
          <div className="border-b bg-muted/50 p-4 text-center">
            <div
              className={cn(
                "text-sm font-medium",
                isSameDay(currentMobileDay, new Date()) && "text-primary",
                isDateBeforeToday(currentMobileDay) && "text-muted-foreground"
              )}
            >
              {format(currentMobileDay, "EEEE")}
            </div>
            <div
              className={cn(
                "text-2xl font-semibold mt-1",
                isSameDay(currentMobileDay, new Date()) && "text-primary",
                isDateBeforeToday(currentMobileDay) && "text-muted-foreground"
              )}
            >
              {format(currentMobileDay, "MMMM dd, yyyy")}
            </div>
          </div>

          {/* Time Slots */}
          <div
            className={cn(
              "p-4 min-h-[400px]",
              isDateBeforeToday(currentMobileDay) && "bg-muted/50"
            )}
          >
            {isDateBeforeToday(currentMobileDay) ? (
              <div />
            ) : mobileDaySlots.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                No available times
              </div>
            ) : (
              <div className="space-y-2">
                {mobileDaySlots.map((slot, index) => (
                  <TimeSlotButton
                    key={`${slot.start}-${index}`}
                    slot={slot}
                    isSelected={slot.start === selectedSlotStart}
                    onClick={() => onSlotSelect(slot.start)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
