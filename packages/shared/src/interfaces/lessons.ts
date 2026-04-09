import {
  DayOfWeek,
  LessonInstanceEnrollmentStatus,
  LessonInstanceStatus,
  LessonSeriesEnrollmentStatus,
  LessonSeriesStatus,
  RecurrenceFrequency,
} from "../models/enums";
import { Board } from "./boards";
import { Service } from "./services";
import { Rider } from "./users";

export interface LessonInstance {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  name: string | null;
  organizationId: string;
  status: LessonInstanceStatus;
  boardId: string;
  maxRiders: number;
  serviceId: string;
  trainerMemberId: string;
  levelId: string | null;
  notes: string | null;
  start: Date | string;
  createdByMemberId: string | null;
  updatedByMemberId: string | null;
  seriesId: string;
  end: Date | string;
  occurrenceKey: string;
  canceledAt: Date | string | null;
  canceledByMemberId: string | null;
  cancelReason: string | null;
  service: Service;
  board: Board;
}

export interface LessonSeriesEnrollment {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  status: LessonSeriesEnrollmentStatus;
  seriesId: string;
  riderMemberId: string;
  startDate: Date | string;
  endDate: string | null;
  enrolledByMemberId: string | null;
  enrolledAt: Date | string;
  endedAt: Date | string | null;
  endedByMemberId: string | null;
}

export interface LessonInstanceEnrollment {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  status: LessonInstanceEnrollmentStatus;
  attended: boolean | null;
  riderMemberId: string;
  enrolledByMemberId: string | null;
  enrolledAt: Date | string;
  instanceId: string;
  waitlistPosition: number | null;
  attendedAt: Date | string | null;
  markedByMemberId: string | null;
  fromSeriesEnrollmentId: string | null;
  unenrolledAt: Date | string | null;
  unenrolledByMemberId: string | null;
  instance: LessonInstance;
}

export interface LessonSeries {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  name: string | null;
  organizationId: string;
  duration: number;
  status: LessonSeriesStatus;
  boardId: string;
  maxRiders: number;
  serviceId: string;
  trainerMemberId: string;
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
}

export interface LessonSeriesWithRiders extends LessonSeries {
  enrollments: Rider[];
}

export interface LessonInstanceWithEnrollments extends Omit<
  LessonInstance,
  "service" | "board"
> {
  enrollments: Omit<LessonInstanceEnrollment, "instance">[];
}
