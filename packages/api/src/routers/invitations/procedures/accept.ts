import type { Transaction } from "@instride/db";
import type { MembershipRole } from "@instride/db/enums";
import { InvitationKind, InvitationStatus } from "@instride/db/enums";
import { users } from "@instride/db/schema/auth";
import { invitations, members } from "@instride/db/schema/organizations";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";

import { linkGuardian } from "../../../access/guardianship";
import { protectedProcedure } from "../../../procedures";
import { ensureProfiles, mergeRoles } from "../../_shared/profiles";
import { InvitationTokenSchema } from "../schemas";

type Invitation = typeof invitations.$inferSelect;
type Member = typeof members.$inferSelect;
interface Caller {
  id: string;
  email: string;
}

/**
 * Signed-in user accepts an invitation sent to their email. What happens
 * depends on the kind (see InvitationKind).
 */
export const accept = protectedProcedure
  .input(InvitationTokenSchema)
  .handler(async ({ input, context }) => {
    const invitation = await context.db.query.invitations.findFirst({
      where: { token: input.token },
    });

    if (!invitation || invitation.status !== InvitationStatus.PENDING) {
      throw new ORPCError("NOT_FOUND", {
        message: "This invitation is no longer valid",
      });
    }
    if (invitation.expiresAt < new Date()) {
      throw new ORPCError("BAD_REQUEST", {
        message: "This invitation has expired",
      });
    }
    if (invitation.email !== context.user.email.toLowerCase()) {
      throw new ORPCError("FORBIDDEN", {
        message: `This invitation was sent to ${invitation.email}`,
      });
    }

    return await context.db.transaction(async (tx) => {
      const member = await applyInvitation(tx, invitation, context.user);

      await tx
        .update(invitations)
        .set({ status: InvitationStatus.ACCEPTED, acceptedAt: new Date() })
        .where(eq(invitations.id, invitation.id));

      return { kind: invitation.kind, member };
    });
  });

async function applyInvitation(
  tx: Transaction,
  invitation: Invitation,
  caller: Caller
): Promise<Member> {
  switch (invitation.kind) {
    case InvitationKind.MEMBER:
      return await joinOrganization(
        tx,
        invitation.organizationId,
        caller.id,
        invitation.roles
      );

    case InvitationKind.GUARDIAN_LINK: {
      const dependentMemberId = requireDependentId(invitation);
      const member = await joinOrganization(
        tx,
        invitation.organizationId,
        caller.id,
        []
      );
      await linkGuardian(tx, {
        organizationId: invitation.organizationId,
        guardianMemberId: member.id,
        dependentMemberId,
      });
      return member;
    }

    case InvitationKind.DEPENDENT_ACCOUNT:
      return await attachLoginToDependent(tx, invitation, caller);

    default: {
      const exhaustive: never = invitation.kind;
      throw new ORPCError("BAD_REQUEST", {
        message: `Unknown invitation kind ${String(exhaustive)}`,
      });
    }
  }
}

function requireDependentId(invitation: Invitation): string {
  if (!invitation.dependentMemberId) {
    throw new ORPCError("BAD_REQUEST", {
      message: "This invitation is missing its dependent",
    });
  }
  return invitation.dependentMemberId;
}

/** Create the caller's membership, or merge roles into (and restore) an existing one. */
async function joinOrganization(
  tx: Transaction,
  organizationId: string,
  userId: string,
  roles: MembershipRole[]
): Promise<Member> {
  const existing = await tx.query.members.findFirst({
    where: { organizationId, userId },
  });

  const [member] = existing
    ? await tx
        .update(members)
        .set({
          roles: mergeRoles(existing.deletedAt ? [] : existing.roles, roles),
          deletedAt: null,
        })
        .where(eq(members.id, existing.id))
        .returning()
    : await tx
        .insert(members)
        .values({ organizationId, userId, roles })
        .returning();

  if (!member) {
    throw new ORPCError("INTERNAL_SERVER_ERROR");
  }
  await ensureProfiles(tx, member);
  return member;
}

/**
 * Give a login-less dependent their own account: put the caller's user id on
 * the existing member row so lessons, history and guardians carry over.
 * Their name and date of birth move to the account.
 */
async function attachLoginToDependent(
  tx: Transaction,
  invitation: Invitation,
  caller: Caller
): Promise<Member> {
  const dependent = await tx.query.members.findFirst({
    where: {
      id: requireDependentId(invitation),
      organizationId: invitation.organizationId,
      deletedAt: { isNull: true },
    },
  });
  if (!dependent) {
    throw new ORPCError("NOT_FOUND", {
      message: "This dependent no longer exists",
    });
  }
  if (dependent.userId !== null) {
    throw new ORPCError("CONFLICT", {
      message: "This member already has a login",
    });
  }

  const alreadyMember = await tx.query.members.findFirst({
    where: { organizationId: invitation.organizationId, userId: caller.id },
    columns: { id: true },
  });
  if (alreadyMember) {
    throw new ORPCError("CONFLICT", {
      message:
        "This account is already a member of this barn. Use a different account, or ask an admin to merge the profiles.",
    });
  }

  const account = await tx.query.users.findFirst({
    where: { id: caller.id },
    columns: { dateOfBirth: true },
  });
  if (!account?.dateOfBirth && dependent.dateOfBirth) {
    await tx
      .update(users)
      .set({ dateOfBirth: dependent.dateOfBirth })
      .where(eq(users.id, caller.id));
  }

  const [member] = await tx
    .update(members)
    .set({ userId: caller.id, name: null, dateOfBirth: null })
    .where(eq(members.id, dependent.id))
    .returning();
  if (!member) {
    throw new ORPCError("INTERNAL_SERVER_ERROR");
  }
  return member;
}
