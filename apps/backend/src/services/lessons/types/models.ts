import {
  DayOfWeek,
  LessonInstanceEnrollmentStatus,
  LessonInstanceStatus,
  LessonSeriesEnrollmentStatus,
  LessonSeriesStatus,
  RecurrenceFrequency,
} from "@instride/shared/models/enums";

import { Board, Service } from "@/services/boards/types/models";
import { Level, Rider, Trainer } from "@/services/organizations/types/models";

export interface LessonSeries {
  organizationId: string;
  id: string;
  name: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  duration: number;
  status: LessonSeriesStatus;
  boardId: string;
  maxRiders: number;
  serviceId: string;
  trainerId: string;
  levelId: string | null;
  notes: string | null;
  start: Date | string;
  isRecurring: boolean;
  recurrenceFrequency: RecurrenceFrequency | null;
  recurrenceByDay: DayOfWeek[] | null;
  recurrenceEnd: Date | string | null;
  effectiveFrom: Date | string | null;
  lastPlannedUntil: Date | string | null;
  createdByMemberId: string | null;
  updatedByMemberId: string | null;
  enrollments?: LessonSeriesEnrollment[] | null;
  level?: Level | null;
}

export interface LessonInstance {
  id: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  status: LessonInstanceStatus;
  boardId: string;
  maxRiders: number;
  serviceId: string;
  seriesId: string;
  trainerId: string;
  levelId: string | null;
  notes: string | null;
  start: Date;
  createdByMemberId: string | null;
  updatedByMemberId: string | null;
  end: Date;
  occurrenceKey: string;
  canceledAt: Date | null;
  canceledByMemberId: string | null;
  cancelReason: string | null;
  enrollments?: LessonInstanceEnrollment[] | null;
  level?: Level | null;
  service?: Service | null;
  trainer?: Trainer | null;
  board?: Board | null;
  series?: LessonSeries | null;
}

export interface LessonSeriesEnrollment {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  status: LessonSeriesEnrollmentStatus;
  seriesId: string;
  riderId: string;
  startDate: string;
  endDate: string | null;
  enrolledByMemberId: string | null;
  enrolledAt: Date | string;
  endedAt: Date | string | null;
  endedByMemberId: string | null;
  rider?: Rider | null;
}

export interface LessonInstanceEnrollment {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  status: LessonInstanceEnrollmentStatus;
  attended: boolean | null;
  riderId: string;
  enrolledByMemberId: string | null;
  enrolledAt: Date;
  instanceId: string;
  waitlistPosition: number | null;
  attendedAt: Date | null;
  markedByMemberId: string | null;
  unenrolledAt: Date | null;
  unenrolledByMemberId: string | null;
  instance?: LessonInstance | null;
  rider?: Rider | null;
}
