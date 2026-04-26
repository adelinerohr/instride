import type {
  DayOfWeek,
  LessonInstanceEnrollmentStatus,
  LessonInstanceStatus,
  LessonSeriesEnrollmentStatus,
  LessonSeriesStatus,
  RecurrenceFrequency,
} from "@instride/shared";

import type { Board, Service } from "./boards";
import type { Level, Rider, Trainer } from "./organizations";

// ============================================================================
// Entities
// ============================================================================

export interface LessonSeries {
  id: string;
  organizationId: string;
  boardId: string;
  serviceId: string;
  trainerId: string;
  levelId: string | null;
  status: LessonSeriesStatus;
  name: string | null;
  notes: string | null;
  duration: number;
  maxRiders: number;
  start: string;
  isRecurring: boolean;
  recurrenceFrequency: RecurrenceFrequency | null;
  recurrenceByDay: DayOfWeek[] | null;
  recurrenceEnd: string | null;
  effectiveFrom: string | null;
  lastPlannedUntil: string | null;
  createdAt: string;
  updatedAt: string;
  createdByMemberId: string | null;
  updatedByMemberId: string | null;
  level: Level | null;
  trainer: Trainer;
  board: Board;
  service: Service;
  enrollments: LessonSeriesEnrollment[];
}

export interface LessonInstance {
  id: string;
  organizationId: string;
  seriesId: string;
  boardId: string;
  serviceId: string;
  trainerId: string;
  levelId: string | null;
  status: LessonInstanceStatus;
  name: string | null;
  notes: string | null;
  maxRiders: number;
  start: string;
  end: string;
  occurrenceKey: string;
  canceledAt: string | null;
  canceledByMemberId: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  createdByMemberId: string | null;
  updatedByMemberId: string | null;
  level: Level | null;
  trainer: Trainer;
  board: Board;
  service: Service;
  series: LessonSeriesSummary;
  enrollments: LessonInstanceEnrollment[];
}

// Series as nested under an instance — no enrollments to avoid bloat
export interface LessonSeriesSummary {
  id: string;
  organizationId: string;
  boardId: string;
  serviceId: string;
  trainerId: string;
  levelId: string | null;
  status: LessonSeriesStatus;
  name: string | null;
  duration: number;
  isRecurring: boolean;
  recurrenceFrequency: RecurrenceFrequency | null;
  recurrenceByDay: DayOfWeek[] | null;
  start: string;
}

export interface LessonSeriesEnrollment {
  id: string;
  organizationId: string;
  seriesId: string;
  riderId: string;
  status: LessonSeriesEnrollmentStatus;
  startDate: string;
  endDate: string | null;
  enrolledAt: string;
  enrolledByMemberId: string | null;
  endedAt: string | null;
  endedByMemberId: string | null;
  createdAt: string;
  updatedAt: string;
  rider: Rider;
}

export interface LessonInstanceEnrollment {
  id: string;
  organizationId: string;
  instanceId: string;
  riderId: string;
  status: LessonInstanceEnrollmentStatus;
  attended: boolean | null;
  enrolledAt: string;
  enrolledByMemberId: string | null;
  waitlistPosition: number | null;
  attendedAt: string | null;
  markedByMemberId: string | null;
  unenrolledAt: string | null;
  unenrolledByMemberId: string | null;
  fromSeriesEnrollmentId: string | null;
  createdAt: string;
  updatedAt: string;
  rider: Rider;
}

// Enrollment with the parent instance loaded — for "my upcoming lessons" views
export interface LessonInstanceEnrollmentWithInstance extends LessonInstanceEnrollment {
  instance: LessonInstance;
}

// ============================================================================
// Series requests + responses
// ============================================================================

export interface CreateLessonSeriesRequest {
  boardId: string;
  serviceId: string;
  trainerId: string;
  duration: number;
  maxRiders: number;
  start: string;
  name?: string | null;
  levelId?: string | null;
  notes?: string | null;
  isRecurring?: boolean;
  recurrenceFrequency?: RecurrenceFrequency | null;
  recurrenceByDay?: DayOfWeek[] | null;
  recurrenceEnd?: string | null;
  riderIds?: string[];
  overrideAvailability?: boolean;
}

export interface UpdateLessonSeriesRequest {
  id: string;
  boardId?: string;
  serviceId?: string;
  trainerId?: string;
  duration?: number;
  maxRiders?: number;
  start?: string;
  name?: string | null;
  status?: LessonSeriesStatus;
  levelId?: string | null;
  notes?: string | null;
  isRecurring?: boolean;
  recurrenceFrequency?: RecurrenceFrequency | null;
  recurrenceByDay?: DayOfWeek[] | null;
  recurrenceEnd?: string | null;
  effectiveFrom?: string | null;
  riderIds?: string[];
  overrideAvailability?: boolean;
}

