import type { types } from "@instride/api";
import { areIntervalsOverlapping, parseISO } from "date-fns";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { HOURS } from "@/features/calendar/lib/constants";
import { isWorkingHour } from "@/features/calendar/utils/business-hours";
import {
  getLessonBlockStyle,
  groupLessons,
} from "@/features/calendar/utils/lesson";

import { HourCell } from "../fragments/hour-cell";
import { LessonBlock } from "../fragments/lesson-block";

interface DayColumnProps {
  trainer: types.Trainer;
}

export function DayColumn({ trainer }: DayColumnProps) {
  const { selectedDate, trainerBusinessHours, lessons } = useCalendar();

  const currentTrainerBusinessHours = trainerBusinessHours[trainer.id];

  const groupedLessons = groupLessons(
    lessons.filter((lesson) => lesson.trainer?.id === trainer.id)
  );

  return (
    <div className="relative">
      {HOURS.map((hour, index) => {
        const isDisabled = !isWorkingHour(
          selectedDate,
          hour,
          currentTrainerBusinessHours
        );

        return (
          <HourCell
            key={hour}
            isDisabled={isDisabled}
            index={index}
            day={selectedDate}
            hour={hour}
          />
        );
      })}

      {groupedLessons.map((group, groupIndex) =>
        group.map((lesson) => {
          let style = getLessonBlockStyle(
            lesson,
            selectedDate,
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
