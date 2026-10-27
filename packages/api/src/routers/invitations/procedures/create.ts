import { randomBytes } from "node:crypto";

import { MembershipRole } from "@instride/db/enums";
import { invitations } from "@instride/db/schema/organizations";

import { roleProcedure } from "../../../procedures";
import { CreateInvitationSchema } from "../schemas";

const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
const TOKEN_BYTES = 24;

/**
 * Invite someone by email. Returns the invitation, including the token for the link.
 * TODO: send the email once the accept-invite route exists on web and native.
 */
export const create = roleProcedure(MembershipRole.ADMIN)
  .input(CreateInvitationSchema)
  .handler(async ({ input, context }) => {
    const [invitation] = await context.db
      .insert(invitations)
      .values({
        organizationId: context.organization.id,
        email: input.email,
        roles: input.roles,
        token: randomBytes(TOKEN_BYTES).toString("base64url"),
        invitedByUserId: context.user.id,
        expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      })
      .returning();
    return invitation;
  });
