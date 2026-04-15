import { format, parseISO } from "date-fns";
import { CalendarIcon, ClockIcon, UserIcon } from "lucide-react";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { HOURS, SLOT_HEIGHT } from "@/features/calendar/lib/constants";
import { getCurrentLessons } from "@/features/calendar/utils/lesson";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

import { MultiDayRow } from "../fragments/multi-day-row";
import { SingleCalendar } from "../fragments/single-calendar";
import { CalendarTimeline } from "../fragments/timeline";
import { DayColumn } from "./column";

export function DayView() {
  const { selectedTrainerIds, trainers, lessons } = useCalendar();

  const selectedTrainers = trainers.filter((trainer) =>
    selectedTrainerIds.includes(trainer.id)
  );

  const currentLessons = getCurrentLessons(
    lessons.filter((lesson) =>
      selectedTrainers.some((trainer) => trainer.id === lesson.trainer?.id)
    )
  );

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col">
        {/* Day header */}
        <div>
          <MultiDayRow />
          <div className="relative z-20 flex border-b">
            <div className="w-18"></div>
            {selectedTrainers.map((trainer) => (
              <span
                key={trainer.id}
                className="flex-1 border-l py-2 text-center text-xs font-medium text-muted-foreground"
              >
                {trainer.member?.authUser?.name}
              </span>
            ))}
          </div>
        </div>

        <ScrollArea className="h-full">
          <div className="flex">
            {/* Hours column */}
            <div className="relative w-18">
              {HOURS.map((hour, index) => (
                <div
                  key={hour}
                  className="relative"
                  style={{ height: `${SLOT_HEIGHT}px` }}
                >
                  <div className="absolute -top-3 right-2 flex h-6 items-center">
                    {index !== 0 && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date().setHours(hour, 0, 0, 0), "hh a")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Day grid */}
            {selectedTrainers.map((trainer) => (
              <div className="relative flex-1 border-l">
                <DayColumn key={trainer.id} trainer={trainer} />
              </div>
            ))}

            <CalendarTimeline />
          </div>
        </ScrollArea>
      </div>

      <div className="hidden w-64 divide-y border-l md:block">
        <SingleCalendar />

        <div className="flex-1 space-y-3">
          {currentLessons.length > 0 ? (
            <div className="flex items-start gap-2 px-4 pt-4">
              <span className="relative mt-[5px] flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex size-2.5 rounded-full bg-green-600"></span>
              </span>

              <p className="text-sm font-semibold text-foreground">
                Happening now
              </p>
            </div>
          ) : (
            <p className="p-4 text-center text-sm italic text-muted-foreground">
              No lessons scheduled at the moment.
            </p>
          )}

          {currentLessons.length > 0 && (
            <ScrollArea className="h-[422px] px-4">
              <div className="space-y-6 pb-4">
                {currentLessons.map((lesson) => {
                  const trainer = trainers.find(
                    (trainer) => trainer.id === lesson.trainer?.id
                  );

                  return (
                    <div key={lesson.id} className="space-y-1.5">
                      <p className="line-clamp-2 text-sm font-semibold">
                        {lesson.service?.name}
                      </p>

                      {trainer && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <UserIcon className="size-3.5" />
                          <span className="text-sm">
                            {trainer.member?.authUser?.name}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <CalendarIcon className="size-3.5" />
                        <span className="text-sm">
                          {format(new Date(), "MMM d, yyyy")}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <ClockIcon className="size-3.5" />
                        <span className="text-sm">
                          {format(parseISO(lesson.start), "h:mm a")} -{" "}
                          {format(parseISO(lesson.end), "h:mm a")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
