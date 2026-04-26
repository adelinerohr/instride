import { KioskAction, KioskScope } from "@instride/shared";
import { APIError } from "encore.dev/api";

const STAFF_ONLY_ACTIONS = new Set<KioskAction>([
  KioskAction.LESSON_EDIT,
  KioskAction.TIME_BLOCK_CREATE,
  KioskAction.TIME_BLOCK_EDIT,
]);

export function assertKioskActionAllowed(input: {
  action: KioskAction;
  actingMemberId: string;
  scope: KioskScope;
  targetMemberId: string;
}): void {
  if (input.scope === KioskScope.DEFAULT) {
    throw APIError.permissionDenied(
      "You must select yourself or verify staff access to perform actions"
    );
  }

  if (input.scope === KioskScope.SELF) {
    if (input.targetMemberId !== input.actingMemberId) {
      throw APIError.permissionDenied(
        "You can only perform actions for yourself in self-service mode"
      );
    }
    if (STAFF_ONLY_ACTIONS.has(input.action)) {
      throw APIError.permissionDenied("Only staff can perform this action");
    }
    return;
  }

  // STAFF can act for anyone — no further checks.
  // (Branch left explicit for readers; an unknown scope falls through
  // to the noop below, which is fine since we asserted DEFAULT above.)
}

/**
 * Common helper: validate an active acting identity exists and isn't expired.
 * Centralizes the check so all kiosk endpoints behave consistently.
 */
export interface ActiveActingState {
  actingMemberId: string;
  scope: KioskScope;
  expiresAt: Date | string;
}

export function assertActiveActing(acting: {
  actingMemberId: string | null;
  scope: KioskScope;
  expiresAt: Date | string | null;
}): asserts acting is ActiveActingState {
  if (!acting.actingMemberId || acting.scope === KioskScope.DEFAULT) {
    throw APIError.permissionDenied("No active kiosk session");
  }
  if (!acting.expiresAt || new Date(acting.expiresAt).getTime() < Date.now()) {
    throw APIError.permissionDenied("Kiosk session expired");
  }
}
