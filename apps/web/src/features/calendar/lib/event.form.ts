import type { Event } from "@instride/api";
import {
  eventInputSchema,
  EventScope,
  type EventInput,
} from "@instride/shared";
import { formOptions } from "@tanstack/react-form";

const defaultEventValues: EventInput = {
  title: "",
  description: null,
  start: {
    date: "",
    time: null,
  },
  end: {
    date: "",
    time: null,
  },
  scope: EventScope.ORGANIZATION,
  boardIds: [],
  trainerIds: [],
  blockScheduling: false,
};

export const eventFormOpts = formOptions({
  defaultValues: defaultEventValues,
  validators: {
    onSubmit: eventInputSchema,
  },
});

export function buildDefaultEventValues(props?: Partial<Event>): EventInput {
  return {
    title: props?.title ?? defaultEventValues.title,
    description: props?.description ?? defaultEventValues.description,
    start: {
      date: props?.startDate ?? defaultEventValues.start.date,
      time: props?.startTime ?? defaultEventValues.start.time,
    },
    end: {
      date: props?.endDate ?? defaultEventValues.end.date,
      time: props?.endTime ?? defaultEventValues.end.time,
    },
    scope: props?.scope ?? defaultEventValues.scope,
    boardIds: props?.boardIds ?? defaultEventValues.boardIds,
    trainerIds: props?.trainerIds ?? defaultEventValues.trainerIds,
    blockScheduling:
      props?.blockScheduling ?? defaultEventValues.blockScheduling,
  };
}
