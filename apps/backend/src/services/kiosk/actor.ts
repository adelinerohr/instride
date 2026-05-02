import {
  KioskActionContext,
  KioskActor,
  KioskScope,
  MembershipRole,
} from "@instride/shared";
import { APIError } from "encore.dev/api";

import { verifyKioskPin } from "../organizations/members/pin";
import { kioskRepo } from "./kiosk.repo";
import { toKioskSession } from "./mappers";
import { assertActiveActing, assertKioskActionAllowed } from "./permissions";

interface ResolveKioskActorInput {
  sessionId: string;
  organizationId: string;
  /**
   * If provided, skip session acting state and authenticate this verification
   * inline ("one-shot" PIN-gated action). Does not write acting state to the
   * session.
   */
  verification?: { memberId: string; pin: string };
  context: KioskActionContext;
}

/**
 * Resolves the actor for a kiosk action. Two paths:
 *
 *   1. `verification` provided → verify PIN, derive scope, run permission
 *      check. Session acting state untouched.
 *   2. `verification` omitted → load session, require active acting state,
 *      run permission check using that state.
 *
 * Throws APIError on any failure (bad PIN, expired session, action denied).
 */

export async function resolveKioskActor(
  input: ResolveKioskActorInput
): Promise<KioskActor> {
  await kioskRepo.findOneScalar(input.sessionId, input.organizationId);

  if (input.verification) {
    const result = await verifyKioskPin({
      pin: input.verification.pin,
      organizationId: input.organizationId,
      memberId: input.verification.memberId,
    });

    if (!result.member.kioskPin) {
      throw APIError.failedPrecondition("Member has not set a PIN");
    }
    if (!result.ok) {
      throw APIError.unauthenticated("Invalid PIN");
    }

    const member = result.member;
    const isStaff =
      member.roles.includes(MembershipRole.ADMIN) ||
      member.roles.includes(MembershipRole.TRAINER);
    const scope = isStaff ? KioskScope.STAFF : KioskScope.SELF;

    await assertKioskActionAllowed({
      organizationId: input.organizationId,
      actingMemberId: member.id,
      scope,
      context: input.context,
    });

    return {
      memberId: member.id,
      scope,
    };
  }

  // No one-shot verification — fall back to active acting state.
  const session = await kioskRepo
    .findOne(input.sessionId, input.organizationId)
    .then(toKioskSession);
  const acting = {
    actingMemberId: session.actingMemberId,
    scope: session.scope,
    expiresAt: session.expiresAt,
  };
  assertActiveActing(acting);

  await assertKioskActionAllowed({
    organizationId: input.organizationId,
    actingMemberId: acting.actingMemberId,
    scope: acting.scope,
    context: input.context,
  });

  return { memberId: acting.actingMemberId, scope: acting.scope };
}
