import { KioskScope } from "@instride/shared";

import { type KioskActingContext, type KioskPermissionSet } from "./types";

const NO_PERMISSIONS: KioskPermissionSet = {
  canViewCalendar: true, // viewing always allowed
  canCreateLesson: false,
  canEditLesson: false,
  canCancelLesson: false,
  canCreateTimeBlock: false,
  canEditTimeBlock: false,
  canEnroll: false,
  canUnenroll: false,
};

export function buildKioskPermissions(
  acting: KioskActingContext,
  isMemberActing: boolean
): KioskPermissionSet {
  if (acting.scope === KioskScope.DEFAULT || !isMemberActing) {
    // In default scope, no actions are pre-authorized — every action goes
    // through PIN auth which checks permissions server-side.
    return NO_PERMISSIONS;
  }

  if (acting.scope === KioskScope.STAFF) {
    return {
      canViewCalendar: true,
      canCreateLesson: true,
      canEditLesson: true,
      canCancelLesson: true,
      canCreateTimeBlock: true,
      canEditTimeBlock: true,
      canEnroll: true,
      canUnenroll: true,
    };
  }

  // SELF scope. Permissions are coarse-grained client-side because
  // fine-grained checks (board.canRiderAdd, lesson cancel rules) require
  // entity context the server has. Server is the source of truth.
  return {
    canViewCalendar: true,
    canCreateLesson: true,
    canEditLesson: false,
    canCancelLesson: true, // server enforces "private/sole-enrollee" rule
    canCreateTimeBlock: false,
    canEditTimeBlock: false,
    canEnroll: true,
    canUnenroll: true,
  };
}
