import type { LessonInstance } from "@instride/api";
import { differenceInMinutes, isWithinInterval, parseISO } from "date-fns";

import { START_HOUR } from "@/features/calendar/lib/constants";

export function groupLessons(dayLessons: LessonInstance[]) {
  const sortedLessons = dayLessons.sort(
    (a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()
  );
  const groups: LessonInstance[][] = [];

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
  lesson: LessonInstance,
  day: Date,
  groupIndex: number,
  groupSize: number,
  slotHeight: number
) {
  const startDate = parseISO(lesson.start);
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const lessonStart = startDate < dayStart ? dayStart : startDate;
  const startMinutes = differenceInMinutes(lessonStart, dayStart);

  const visibleStartMinutes = START_HOUR * 60;
  const top = ((startMinutes - visibleStartMinutes) / 60) * slotHeight;

  const width = 100 / groupSize;
  const left = groupIndex * width;

  return { top: `${top}px`, width: `${width}%`, left: `${left}%` };
}

export function getCurrentLessons(lessons: LessonInstance[]) {
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
