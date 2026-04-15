import { EventScope } from "@instride/shared";

import { Event } from "./models";

export interface ListEventsResponse {
  events: GetEventResponse[];
}

export interface GetEventResponse {
  event: Event;
  scope?: EventScope;
  boardIds?: string[];
  trainerIds?: string[];
}
