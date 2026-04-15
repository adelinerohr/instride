import { EventScope } from "@instride/shared";

export interface Event {
  organizationId: string;
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  description: string | null;
  createdByMemberId: string | null;
  startDate: string;
  endDate: string;
  title: string;
  startTime: string | null;
  endTime: string | null;
  blockScheduling: boolean;
  schedulingBlocks?: EventSchedulingBlock[] | null;
}

export interface EventSchedulingBlock {
  id: string;
  scope: EventScope;
  boardId: string | null;
  trainerId: string | null;
  eventId: string;
}
