/**
 * Membership roles
 */
export const MembershipRole = {
  ADMIN: "admin",
  RIDER: "rider",
  TRAINER: "trainer",
  GUARDIAN: "guardian",
} as const;

export type MembershipRole =
  (typeof MembershipRole)[keyof typeof MembershipRole];

/**
 * Invitation statuses
 */
export const InvitationStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;

export type InvitationStatus =
  (typeof InvitationStatus)[keyof typeof InvitationStatus];

/**
 * Lesson series statuses
 */
export const LessonSeriesStatus = {
  ACTIVE: "active",
  PAUSED: "paused",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export type LessonSeriesStatus =
  (typeof LessonSeriesStatus)[keyof typeof LessonSeriesStatus];

/**
 * Lesson instance statuses
 */
export const LessonInstanceStatus = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type LessonInstanceStatus =
  (typeof LessonInstanceStatus)[keyof typeof LessonInstanceStatus];

/**
 * Lesson series enrollment statuses
 */
export const LessonSeriesEnrollmentStatus = {
  ACTIVE: "active",
  PAUSED: "paused",
  CANCELLED: "cancelled",
} as const;

export type LessonSeriesEnrollmentStatus =
  (typeof LessonSeriesEnrollmentStatus)[keyof typeof LessonSeriesEnrollmentStatus];

/**
 * Lesson instance enrollment statuses
 */
export const LessonInstanceEnrollmentStatus = {
  ENROLLED: "enrolled",
  WAITLISTED: "waitlisted",
  CANCELLED: "cancelled",
  ATTENDED: "attended",
  NO_SHOW: "no_show",
} as const;

export type LessonInstanceEnrollmentStatus =
  (typeof LessonInstanceEnrollmentStatus)[keyof typeof LessonInstanceEnrollmentStatus];

/**
 * Recurrence Frequency
 */
export const RecurrenceFrequency = {
  WEEKLY: "weekly",
  BIWEEKLY: "biweekly",
} as const;

export type RecurrenceFrequency =
  (typeof RecurrenceFrequency)[keyof typeof RecurrenceFrequency];

/**
 * Day of Week - ISO standard
 */
export const DayOfWeek = {
  MON: "monday",
  TUE: "tuesday",
  WED: "wednesday",
  THU: "thursday",
  FRI: "friday",
  SAT: "saturday",
  SUN: "sunday",
} as const;

export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];

/**
 * Membership Capabilities
 */
export const MembershipCapability = {
  RIDER: "rider",
  GUARDIAN: "guardian",
  DEPENDENT: "dependent",
} as const;

export type MembershipCapability =
  (typeof MembershipCapability)[keyof typeof MembershipCapability];

/**
 * Questionnaire Question Types
 */
export const QuestionnaireQuestionType = {
  BOOLEAN: "boolean",
  MULTIPLE_CHOICE: "multiple_choice",
} as const;

export type QuestionnaireQuestionType =
  (typeof QuestionnaireQuestionType)[keyof typeof QuestionnaireQuestionType];

/**
 * Questionnaire Question Operator
 */
export const QuestionnaireQuestionOperator = {
  EQUALS: "equals",
  NOT_EQUALS: "not_equals",
} as const;

export type QuestionnaireQuestionOperator =
  (typeof QuestionnaireQuestionOperator)[keyof typeof QuestionnaireQuestionOperator];

/**
 * Guardian relationship status
 */
export const GuardianRelationshipStatus = {
  ACTIVE: "active",
  REVOKED: "revoked",
  PENDING: "pending",
} as const;

export type GuardianRelationshipStatus =
  (typeof GuardianRelationshipStatus)[keyof typeof GuardianRelationshipStatus];

/**
 * Waiver statuses
 */
export const WaiverStatus = {
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

export type WaiverStatus = (typeof WaiverStatus)[keyof typeof WaiverStatus];

/**
 * File upload action
 */
export const FileUploadAction = {
  NONE: "none",
  UPDATE: "update",
  DELETE: "delete",
} as const;

export type FileUploadAction =
  (typeof FileUploadAction)[keyof typeof FileUploadAction];
