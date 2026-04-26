import type { EventScope } from "@instride/shared";

// ============================================================================
// Entities
// ============================================================================

export interface Event {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  blockScheduling: boolean;
  scope: EventScope;
  boardIds: string[];
  trainerIds: string[];
  createdByMemberId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface EventSchedulingBlock {
  id: string;
  eventId: string;
  scope: EventScope;
  boardId: string | null;
  trainerId: string | null;
}

// Lightweight projection of a lesson instance returned by
// /events/affected-instances. Full LessonInstance is overkill — we only
// need to identify which lessons would be affected.
export interface AffectedLessonInstance {
  id: string;
  start: Date | string;
  end: Date | string;
  trainerId: string;
  boardId: string;
  name: string | null;
}

// ============================================================================
// Requests
// ============================================================================

export interface ListEventsRequest {
  from: string;
  to: string;
}

export interface UpsertEventRequest {
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  startTime?: string | null;
  endTime?: string | null;
  scope: EventScope;
  boardIds?: string[] | null;
  trainerIds?: string[] | null;
  blockScheduling: boolean;
  cancellationReason?: string;
}

export interface UpdateEventRequest extends UpsertEventRequest {
  id: string;
}

export interface GetAffectedInstancesRequest {
  startDate: string;
  endDate: string;
  startTime?: string | null;
  endTime?: string | null;
  scope: EventScope;
  boardIds?: string[] | null;
  trainerIds?: string[] | null;
}

// ============================================================================
// Responses
// ============================================================================

export interface GetEventResponse {
  event: Event;
}

export interface ListEventsResponse {
  events: Event[];
}

export interface ListAffectedInstancesResponse {
  instances: AffectedLessonInstance[];
}
