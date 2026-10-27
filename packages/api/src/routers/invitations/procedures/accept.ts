import { InvitationStatus } from "@instride/db/enums";
import { invitations, members } from "@instride/db/schema/organizations";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";

import { protectedProcedure } from "../../../procedures";
import { ensureProfiles, mergeRoles } from "../../_shared/profiles";
import { InvitationTokenSchema } from "../schemas";

/** Signed-in user accepts an invitation sent to their email. */
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
      const existing = await tx.query.members.findFirst({
        where: {
          organizationId: invitation.organizationId,
          userId: context.user.id,
        },
      });

      const [member] = existing
        ? await tx
            .update(members)
            .set({
              roles: mergeRoles(
                existing.deletedAt ? [] : existing.roles,
                invitation.roles
              ),
              deletedAt: null,
            })
            .where(eq(members.id, existing.id))
            .returning()
        : await tx
            .insert(members)
            .values({
              organizationId: invitation.organizationId,
              userId: context.user.id,
              roles: invitation.roles,
            })
            .returning();

      if (!member) {
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }

      await ensureProfiles(tx, member);
      await tx
        .update(invitations)
        .set({ status: InvitationStatus.ACCEPTED, acceptedAt: new Date() })
        .where(eq(invitations.id, invitation.id));

      return member;
    });
  });
