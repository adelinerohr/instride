import { Member } from "@instride/api/contracts";
import { MembershipRole } from "@instride/shared";
import { APIError } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { db } from "./db";

export async function assertAdmin(
  organizationId: string,
  userId: string
): Promise<void> {
  const member = await db.query.members.findFirst({
    where: {
      userId,
      organizationId,
    },
  });

  if (!member || !member.roles.includes(MembershipRole.ADMIN)) {
    throw APIError.permissionDenied("Admin access required");
  }
}

export async function assertAdminOrSelf(targetMemberId: string): Promise<void> {
  const { member: callerMember } = await organizations.getMember();

  if (callerMember.roles.includes(MembershipRole.ADMIN)) return;

  if (callerMember.id === targetMemberId) return;

  throw APIError.permissionDenied(
    "You are not authorized to access this profile"
  );
}

export async function requireOrganizationAdmin(
  organizationId: string
): Promise<Member> {
  const { member } = await organizations.getMember();

  if (member.organizationId !== organizationId) {
    throw APIError.permissionDenied(
      "You are not authorized for this organization"
    );
  }

  if (!member.roles.includes(MembershipRole.ADMIN)) {
    throw APIError.permissionDenied("Admin access required");
  }

  return member;
}

export async function requireAdminOrSelf(targetUserId: string): Promise<void> {
  const { member } = await organizations.getMember();

  if (member.roles.includes(MembershipRole.ADMIN)) return;

  if (member.id === targetUserId) return;

  throw APIError.permissionDenied(
    "You are not authorized to access this profile"
  );
}
