import type { KioskActingContext, KioskPermissionSet } from "./types";

export function buildKioskPermissions(
  acting: KioskActingContext
): KioskPermissionSet {
  if (acting.scope === "staff") {
    return {
      canViewCalendar: true,
      canCheckIn: true,
      canCreateLesson: true,
      canEditLesson: true,
      canCreateTimeBlock: true,
      canEditTimeBlock: true,
      canEnroll: true,
      canUnenroll: true,
    };
  }

  if (acting.scope === "self") {
    return {
      canViewCalendar: true,
      canCheckIn: true,
      canCreateLesson: true,
      canEditLesson: true,
      canCreateTimeBlock: false,
      canEditTimeBlock: false,
      canEnroll: true,
      canUnenroll: true,
    };
  }

  return {
    canViewCalendar: true,
    canCheckIn: false,
    canCreateLesson: false,
    canEditLesson: false,
    canCreateTimeBlock: false,
    canEditTimeBlock: false,
    canEnroll: false,
    canUnenroll: false,
  };
}
