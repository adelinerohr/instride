import type { KioskScope } from "@instride/shared";

export interface KioskActingContext {
  actingMemberId: string | null;
  scope: KioskScope;
  expiresAt: string | null;
}

export interface KioskPermissionSet {
  canViewCalendar: boolean;
  canCheckIn: boolean;
  canCreateLesson: boolean;
  canEditLesson: boolean;
  canCreateTimeBlock: boolean;
  canEditTimeBlock: boolean;
  canEnroll: boolean;
  canUnenroll: boolean;
}
