import { randomBytes } from "node:crypto";

import type { Database, Transaction } from "@instride/db";
import type { InvitationKind, MembershipRole } from "@instride/db/enums";
import { invitations } from "@instride/db/schema/organizations";
import { ORPCError } from "@orpc/server";

const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
const TOKEN_BYTES = 24;

/**
 * Insert an invitation of any kind. Returns the row, including the token for
 * the link. TODO: send the email once the accept-invite screens exist.
 */
export async function createInvitation(
  db: Database | Transaction,
  input: {
    organizationId: string;
    kind: InvitationKind;
    email: string;
    roles?: MembershipRole[];
    dependentMemberId?: string;
    invitedByUserId: string;
  }
) {
  const [invitation] = await db
    .insert(invitations)
    .values({
      organizationId: input.organizationId,
      kind: input.kind,
      email: input.email.trim().toLowerCase(),
      roles: input.roles ?? [],
      dependentMemberId: input.dependentMemberId ?? null,
      token: randomBytes(TOKEN_BYTES).toString("base64url"),
      invitedByUserId: input.invitedByUserId,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    })
    .returning();

  if (!invitation) {
    throw new ORPCError("INTERNAL_SERVER_ERROR");
  }
  return invitation;
}
