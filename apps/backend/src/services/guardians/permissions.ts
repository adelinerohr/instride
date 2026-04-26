import type { Member } from "@instride/api/contracts";
import {
  canDependentPerform,
  DependentAction,
  requiresApproval,
} from "@instride/shared";
import { APIError } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { memberService } from "../organizations/members/member.service";
import { guardianService } from "./guardian.service";

export async function requireGuardianPermissions(input: {
  targetMemberId: string;
  action: DependentAction;
}): Promise<{
  actingMember: Member;
  targetMember: Member;
  requiresApproval: boolean;
}> {
  const { organizationId, userID } = requireOrganizationAuth();

  const actingMember = await memberService.findOneByUser(
    userID,
    organizationId
  );
  const targetMember = await memberService.findOne(
    input.targetMemberId,
    organizationId
  );

  // Acting on self (and not a restricted account) is always allowed
  if (
    actingMember.id === targetMember.id &&
    !actingMember.rider?.isRestricted
  ) {
    return { actingMember, targetMember, requiresApproval: false };
  }

  const relationship = await guardianService.findRelationshipBetween({
    guardianMemberId: actingMember.id,
    dependentMemberId: targetMember.id,
    organizationId,
  });

  if (!relationship) {
    throw APIError.permissionDenied("You are not a guardian of this user");
  }

  const check = canDependentPerform(input.action, relationship.permissions);
  if (!check.allowed) {
    throw APIError.permissionDenied(
      check.reason ?? "Not permitted to perform this action"
    );
  }

  return {
    actingMember,
    targetMember,
    requiresApproval: requiresApproval(input.action, relationship.permissions),
  };
}
