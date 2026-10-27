import { ORPCError } from "@orpc/server";

import { publicProcedure } from "../../../procedures";
import { InvitationTokenSchema } from "../schemas";

/** Public: lets the invite page show "Join Redcoat Farm" before sign-in. */
export const byToken = publicProcedure
  .input(InvitationTokenSchema)
  .handler(async ({ input, context }) => {
    const invitation = await context.db.query.invitations.findFirst({
      where: { token: input.token },
      columns: { email: true, roles: true, status: true, expiresAt: true },
      with: {
        organization: {
          columns: { id: true, name: true, slug: true, logoUrl: true },
        },
      },
    });
    if (!invitation) {
      throw new ORPCError("NOT_FOUND", { message: "Invitation not found" });
    }
    return invitation;
  });
