import {
  addDaysToYmd,
  getDOWInTimeZone,
  getLocalParts,
  makeUTCDateFromLocalParts,
} from "@instride/utils";
import { addMinutes } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

import { db } from "@/database";

import { createLessonInstance } from "../instances/post";
import { LessonInstance, LessonSeries } from "../types/models";
import { checkLessonAvailability } from "../utils/availability";
import { SkippedInstance } from "./generate";

export async function generateStandaloneInstance(input: {
  series: LessonSeries;
  timezone: string;
}): Promise<{
  instances: LessonInstance[];
  skipped: SkippedInstance[];
}> {
  const { instance } = await createLessonInstance({
    ...input.series,
    seriesId: input.series.id,
    occurrenceKey: `standalone:${input.series.id}`,
    start: new Date(input.series.start).toISOString(),
    end: addMinutes(
      new Date(input.series.start),
      input.series.duration
    ).toISOString(),
  });

  return { instances: [instance], skipped: [] };
}

export async function generateRecurringInstances(input: {
  series: LessonSeries;
  timezone: string;
  until: Date;
}): Promise<{
  instances: LessonInstance[];
  skipped: SkippedInstance[];
}> {
  const seriesStart = new Date(input.series.start);
  const effectiveUntil =
    input.series.recurrenceEnd && input.series.recurrenceEnd < input.until
      ? input.series.recurrenceEnd
      : input.until;

  const startParts = getLocalParts({
    date: seriesStart,
    timeZone: input.timezone,
  });
  const targetDay = getDOWInTimeZone({
    date: seriesStart,
    timeZone: input.timezone,
  });

  const cursorBase = input.series.lastPlannedUntil
    ? addMinutes(new Date(input.series.lastPlannedUntil), 1)
    : seriesStart;

  const cursorDay = getDOWInTimeZone({
    date: cursorBase,
    timeZone: input.timezone,
  });
  const daysUntilTarget = (targetDay - cursorDay + 7) % 7;

  let currentYmd = addDaysToYmd({
    ...getLocalParts({ date: cursorBase, timeZone: input.timezone }),
    daysToAdd: daysUntilTarget,
  });

  const instances: LessonInstance[] = [];
  const skipped: SkippedInstance[] = [];

  while (true) {
    const instanceStart = makeUTCDateFromLocalParts({
      parts: {
        ...currentYmd,
        ...startParts,
        second: 0,
      },
      timeZone: input.timezone,
    });

    if (instanceStart > effectiveUntil) break;

    // Only create future instances
    if (instanceStart >= new Date()) {
      const result = await materializeOccurrence({
        series: input.series,
        timezone: input.timezone,
        instanceStart,
      });

      if (result.type === "created") instances.push(result.instance);
      if (result.type === "skipped") skipped.push(result.skipped);
    }

    currentYmd = addDaysToYmd({ ...currentYmd, daysToAdd: 7 });
  }

  return { instances, skipped };
}

async function materializeOccurrence(input: {
  series: LessonSeries;
  timezone: string;
  instanceStart: Date;
}): Promise<
  | { type: "created"; instance: LessonInstance }
  | { type: "skipped"; skipped: SkippedInstance }
  | { type: "exists" }
> {
  const instanceEnd = addMinutes(input.instanceStart, input.series.duration);
  const localDate = formatInTimeZone(
    input.instanceStart,
    input.timezone,
    "yyyy-MM-dd"
  );
  const key = `${input.series.id}:${localDate}`;

  const alreadyExists = await db.query.lessonInstances.findFirst({
    where: { occurrenceKey: key },
  });

  if (alreadyExists) return { type: "exists" };

  const violations = await checkLessonAvailability({
    organizationId: input.series.organizationId,
    window: {
      date: localDate,
      startTime: formatInTimeZone(input.instanceStart, input.timezone, "HH:mm"),
      endTime: formatInTimeZone(instanceEnd, input.timezone, "HH:mm"),
      trainerId: input.series.trainerId,
      boardId: input.series.boardId,
    },
  });

  if (violations.length > 0) {
    return {
      type: "skipped",
      skipped: {
        date: localDate,
        reason: violations.map((v) => v.message).join(", "),
        eventTitle: violations.find((v) => v.eventTitle)?.eventTitle,
      },
    };
  }

  const { instance } = await createLessonInstance({
    ...input.series,
    seriesId: input.series.id,
    occurrenceKey: key,
    start: input.instanceStart.toISOString(),
    end: instanceEnd.toISOString(),
  });

  return { type: "created", instance };
}
