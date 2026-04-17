import { availability, availabilityOptions } from "@instride/api";
import { useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import {
  addDays,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  parseISO,
  startOfWeek,
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";

import { portalLessonFormOpts } from "@/features/lessons/lib/portal-lesson.form";
import { Button } from "@/shared/components/ui/button";
import { ButtonGroup } from "@/shared/components/ui/button-group";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { withForm } from "@/shared/hooks/use-form";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";

import { Route } from "./create";

export const BookingCalendar = withForm({
  ...portalLessonFormOpts,
  render: ({ form }) => {
    const { rider } = Route.useRouteContext();
    const isMobile = useIsMobile();

    const [currentWeekStart, setCurrentWeekStart] = React.useState(() =>
      startOfWeek(new Date(), { weekStartsOn: 1 })
    );
    const [currentMobileDay, setCurrentMobileDay] = React.useState(
      () => new Date()
    );

    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) =>
      addDays(currentWeekStart, i)
    );

    const days = isMobile ? [currentMobileDay] : weekDays;

    const handleNavigation = (direction: "previous" | "next") => {
      if (isMobile) {
        setCurrentWeekStart((prev) =>
          addDays(prev, direction === "previous" ? -7 : 7)
        );
      } else {
        setCurrentMobileDay((prev) =>
          addDays(prev, direction === "previous" ? -1 : 1)
        );
      }
    };

    const boardId = useStore(form.store, (s) => s.values.boardId);
    const trainerId = useStore(form.store, (s) => s.values.trainerId);
    const serviceId = useStore(form.store, (s) => s.values.serviceId);

    const enabled =
      boardId.length > 0 && trainerId.length > 0 && serviceId.length > 0;

    const { data: availableSlots } = useQuery({
      ...availabilityOptions.availableSlots({
        boardId,
        trainerId,
        serviceId,
        riderId: rider.id,
        startDate: format(currentWeekStart, "yyyy-MM-dd"),
        endDate: format(weekEnd, "yyyy-MM-dd"),
      }),
      enabled,
    });

    return (
      <form.Subscribe
        selector={(state) => [
          state.values.boardId,
          state.values.trainerId,
          state.values.serviceId,
        ]}
      >
        {([boardId, trainerId, serviceId]) => {
          if (
            boardId.length === 0 ||
            trainerId.length === 0 ||
            serviceId.length === 0
          ) {
            return null;
          }

          const slotsByDay = new Map<string, availability.AvailableSlot[]>();
          if (availableSlots) {
            availableSlots.forEach((slot) => {
              const slotDate = parseISO(slot.start);
              const dayKey = format(slotDate, "yyyy-MM-dd");
              if (!slotsByDay.has(dayKey)) {
                slotsByDay.set(dayKey, []);
              }
            });
          }

          return (
            <form.Field
              name="start"
              children={(field) => (
                <Card>
                  <CardHeader>
                    <CardTitle>Pick an Available Time</CardTitle>
                    <CardAction>
                      <ButtonGroup className={isMobile ? "w-full" : "flex"}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNavigation("previous")}
                        >
                          <ChevronLeftIcon className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled={!isMobile}
                          onClick={() =>
                            isMobile && setCurrentMobileDay(new Date())
                          }
                        >
                          {isMobile
                            ? "Today"
                            : `${format(currentWeekStart, "dd MMM")} - ${format(weekEnd, "dd MMM yyyy")}`}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNavigation("next")}
                        >
                          <ChevronRightIcon className="size-4" />
                        </Button>
                      </ButtonGroup>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      {/* Week Grid */}
                      <div
                        className={cn(
                          "border-b bg-muted/50",
                          !isMobile && "grid grid-cols-7",
                          isMobile && "p-4 text-center"
                        )}
                      >
                        {days.map((day) => (
                          <div
                            key={day.toISOString()}
                            className="p-3 text-center border-r last:border-r-0"
                          >
                            <div
                              className={cn(
                                "text-sm font-medium",
                                isSameDay(day, new Date()) && "text-primary",
                                isBefore(day, new Date()) &&
                                  "text-muted-foreground"
                              )}
                            >
                              {format(day, "EEEE")}
                            </div>
                            <div
                              className={cn(
                                "text-2xl font-semibold mt-1",
                                isSameDay(day, new Date()) && "text-primary",
                                isBefore(day, new Date()) &&
                                  "text-muted-foreground"
                              )}
                            >
                              {isMobile
                                ? format(day, "MMMM dd, yyyy")
                                : format(day, "dd")}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Time Slots Grid */}
                      <div
                        className={cn(
                          "min-h-[400px]",
                          !isMobile && "grid grid-cols-7",
                          isMobile && "p-4"
                        )}
                      >
                        {weekDays.map((day) => {
                          const dayKey = format(day, "yyyy-MM-dd");
                          const daySlots = slotsByDay.get(dayKey) || [];

                          if (isBefore(day, new Date())) {
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
                                daySlots.map((slot, index) => {
                                  const isSelected =
                                    slot.start === field.state.value;
                                  return (
                                    <Button
                                      key={`${slot.start}-${index}`}
                                      type="button"
                                      size="sm"
                                      className={cn(
                                        "w-full flex flex-col items-center py-3 h-auto",
                                        isSelected && "ring-2 ring-offset-2"
                                      )}
                                      variant={
                                        isSelected ? "default" : "outline"
                                      }
                                      onClick={() =>
                                        field.handleChange(slot.start)
                                      }
                                    >
                                      <span className="font-semibold">
                                        {format(parseISO(slot.start), "h:mm a")}
                                      </span>
                                    </Button>
                                  );
                                })
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            />
          );
        }}
      </form.Subscribe>
    );
  },
});
