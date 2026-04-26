import type { Trainer } from "@instride/api";
import { isWorkingHour } from "@instride/shared";
import { areIntervalsOverlapping, isSameDay, parseISO } from "date-fns";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { HOURS } from "@/features/calendar/lib/constants";
import {
  getLessonBlockStyle,
  groupLessons,
} from "@/features/calendar/utils/lesson";

import { HourCell } from "../fragments/hour-cell";
import { LessonBlock } from "../fragments/lesson-block";

interface DayColumnProps {
  trainer: Trainer;
  date: Date;
}

export function DayColumn({ trainer, date }: DayColumnProps) {
  const { trainerBusinessHours, lessons, slotHeight } = useCalendar();
  const currentTrainerBusinessHours = trainerBusinessHours[trainer.id];

  // Filter lessons to this specific day AND this trainer
  const groupedLessons = groupLessons(
    lessons.filter(
      (lesson) =>
        lesson.trainer?.id === trainer.id &&
        isSameDay(parseISO(lesson.start), date)
    )
  );

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
          />
        );
      })}

      {groupedLessons.map((group, groupIndex) =>
        group.map((lesson) => {
          let style = getLessonBlockStyle(
            lesson,
            date,
            groupIndex,
            groupedLessons.length,
            slotHeight
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

          if (!hasOverlap) style = { ...style, width: "100%", left: "0%" };

          return (
            <div key={lesson.id} className="absolute p-1" style={style}>
              <LessonBlock lesson={lesson} />
            </div>
          );
        })
      )}
    </div>
  );
}
