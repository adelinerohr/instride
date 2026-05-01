import { type Member, type Rider } from "@instride/api";
import { KioskScope, type KioskActionContext } from "@instride/shared";
import * as React from "react";

import {
  PinAuthModal,
  type PinAuthModalPayload,
} from "../components/modals/pin-auth/modal";
import { useKiosk } from "./use-kiosk";

export interface RequestPinAuthInput {
  context: KioskActionContext;
  preselectedMemberId?: string;
  title?: string;
  description?: string;
  deniedMessage?: string;
  onAuthorized: (result: { member: Member; riderOptions: Rider[] }) => void;
  /**
   * Called when acting state is active and the action is denied client-side
   * (so no PIN dialog opens, just an alert). Defaults to a toast with
   * `deniedMessage` or a generic message.
   */
  onDeniedWhileActing?: (reason: string) => void;
}

/**
 * Imperative entry point for PIN-gated actions.
 *
 * - In default scope: opens the PIN dialog.
 * - In acting scope: short-circuits — checks permissions client-side from
 *   `useKiosk().permissions` and either calls `onAuthorized` immediately
 *   (with the acting member) or fires `onDeniedWhileActing`.
 */
export function usePinAuth() {
  const { acting, permissions, actingMember } = useKiosk();
  const pinAuthModal = PinAuthModal.useModal();

  const request = React.useCallback(
    (input: RequestPinAuthInput) => {
      if (acting.scope !== KioskScope.DEFAULT) {
        const allowed = isActionAllowedClientSide(input.context, permissions);
        if (allowed && actingMember) {
          // Acting state short-circuit. We don't have riderOptions cached
          // here — for the actions that need them, the acting member is
          // implicitly the only relevant rider (self-scope), or a separate
          // picker could be added later. For now, return the acting
          // member's own rider as the sole option if present.
          const ownRider = actingMember.rider ? [actingMember.rider] : [];
          input.onAuthorized({
            member: actingMember,
            riderOptions: ownRider,
          });
        } else {
          const reason =
            input.deniedMessage ?? "You are not allowed to perform this action";
          input.onDeniedWhileActing?.(reason);
        }
        return;
      }

      const payload: PinAuthModalPayload = {
        context: input.context,
        preselectedMemberId: input.preselectedMemberId,
        title: input.title,
        description: input.description,
        deniedMessage: input.deniedMessage,
        onAuthorized: input.onAuthorized,
      };
      pinAuthModal.open(payload);
    },
    [acting.scope, permissions, actingMember]
  );

  return { request };
}

/** Map a permission context to the appropriate `KioskPermissionSet` flag. */
function isActionAllowedClientSide(
  context: KioskActionContext,
  permissions: ReturnType<typeof useKiosk>["permissions"]
): boolean {
  switch (context.action) {
    case "enroll":
      return permissions.canEnroll;
    case "unenroll":
      return permissions.canUnenroll;
    case "lesson_create":
      return permissions.canCreateLesson;
    case "lesson_edit":
      return permissions.canEditLesson;
    case "lesson_cancel":
      return permissions.canCancelLesson;
    case "time_block_create":
      return permissions.canCreateTimeBlock;
    case "time_block_edit":
      return permissions.canEditTimeBlock;
    case "lesson_check_in":
    case "mark_attendance":
      return false; // out of scope right now
    default: {
      const _exhaustive: never = context;
      return false;
    }
  }
}
