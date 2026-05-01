import type { LessonInstance, TimeBlock } from "@instride/api";
import { differenceInMinutes, parseISO } from "date-fns";

import { START_HOUR } from "@/features/calendar/lib/constants";

export function groupEvents(
  dayLessons: LessonInstance[],
  dayTimeBlocks: TimeBlock[]
) {
  const sortedEvents = [...dayLessons, ...dayTimeBlocks].sort(
    (a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()
  );
  const groups: (LessonInstance | TimeBlock)[][] = [];

  for (const event of sortedEvents) {
    const eventStart = parseISO(event.start);

    let placed = false;
    for (const group of groups) {
      const lastEventInGroup = group[group.length - 1];
      const lastEventEnd = parseISO(lastEventInGroup.end);

      if (eventStart >= lastEventEnd) {
        group.push(event);
        placed = true;
        break;
      }
    }

    if (!placed) groups.push([event]);
  }

  return groups;
}

export function getBlockStyle(input: {
  start: string;
  end: string;
  day: Date;
  groupIndex: number;
  groupSize: number;
  slotHeight: number;
}) {
  const startDate = parseISO(input.start);
  const dayStart = new Date(input.day);
  dayStart.setHours(0, 0, 0, 0);
  const lessonStart = startDate < dayStart ? dayStart : startDate;
  const startMinutes = differenceInMinutes(lessonStart, dayStart);

  const visibleStartMinutes = START_HOUR * 60;
  const top = ((startMinutes - visibleStartMinutes) / 60) * input.slotHeight;

  const width = 100 / input.groupSize;
  const left = input.groupIndex * width;

  return { top: `${top}px`, width: `${width}%`, left: `${left}%` };
}
