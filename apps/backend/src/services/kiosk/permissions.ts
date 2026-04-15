import { APIError } from "encore.dev/api";

import { KioskAction, KioskScope } from "./types/models";

export function assertKioskActionAllowed(input: {
  action: KioskAction;
  actingMemberId: string;
  scope: KioskScope;
  targetMemberId: string;
}) {
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

    const staffOnlyActions = [
      KioskAction.LESSON_EDIT,
      KioskAction.TIME_BLOCK_CREATE,
      KioskAction.TIME_BLOCK_EDIT,
    ];

    if (staffOnlyActions.includes(input.action)) {
      throw APIError.permissionDenied("Only staff can perform this action");
    }
  }

  if (input.scope === KioskScope.STAFF) {
    // Staff can act for anyone
    return;
  }
}
