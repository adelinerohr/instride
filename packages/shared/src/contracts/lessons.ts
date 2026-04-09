import {
  LessonInstanceWithEnrollments,
  LessonInstanceEnrollment,
  LessonSeriesEnrollment,
  LessonInstance,
  LessonSeries,
} from "../interfaces/lessons";
import { Rider } from "../interfaces/users";
import { RecurrenceFrequency } from "../models/enums";

// ---- Enrollments ------------------------------------------------------------

export interface GetEnrollmentResponse {
  enrollment: LessonInstanceEnrollment;
}

export interface EnrollInInstanceRequest {
  riderMemberId: string;
}

export interface EnrollInInstanceResponse extends GetEnrollmentResponse {}

export interface MarkAttendanceRequest {
  attended: boolean;
}

export interface MarkAttendanceResponse extends GetEnrollmentResponse {}

export interface EnrollInSeriesRequest {
  seriesId: string;
  riderMemberId: string;
  startDate: string;
  endDate: string | null;
}

export interface EnrollInSeriesResponse {
  enrollment: LessonSeriesEnrollment;
}

export interface ListEnrollmentsResponse {
  instanceEnrollments: LessonInstanceEnrollment[];
  seriesEnrollments: LessonSeriesEnrollment[];
}

// ---- Instances ------------------------------------------------------------

export interface ListInstancesRequest {
  organizationId: string;
  from: Date;
  to: Date;
  boardId?: string;
  trainerMemberId?: string;
}

export interface GetInstanceResponse {
  instance: LessonInstance;
  enrollments: LessonInstanceEnrollment[];
}

export interface ListInstancesResponse {
  instances: LessonInstanceWithEnrollments[];
}

export interface CancelInstanceRequest {
  reason?: string;
}

// ---- Series ------------------------------------------------------------

export interface GetLessonSeriesResponse {
  series: LessonSeries;
  enrollments: Rider[];
}

export interface EditLessonSeriesRequest extends Omit<
  LessonSeries,
  "id" | "createdAt" | "updatedAt"
> {}

export interface CreateLessonSeriesRequest {
  name: string | null;
  duration: number;
  boardId: string;
  maxRiders: number;
  serviceId: string;
  trainerMemberId: string;
  levelId: string | null;
  notes: string | null;
  start: string;
  isRecurring: boolean;
  recurrenceFrequency: RecurrenceFrequency | null;
  recurrenceEnd: string | null;
  riders?: string[];
}

export interface CreateLessonSeriesResponse {
  series: LessonSeries;
  enrollments: LessonSeriesEnrollment[];
}

export interface UpdateLessonSeriesRequest extends CreateLessonSeriesRequest {}

export interface UpdateLessonSeriesResponse {
  series: LessonSeries;
  enrollments: LessonSeriesEnrollment[];
}

export interface ListLessonSeriesResponse {
  series: LessonSeries[];
}

export interface CancelLessonSeriesRequest {
  reason?: string;
}

export interface GenerateLessonInstancesRequest {
  until: Date;
}
