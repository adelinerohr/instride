export enum KioskScope {
  DEFAULT = "default",
  STAFF = "staff",
  SELF = "self",
}

export enum KioskAction {
  LESSON_CHECK_IN = "lesson_check_in",
  LESSON_CREATE = "lesson_create",
  LESSON_EDIT = "lesson_edit",
  TIME_BLOCK_CREATE = "time_block_create",
  TIME_BLOCK_EDIT = "time_block_edit",
  ENROLL = "enroll",
  UNENROLL = "unenroll",
  MARK_ATTENDANCE = "mark_attendance",
}

export interface KioskSession {
  id: string;
  createdAt: Date | string;
  organizationId: string;
  actingMemberId: string | null;
  boardId: string | null;
  locationName: string;
  scope: KioskScope;
  expiresAt: Date | string | null;
}

export interface KioskActingContext {
  actingMemberId: string;
  scope: KioskScope;
  expiresAt: Date | string | null;
  token: string | null;
}

export interface KioskPermissions {
  canViewCalendar: boolean;
  canCheckIn: boolean;
  canCreateLesson: boolean;
  canEditLesson: boolean;
  canCreateTimeBlock: boolean;
  canEditTimeBlock: boolean;
  canEnrollSelf: boolean;
  canUnenrollSelf: boolean;
  canActForOthers: boolean;
}
