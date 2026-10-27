import { ORPCError } from "@orpc/server";

import { publicProcedure } from "../../../procedures";
import { displayName } from "../../_shared/members";
import { InvitationTokenSchema } from "../schemas";

/**
 * Public: lets the invite page say "Join Redcoat Farm", "Become Lily's
 * guardian at Redcoat Farm" or "Set up Lily's login" before sign-in.
 */
export const byToken = publicProcedure
  .input(InvitationTokenSchema)
  .handler(async ({ input, context }) => {
    const invitation = await context.db.query.invitations.findFirst({
      where: { token: input.token },
      columns: {
        kind: true,
        email: true,
        roles: true,
        status: true,
        expiresAt: true,
      },
      with: {
        organization: {
          columns: { id: true, name: true, slug: true, logoUrl: true },
        },
        dependent: {
          columns: { id: true, name: true },
          with: { user: { columns: { name: true } } },
        },
      },
    });
    if (!invitation) {
      throw new ORPCError("NOT_FOUND", { message: "Invitation not found" });
    }

    const { dependent, ...rest } = invitation;
    return {
      ...rest,
      dependent: dependent
        ? { id: dependent.id, name: displayName(dependent) }
        : null,
    };
  });
