import {
  canDependentPerform,
  DependentAction,
  requiresApproval,
} from "@instride/shared";
import { APIError } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";

import { Member } from "../organizations/types/models";
import { db } from "./db";

export async function requireGuardianPermissions(input: {
  targetMemberId: string;
  action: DependentAction;
}): Promise<{
  actingMember: Member;
  targetMember: Member;
  requiresApproval: boolean;
}> {
  const { organizationId } = requireOrganizationAuth();

  const { member: actingMember } = await organizations.getMember();
  const { member: targetMember } = await organizations.getMemberById({
    memberId: input.targetMemberId,
  });

  // Acting on self - not a dependent (restricted account), always allowed
  if (
    actingMember.id === targetMember.id &&
    !actingMember.rider?.isRestricted
  ) {
    return {
      actingMember,
      targetMember,
      requiresApproval: false,
    };
  }

  // Acting on another user - check guardianship
  const relationship = await db.query.guardianRelationships.findFirst({
    where: {
      organizationId,
      dependentMemberId: targetMember.id,
      guardianMemberId: actingMember.id,
    },
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
