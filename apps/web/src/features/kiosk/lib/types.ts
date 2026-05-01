import type { KioskScope } from "@instride/shared";

export interface KioskActingContext {
  actingMemberId: string | null;
  scope: KioskScope;
  expiresAt: string | null;
}

export interface KioskPermissionSet {
  canViewCalendar: boolean;
  canCreateLesson: boolean;
  canEditLesson: boolean;
  canCancelLesson: boolean;
  canCreateTimeBlock: boolean;
  canEditTimeBlock: boolean;
  canEnroll: boolean;
  canUnenroll: boolean;
}
