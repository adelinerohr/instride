import {
  type LessonInstance,
  type LessonInstanceEnrollmentWithInstance,
  type Rider,
} from "@instride/api";
import { isBefore, setHours, startOfDay } from "date-fns";

import type { PortalRouteContext } from "@/routes/org/$slug/(authenticated)/portal/route";

export function getPhaseOfDay(now: Date) {
  if (isBefore(now, setHours(now, 12))) return "morning";
  if (isBefore(now, setHours(now, 18))) return "afternoon";
  return "evening";
}

export function groupEnrollmentsByDay(
  enrollments: LessonInstanceEnrollmentWithInstance[]
) {
  const sorted = [...enrollments].sort(
    (a, b) =>
      new Date(a.instance.start).getTime() -
      new Date(b.instance.start).getTime()
  );

  const groups = new Map<string, LessonInstanceEnrollmentWithInstance[]>();
  for (const enrollment of sorted) {
    const key = startOfDay(new Date(enrollment.instance.start)).toISOString();
    const existing = groups.get(key) ?? [];
    existing.push(enrollment);
    groups.set(key, existing);
  }

  return Array.from(groups, ([dayKey, enrollments]) => ({
    day: new Date(dayKey),
    enrollments,
  }));
}

export function groupByDay(lessons: LessonInstance[]) {
  const sorted = [...lessons].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const groups = new Map<string, LessonInstance[]>();
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

export function findNearestEnrollment(
  enrollments: LessonInstanceEnrollmentWithInstance[],
  now: Date
) {
  const lessons = enrollments
    .map((enrollment) => enrollment.instance)
    .filter((lesson): lesson is LessonInstance => lesson !== undefined);
  const nearest = findNearestLesson(lessons, now);
  if (!nearest) return undefined;
  return enrollments.find(
    (enrollment) => enrollment.instance?.id === nearest.id
  );
}

export function findNearestLesson(lessons: LessonInstance[], now: Date) {
  let nearest: LessonInstance | undefined;
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

export function resolveRiderOptions(context: PortalRouteContext): Rider[] {
  if (context.isGuardian && context.isOnlyGuardian) {
    return context.dependents.map((d) => d.rider);
  }
  if (context.isGuardian && !context.isOnlyGuardian) {
    return [context.rider, ...context.dependents.map((d) => d.rider)];
  }
  if (context.isDependent) {
    return [context.rider];
  }
  // context is narrowed to RiderContext here — TS knows it
  return [context.rider];
}
