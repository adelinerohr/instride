import {
  checkIfValidStrings,
  createTimeBlockSchema,
  formPartsToIso,
  isoToFormParts,
  type CreateTimeBlockSchema,
} from "@instride/shared";
import { formOptions } from "@tanstack/react-form";

import { formatError } from "@/shared/lib/utils/errors";

const createTimeBlockDefaultValues: CreateTimeBlockSchema = {
  trainerId: "",
  start: { date: "", time: "" },
  end: { date: "", time: "" },
  reason: null,
};

export const createTimeBlockFormOpts = formOptions({
  defaultValues: createTimeBlockDefaultValues,
  validators: { onSubmit: createTimeBlockSchema },
});

export function buildCreateTimeBlockDefaultValues(input: {
  initialValues: {
    start?: string;
    trainerId?: string;
  };
  timezone: string;
}): CreateTimeBlockSchema {
  const start = input.initialValues.start
    ? isoToFormParts(input.initialValues.start, input.timezone)
    : { date: "", time: "" };
  return {
    ...createTimeBlockDefaultValues,
    start,
    end: { date: start.date, time: "" },
    trainerId: input.initialValues.trainerId ?? "",
  };
}

export function validateEndAfterStart(input: {
  start: { date: string; time: string };
  end: { date: string; time: string };
  timezone: string;
}) {
  const { start, end, timezone } = input;
  if (!checkIfValidStrings([start.date, start.time, end.date, end.time]))
    return undefined;

  const startMs = new Date(formPartsToIso(start, timezone)).getTime();
  const endMs = new Date(formPartsToIso(end, timezone)).getTime();

  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    return formatError("Please enter valid dates.");
  }
  if (endMs <= startMs) {
    return formatError("End time must be after start time.");
  }
  return undefined;
}
