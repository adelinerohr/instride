import {
  addDaysToYmd,
  getDOWInTimeZone,
  getLocalParts,
  makeUTCDateFromLocalParts,
} from "@instride/shared";
import { addMinutes } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

import { checkLessonAvailability } from "../../availability/scheduling/check-availability";
import { createInstanceWithPublish } from "../instances/instance.repo";
import { LessonInstanceRow, LessonSeriesRow } from "../schema";
import { SkippedInstance } from "./generate";

interface GenerateInput {
  series: LessonSeriesRow;
  timezone: string;
  /** Member id to record as creator. `null` for system callers (cron). */
  createdByMemberId: string | null;
}

export async function generateStandaloneInstance(
  input: GenerateInput
): Promise<{
  instances: LessonInstanceRow[];
  skipped: SkippedInstance[];
}> {
  const start = new Date(input.series.start);
  const end = addMinutes(start, input.series.duration);

  const { instance, wasCreated } = await createInstanceWithPublish({
    organizationId: input.series.organizationId,
    createdByMemberId: input.createdByMemberId,
    seriesId: input.series.id,
    boardId: input.series.boardId,
    trainerId: input.series.trainerId,
    serviceId: input.series.serviceId,
    levelId: input.series.levelId,
    name: input.series.name,
    notes: input.series.notes,
    maxRiders: input.series.maxRiders,
    occurrenceKey: `standalone:${input.series.id}`,
    start: start.toISOString(),
    end: end.toISOString(),
  });

  // Only report as "created" if this call actually produced the row.
  // Idempotent retries return the existing instance without counting it.
  return {
    instances: wasCreated ? [instance] : [],
    skipped: [],
  };
}

interface GenerateRecurringInput extends GenerateInput {
  /** Upper bound for materialization. Will be clamped to `recurrenceEnd`. */
  until: Date;
}

export async function generateRecurringInstances(
  input: GenerateRecurringInput
): Promise<{
  instances: LessonInstanceRow[];
  skipped: SkippedInstance[];
  /** The date we actually materialized through, clamped to recurrenceEnd. */
  plannedUntil: Date;
}> {
  const seriesStart = new Date(input.series.start);
  const recurrenceEnd = input.series.recurrenceEnd
    ? new Date(input.series.recurrenceEnd)
    : null;

  const effectiveUntil =
    recurrenceEnd && recurrenceEnd < input.until ? recurrenceEnd : input.until;

  const startParts = getLocalParts({
    date: seriesStart,
    timeZone: input.timezone,
  });
  const targetDay = getDOWInTimeZone({
    date: seriesStart,
    timeZone: input.timezone,
  });

  // Start walking from whichever is later: the series anchor, or the day
  // after our last planned run. Taking max() with `now` lets us safely
  // shrink the generation window without re-walking past dates.
  const lastPlanned = input.series.lastPlannedUntil
    ? new Date(input.series.lastPlannedUntil)
    : null;
  const cursorBase = lastPlanned
    ? new Date(Math.max(seriesStart.getTime(), lastPlanned.getTime() + 60_000))
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

  const instances: LessonInstanceRow[] = [];
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

    // Only materialize future occurrences. Past dates are skipped silently;
    // we never backfill.
    if (instanceStart >= new Date()) {
      const result = await materializeOccurrence({
        series: input.series,
        timezone: input.timezone,
        instanceStart,
        createdByMemberId: input.createdByMemberId,
      });

      if (result.type === "created") instances.push(result.instance);
      if (result.type === "skipped") skipped.push(result.skipped);
      // "exists" is a silent no-op — don't count it as created.
    }

    currentYmd = addDaysToYmd({ ...currentYmd, daysToAdd: 7 });
  }

  return { instances, skipped, plannedUntil: effectiveUntil };
}

async function materializeOccurrence(input: {
  series: LessonSeriesRow;
  timezone: string;
  instanceStart: Date;
  createdByMemberId: string | null;
}): Promise<
  | { type: "created"; instance: LessonInstanceRow }
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

  // createLessonInstanceCore handles the race: if the row already exists
  // (same occurrenceKey), wasCreated will be false and we return "exists".
  const { instance, wasCreated } = await createInstanceWithPublish({
    organizationId: input.series.organizationId,
    createdByMemberId: input.createdByMemberId,
    seriesId: input.series.id,
    boardId: input.series.boardId,
    trainerId: input.series.trainerId,
    serviceId: input.series.serviceId,
    levelId: input.series.levelId,
    name: input.series.name,
    notes: input.series.notes,
    maxRiders: input.series.maxRiders,
    occurrenceKey: key,
    start: input.instanceStart.toISOString(),
    end: instanceEnd.toISOString(),
  });

  return wasCreated ? { type: "created", instance } : { type: "exists" };
}
