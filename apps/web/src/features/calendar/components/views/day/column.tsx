import type { Trainer } from "@instride/api";
import { isWorkingHour } from "@instride/shared";
import { areIntervalsOverlapping, isSameDay, parseISO } from "date-fns";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { HOURS } from "@/features/calendar/lib/constants";
import { getBlockStyle, groupEvents } from "@/features/calendar/utils/lesson";

import { HourCell } from "../fragments/hour-cell";
import { LessonBlock } from "../fragments/lesson-block";
import { TimeBlock } from "../fragments/time-block";

interface DayColumnProps {
  trainer: Trainer;
  date: Date;
}

export function DayColumn({ trainer, date }: DayColumnProps) {
  const { trainerBusinessHours, lessons, timeBlocks, slotHeight } =
    useCalendar();
  const currentTrainerBusinessHours = trainerBusinessHours[trainer.id];

  const dayLessons = lessons.filter(
    (lesson) =>
      lesson.trainer?.id === trainer.id &&
      isSameDay(parseISO(lesson.start), date)
  );
  const dayTimeBlocks = timeBlocks.filter(
    (timeBlock) =>
      timeBlock.trainerId === trainer.id &&
      isSameDay(parseISO(timeBlock.start), date)
  );

  const groupedEvents = groupEvents(dayLessons, dayTimeBlocks);

  return (
    <div className="relative flex-1">
      {HOURS.map((hour, index) => {
        const isDisabled = !isWorkingHour({
          day: date,
          hour,
          businessHours: currentTrainerBusinessHours,
        });
        return (
          <HourCell
            key={hour}
            isDisabled={isDisabled}
            index={index}
            day={date}
            hour={hour}
            trainerId={trainer.id}
          />
        );
      })}

      {groupedEvents.map((group, groupIndex) =>
        group.map((event) => {
          let style = getBlockStyle({
            start: event.start,
            end: event.end,
            day: date,
            groupIndex,
            groupSize: groupedEvents.length,
            slotHeight,
          });
          const hasOverlap = groupedEvents.some(
            (otherGroup, otherIndex) =>
              otherIndex !== groupIndex &&
              otherGroup.some((otherEvent) =>
                areIntervalsOverlapping(
                  {
                    start: parseISO(event.start),
                    end: parseISO(event.end),
                  },
                  {
                    start: parseISO(otherEvent.start),
                    end: parseISO(otherEvent.end),
                  }
                )
              )
          );

          if (!hasOverlap) style = { ...style, width: "100%", left: "0%" };

          if ("reason" in event) {
            return (
              <div key={event.id} className="absolute p-1" style={style}>
                <TimeBlock timeBlock={event} />
              </div>
            );
          }

          return (
            <div key={event.id} className="absolute p-1" style={style}>
              <LessonBlock lesson={event} />
            </div>
          );
        })
      )}
    </div>
  );
}
