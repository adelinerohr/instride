// apps/web/src/features/kiosk/hooks/use-pin-auth.ts
import { type Member, type Rider } from "@instride/api";
import { KioskScope, type KioskActionContext } from "@instride/shared";
import * as React from "react";
import { toast } from "sonner";

import {
  PinAuthModal,
  type PinAuthModalPayload,
} from "../components/modals/pin-auth/modal";
import { RiderSelectModal } from "../components/modals/rider-select";
import { useKiosk } from "./use-kiosk";

export interface PinAuthResult {
  member: Member;
  riderOptions: Rider[];
  /**
   * Verification used during the PIN flow. Pass to action mutations within
   * the same logical flow. Undefined when the actor is already in an active
   * acting session (mutations fall back to session acting state).
   */
  verification: { memberId: string; pin: string } | undefined;
}

export interface PinAuthWithRiderResult {
  member: Member;
  rider: Rider;
  verification: { memberId: string; pin: string } | undefined;
}

export interface RequestPinAuthInput {
  context: KioskActionContext;
  preselectedMemberId?: string;
  title?: string;
  description?: string;
  deniedMessage?: string;
  onAuthorized: (result: PinAuthResult) => void;
  /**
   * Called when acting state is active and the action is denied client-side
   * (so no PIN dialog opens, just an alert).
   */
  onDeniedWhileActing?: (reason: string) => void;
}

export interface RequestPinAuthAndRiderInput extends Omit<
  RequestPinAuthInput,
  "onAuthorized"
> {
  /**
   * Client-side filter on rider options. Use this to enforce action-specific
   * permission rules (e.g., for ENROLL, filter out riders already enrolled
   * in the lesson).
   */
  filterRiderOptions?: (options: Rider[], member: Member) => Rider[];
  riderSelectTitle?: string;
  riderSelectDescription?: string;
  noRidersMessage?: string;
  onAuthorized: (result: PinAuthWithRiderResult) => void;
}

/**
 * Imperative entry point for PIN-gated actions.
 *
 *   - DEFAULT scope: opens the PIN dialog.
 *   - Active acting scope: short-circuits — uses cached client-side
 *     permissions and the cached acting member's rider options.
 */
export function usePinAuth() {
  const { acting, permissions, actingMember, actingRiderOptions } = useKiosk();
  const pinAuthModal = PinAuthModal.useModal();
  const riderSelectModal = RiderSelectModal.useModal();

  const request = React.useCallback(
    (input: RequestPinAuthInput) => {
      if (acting.scope !== KioskScope.DEFAULT) {
        // Acting member data may not be loaded yet on first paint — treat
        // as transient and bail rather than denying. The user can click
        // again once the queries settle.
        if (!actingMember) return;

        const allowed = isActionAllowedClientSide(input.context, permissions);
        if (allowed) {
          input.onAuthorized({
            member: actingMember,
            riderOptions: actingRiderOptions,
            verification: undefined,
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
    [acting.scope, permissions, actingMember, actingRiderOptions, pinAuthModal]
  );

  const requestWithRider = React.useCallback(
    (input: RequestPinAuthAndRiderInput) => {
      request({
        context: input.context,
        preselectedMemberId: input.preselectedMemberId,
        title: input.title,
        description: input.description,
        deniedMessage: input.deniedMessage,
        onDeniedWhileActing: input.onDeniedWhileActing,
        onAuthorized: ({ member, riderOptions, verification }) => {
          const filtered =
            input.filterRiderOptions?.(riderOptions, member) ?? riderOptions;

          if (filtered.length === 0) {
            toast.error(
              input.noRidersMessage ??
                "No eligible riders to perform this action"
            );
            return;
          }

          if (filtered.length === 1) {
            input.onAuthorized({
              member,
              rider: filtered[0],
              verification,
            });
            return;
          }

          riderSelectModal.open({
            title: input.riderSelectTitle,
            description: input.riderSelectDescription,
            riderOptions: filtered,
            onSelected: (rider) =>
              input.onAuthorized({ member, rider, verification }),
          });
        },
      });
    },
    [request, riderSelectModal]
  );

  return { request, requestWithRider };
}

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
