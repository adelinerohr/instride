import { GuardianPermissions } from "../models/types";

export enum DependentAction {
  BOOK_LESSON = "BOOK_LESSON",
  JOIN_EVENT = "JOIN_EVENT",
  CANCEL_BOOKING = "CANCEL_BOOKING",
  REQUIRES_APPROVAL = "REQUIRES_APPROVAL",
  CAN_CANCEL = "CAN_CANCEL",
  CAN_POST = "CAN_POST",
  CAN_COMMENT = "CAN_COMMENT",
  RECEIVE_EMAIL_NOTIFICATIONS = "RECEIVE_EMAIL_NOTIFICATIONS",
  RECEIVE_TEXT_NOTIFICATIONS = "RECEIVE_TEXT_NOTIFICATIONS",
  CAN_EDIT_PROFILE = "CAN_EDIT_PROFILE",
}

export function canDependentPerform(
  action: DependentAction,
  permissions: GuardianPermissions | null
): { allowed: boolean; reason?: string } {
  if (!permissions) {
    return { allowed: true, reason: "User is not a dependent" };
  }

  switch (action) {
    case DependentAction.BOOK_LESSON:
      if (!permissions.bookings.canBookLessons) {
        return {
          allowed: false,
          reason: "User does not have permission to book lessons",
        };
      }
      return { allowed: true };
    case DependentAction.JOIN_EVENT:
      if (!permissions.bookings.canJoinEvents) {
        return {
          allowed: false,
          reason: "User does not have permission to join events",
        };
      }
      return { allowed: true };
    case DependentAction.CANCEL_BOOKING:
      if (!permissions.bookings.canCancel) {
        return {
          allowed: false,
          reason: "User does not have permission to cancel bookings",
        };
      }
      return { allowed: true };
    case DependentAction.REQUIRES_APPROVAL:
      if (!permissions.bookings.requiresApproval) {
        return {
          allowed: false,
          reason: "User does not have permission to require approval",
        };
      }
      return { allowed: true };
    case DependentAction.CAN_CANCEL:
      if (!permissions.bookings.canCancel) {
        return {
          allowed: false,
          reason: "User does not have permission to cancel bookings",
        };
      }
      return { allowed: true };
    case DependentAction.CAN_POST:
      if (!permissions.communication.canPost) {
        return {
          allowed: false,
          reason: "User does not have permission to post",
        };
      }
      return { allowed: true };
    case DependentAction.CAN_COMMENT:
      if (!permissions.communication.canComment) {
        return {
          allowed: false,
          reason: "User does not have permission to comment",
        };
      }
      return { allowed: true };
    case DependentAction.RECEIVE_EMAIL_NOTIFICATIONS:
      if (!permissions.communication.receiveEmailNotifications) {
        return {
          allowed: false,
          reason:
            "User does not have permission to receive email notifications",
        };
      }
      return { allowed: true };
    case DependentAction.RECEIVE_TEXT_NOTIFICATIONS:
      if (!permissions.communication.receiveTextNotifications) {
        return {
          allowed: false,
          reason: "User does not have permission to receive text notifications",
        };
      }
      return { allowed: true };
    case DependentAction.CAN_EDIT_PROFILE:
      if (!permissions.profile.canEdit) {
        return {
          allowed: false,
          reason: "User does not have permission to edit profile",
        };
      }
      return { allowed: true };
    default:
      return { allowed: false, reason: "Invalid action" };
  }
}

export function requiresApproval(
  action: DependentAction,
  permissions: GuardianPermissions
): boolean {
  if (
    action === DependentAction.BOOK_LESSON ||
    action === DependentAction.JOIN_EVENT
  ) {
    return permissions.bookings.requiresApproval;
  }
  return false;
}
