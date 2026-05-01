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
    time: "",
    allDay: false,
  },
  end: {
    date: "",
    time: "",
    allDay: false,
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

export function buildDefaultEventValues(event?: Event): EventInput {
  if (!event) return defaultEventValues;

  return {
    ...event,
    start: {
      date: event.startDate,
      time: event.startTime,
      allDay: event.startTime === null,
    },
    end: {
      date: event.endDate,
      time: event.endTime,
      allDay: event.endTime === null,
    },
  };
}
