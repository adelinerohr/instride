import type { types } from "@instride/api";
import { differenceInMinutes, isWithinInterval, parseISO } from "date-fns";

import { END_HOUR, START_HOUR } from "@/features/calendar/lib/constants";

const COLORS = ["blue", "green", "red", "yellow", "purple", "orange"] as const;
export type TrainerColor = (typeof COLORS)[number];

export function getTrainerColor(trainerId: string): TrainerColor {
  let hash = 0;
  for (let i = 0; i < trainerId.length; i++) {
    hash = trainerId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function groupLessons(dayLessons: types.LessonInstance[]) {
  const sortedLessons = dayLessons.sort(
    (a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()
  );
  const groups: types.LessonInstance[][] = [];

  for (const lesson of sortedLessons) {
    const lessonStart = parseISO(lesson.start);

    let placed = false;
    for (const group of groups) {
      const lastLessonInGroup = group[group.length - 1];
      const lastLessonEnd = parseISO(lastLessonInGroup.end);

      if (lessonStart >= lastLessonEnd) {
        group.push(lesson);
        placed = true;
        break;
      }
    }

    if (!placed) groups.push([lesson]);
  }

  return groups;
}

export function getLessonBlockStyle(
  lesson: types.LessonInstance,
  day: Date,
  groupIndex: number,
  groupSize: number
) {
  const startDate = parseISO(lesson.start);
  const dayStart = new Date(day.setHours(0, 0, 0, 0));
  const lessonStart = startDate < dayStart ? dayStart : startDate;
  const startMinutes = differenceInMinutes(lessonStart, dayStart);

  const visibleStartMinutes = START_HOUR * 60;
  const visibleEndMinutes = END_HOUR * 60;
  const visibleRangeMinutes = visibleEndMinutes - visibleStartMinutes;
  const top =
    ((startMinutes - visibleStartMinutes) / visibleRangeMinutes) * 100;

  const width = 100 / groupSize;
  const left = groupIndex * width;

  return { top: `${top}%`, width: `${width}%`, left: `${left}%` };
}

export function getCurrentLessons(lessons: types.LessonInstance[]) {
  const now = new Date();
  return (
    lessons.filter((lesson) =>
      isWithinInterval(now, {
        start: parseISO(lesson.start),
        end: parseISO(lesson.end),
      })
    ) || null
  );
}
