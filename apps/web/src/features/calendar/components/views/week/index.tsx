import { isWorkingHour } from "@instride/shared";
import {
  addDays,
  areIntervalsOverlapping,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
} from "date-fns";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { HOURS, SLOT_HEIGHT } from "@/features/calendar/lib/constants";
import {
  getLessonBlockStyle,
  groupLessons,
} from "@/features/calendar/utils/lesson";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { cn } from "@/shared/lib/utils";

import { HourCell } from "../fragments/hour-cell";
import { LessonBlock } from "../fragments/lesson-block";
import { MultiDayRow } from "../fragments/multi-day-row";
import { CalendarTimeline } from "../fragments/timeline";

export function WeekView() {
  const { selectedDate, organizationBusinessHours, lessons } = useCalendar();

  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex flex-col h-full">
      <div>
        <MultiDayRow />
        <div className="relative z-20 flex border-b">
          <div className="w-18" />
          <div className="grid flex-1 grid-cols-7 divide-x border-l">
            {weekDays.map((day, index) => (
              <span
                key={index}
                className={cn(
                  "py-2 text-center text-xs font-medium text-muted-foreground",
                  isSameDay(day, new Date()) && "text-accent"
                )}
              >
                {format(day, "EE")}
                <span
                  className={cn(
                    "ml-1 font-semibold text-foreground",
                    isSameDay(day, new Date()) && "text-accent"
                  )}
                >
                  {format(day, "d")}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <ScrollArea className="h-full">
        <div className="flex overflow-hidden">
          {/* Hours column */}
          <div className="relative w-18 shrink-0">
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

          {/* Week grid */}
          <div className="relative flex-1 border-l">
            <div className="grid grid-cols-7 divide-x">
              {weekDays.map((day, dayIndex) => {
                const dayLessons = lessons.filter((lesson) =>
                  isSameDay(parseISO(lesson.start), day)
                );
                const groupedLessons = groupLessons(dayLessons);

                return (
                  <div key={dayIndex} className="relative">
                    {HOURS.map((hour, index) => {
                      const isDisabled = !isWorkingHour({
                        day,
                        hour,
                        businessHours: organizationBusinessHours,
                      });

                      return (
                        <HourCell
                          key={hour}
                          day={day}
                          hour={hour}
                          isDisabled={isDisabled}
                          index={index}
                        />
                      );
                    })}

                    {groupedLessons.map((group, groupIndex) =>
                      group.map((lesson) => {
                        let style = getLessonBlockStyle(
                          lesson,
                          day,
                          groupIndex,
                          groupedLessons.length
                        );

                        const hasOverlap = groupedLessons.some(
                          (otherGroup, otherIndex) =>
                            otherIndex !== groupIndex &&
                            otherGroup.some((otherLesson) =>
                              areIntervalsOverlapping(
                                {
                                  start: parseISO(lesson.start),
                                  end: parseISO(lesson.end),
                                },
                                {
                                  start: parseISO(otherLesson.start),
                                  end: parseISO(otherLesson.end),
                                }
                              )
                            )
                        );

                        if (!hasOverlap)
                          style = { ...style, width: "100%", left: "0%" };

                        return (
                          <div
                            key={lesson.id}
                            className="absolute p-1"
                            style={style}
                          >
                            <LessonBlock lesson={lesson} />
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
            <CalendarTimeline />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
