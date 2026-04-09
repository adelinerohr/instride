import type { types } from "@instride/api";
import * as React from "react";

import type { DayTrainerColumn } from "../lib/types";
import {
  buildDayLessonsLayout,
  buildDayTimeBlocksLayout,
} from "../utils/layout";

export type UseDayViewArgs = {
  date: Date;
  lessons: types.LessonInstance[];
  timeBlocks: types.TimeBlock[];
  trainers: types.Trainer[];
  selectedTrainerIds?: string[];
};

export function useDayView({
  date,
  lessons,
  timeBlocks,
  trainers,
  selectedTrainerIds,
}: UseDayViewArgs): {
  columns: DayTrainerColumn[];
} {
  return React.useMemo(() => {
    const visibleTrainerIds =
      selectedTrainerIds && selectedTrainerIds.length > 0
        ? selectedTrainerIds
        : trainers.map((trainer) => trainer.id);

    const visibleTrainers = visibleTrainerIds
      .map((trainerId) => trainers.find((trainer) => trainer.id === trainerId))
      .filter(Boolean) as types.Trainer[];

    const columns: DayTrainerColumn[] = visibleTrainers.map((trainer) => ({
      trainer,
      lessons: buildDayLessonsLayout({
        day: date,
        lessons: lessons.filter(
          (lesson) => lesson.trainerMemberId === trainer.id
        ),
      }),
      timeBlocks: buildDayTimeBlocksLayout({
        day: date,
        timeBlocks: timeBlocks.filter(
          (block) => block.trainerId === trainer.id
        ),
      }),
    }));

    return { columns };
  }, [date, lessons, timeBlocks, trainers, selectedTrainerIds]);
}