export interface CancelLessonSeriesRequest {
  id: string;
  reason?: string;
}

export interface SkippedInstance {
  date: string;
  reason: string;
  eventTitle?: string;
}

export interface SeriesEnrollmentFailure {
  riderId: string;
  reason: string;
}

export interface GetLessonSeriesResponse {
  series: LessonSeries;
  timezone: string;
}

export interface ListLessonSeriesResponse {
  series: LessonSeries[];
}

// Create returns both the series and any instances that were skipped during
// initial materialization (e.g., conflicts with events).
export interface CreateLessonSeriesResponse {
  series: LessonSeries;
  skipped: SkippedInstance[];
}

// ============================================================================
// Instance requests + responses
// ============================================================================

export interface ListLessonInstancesRequest {
  from: string;
  to: string;
  boardId?: string;
  trainerId?: string;
  status?: LessonInstanceStatus;
}

export interface CreateLessonInstanceRequest {
  seriesId: string;
  boardId: string;
  trainerId: string;
  serviceId: string;
  maxRiders: number;
  start: string;
  end: string;
  occurrenceKey: string;
  name?: string | null;
  levelId?: string | null;
  notes?: string | null;
}

export interface UpdateLessonInstanceRequest {
  instanceId: string;
  boardId?: string;
  trainerId?: string;
  serviceId?: string;
  maxRiders?: number;
  start?: string;
  end?: string;
  name?: string | null;
  status?: LessonInstanceStatus;
  levelId?: string | null;
  notes?: string | null;
  riderIds?: string[];
}

export interface UpdateLessonSeriesRequest {
  id: string;

  // Group A — safe
  name?: string | null;
  notes?: string | null;
  maxRiders?: number;

  // Group B — schedule shape
  start?: string;
  duration?: number;
  isRecurring?: boolean;
  recurrenceFrequency?: RecurrenceFrequency | null;
  recurrenceByDay?: DayOfWeek[] | null;
  recurrenceEnd?: string | null;

  // Group C — assignment
  trainerId?: string;
  boardId?: string;
  serviceId?: string;
  levelId?: string | null;

  // Group D — enrollments (full set, not a diff)
  riderIds?: string[];

  // Override availability conflict checks
  overrideAvailability?: boolean;
}

export interface UpdateLessonSeriesResponse {
  series: LessonSeries;
  /** Future occurrences that were skipped during regeneration. Empty if no regen ran. */
  skipped: SkippedInstance[];
  /** Whether scheduling-affecting fields changed and instances were regenerated. */
  regenerated: boolean;
}

export interface CancelLessonInstanceRequest {
  instanceId: string;
  reason?: string;
}

export interface GetLessonInstanceResponse {
  instance: LessonInstance;
}

export interface ListLessonInstancesResponse {
  instances: LessonInstance[];
}

export interface GetLessonStatsResponse {
  totalLessonInstancesThisMonth: number;
  totalLessonInstancesLastMonth: number;
  percentageChange: number;
}

// ============================================================================
// Enrollment requests + responses
// ============================================================================

export interface EnrollRidersInInstanceRequest {
  instanceId: string;
  riderIds: string[];
  enrolledByMemberId?: string;
}

export interface EnrollRidersInSeriesRequest {
  seriesId: string;
  riderIds: string[];
  startDate: string;
  endDate: string | null;
}

export interface UnenrollFromInstanceRequest {
  enrollmentId: string;
}

export interface UnenrollRiderFromSeriesRequest {
  seriesId: string;
  riderId: string;
}

export interface MarkAttendanceRequest {
  enrollmentId: string;
  attended: boolean;
}

export interface ListMyEnrollmentsRequest {
  from: string;
  to: string;
}

export interface EnrollInInstanceResponse {
  enrollments: LessonInstanceEnrollment[];
}

export interface EnrollInSeriesResponse {
  enrolled: LessonSeriesEnrollment[];
  failed: SeriesEnrollmentFailure[];
}

export interface GetInstanceEnrollmentResponse {
  enrollment: LessonInstanceEnrollment;
}

export interface ListInstanceEnrollmentsResponse {
  enrollments: LessonInstanceEnrollment[];
}

export interface ListSeriesEnrollmentsResponse {
  enrollments: LessonSeriesEnrollment[];
}

export interface ListMyEnrollmentsResponse {
  enrollments: LessonInstanceEnrollmentWithInstance[];
}

// ============================================================================
// Scheduler
// ============================================================================

export interface GenerateLessonInstancesRequest {
  seriesId: string;
  until: string;
}

export interface GenerateLessonInstancesResponse {
  created: number;
  skipped: SkippedInstance[];
}
