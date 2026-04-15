export const KioskScope = {
  DEFAULT: "default",
  SELF: "self",
  STAFF: "staff",
} as const;

export type KioskScope = (typeof KioskScope)[keyof typeof KioskScope];

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
