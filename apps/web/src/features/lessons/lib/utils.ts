import type { types } from "@instride/api";
import { isBefore, setHours, startOfDay } from "date-fns";

export function getPhaseOfDay(now: Date) {
  if (isBefore(now, setHours(now, 12))) return "morning";
  if (isBefore(now, setHours(now, 18))) return "afternoon";
  return "evening";
}

export function groupByDay(lessons: types.LessonInstance[]) {
  const sorted = [...lessons].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const groups = new Map<string, types.LessonInstance[]>();
  for (const lesson of sorted) {
    const key = startOfDay(new Date(lesson.start)).toISOString();
    const existing = groups.get(key) ?? [];
    existing.push(lesson);
    groups.set(key, existing);
  }

  return Array.from(groups, ([dayKey, lessons]) => ({
    day: new Date(dayKey),
    lessons,
  }));
}

export function findNearestLesson(lessons: types.LessonInstance[], now: Date) {
  let nearest: types.LessonInstance | undefined;
  let nearestStart = Infinity;

  for (const lesson of lessons) {
    const start = new Date(lesson.start).getTime();
    const end = new Date(lesson.end).getTime();

    // Ongoing wins immediately
    if (start <= now.getTime() && end > now.getTime()) return lesson;

    if (start > now.getTime() && start < nearestStart) {
      nearest = lesson;
      nearestStart = start;
    }
  }

  return nearest;
}
