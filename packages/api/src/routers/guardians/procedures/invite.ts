import { InvitationKind } from "@instride/db/enums";
import { ORPCError } from "@orpc/server";

import { assertCanManageDependent } from "../../../access/guardianship";
import { organizationProcedure } from "../../../procedures";
import { createInvitation } from "../../_shared/invitations";
import { InviteByEmailSchema } from "../schemas";

/**
 * Invite another adult (a co-parent, a grandparent) to become a guardian of
 * this dependent. They join the organization if they aren't a member yet.
 */
export const inviteGuardian = organizationProcedure
  .input(InviteByEmailSchema)
  .handler(async ({ input, context }) => {
    const { dependent } = await assertCanManageDependent(
      context.db,
      context.member,
      input.dependentMemberId
    );

    return await createInvitation(context.db, {
      organizationId: context.organization.id,
      kind: InvitationKind.GUARDIAN_LINK,
      email: input.email,
      dependentMemberId: dependent.id,
      invitedByUserId: context.user.id,
    });
  });

/**
 * Let a login-less dependent (e.g. a teenager) sign in themselves. Accepting
 * attaches their new account to the existing member, so their lessons and
 * guardians carry over. Guardians keep their controls afterwards.
 */
export const inviteDependentLogin = organizationProcedure
  .input(InviteByEmailSchema)
  .handler(async ({ input, context }) => {
    const { dependent } = await assertCanManageDependent(
      context.db,
      context.member,
      input.dependentMemberId
    );

    if (dependent.userId !== null) {
      throw new ORPCError("BAD_REQUEST", {
        message: "This member already has a login",
      });
    }

    return await createInvitation(context.db, {
      organizationId: context.organization.id,
      kind: InvitationKind.DEPENDENT_ACCOUNT,
      email: input.email,
      dependentMemberId: dependent.id,
      invitedByUserId: context.user.id,
    });
  });
