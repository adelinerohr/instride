import { GuardianRelationshipStatus, InvitationStatus } from "@instride/shared";
import { eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";

import { requireAuth, requireOrganizationAuth } from "@/shared/auth";
import { memberFragment } from "@/shared/utils/fragments";
import { assertExists, assertMember } from "@/shared/utils/validation";

import { auth } from "../auth/auth";
import { members } from "../organizations/schema";
import { db } from "./db";
import { guardianInvitations, guardianRelationships } from "./schema";

interface SendInvitationParams {
  relationshipId: string;
  email: string;
}

export const sendInvitation = api(
  {
    method: "POST",
    path: "/guardians/:relationshipId/invitations",
    expose: true,
    auth: true,
  },
  async (params: SendInvitationParams) => {
    const { organizationId } = requireOrganizationAuth();

    const relationship = await db.query.guardianRelationships.findFirst({
      where: {
        id: params.relationshipId,
        organizationId,
      },
      with: {
        dependent: memberFragment,
        guardian: memberFragment,
      },
    });

    assertExists(relationship, "Relationship not found");
    assertMember(relationship.dependent, "Dependent not found");
    assertMember(relationship.guardian, "Guardian not found");

    // Update dependent's email if it's different from placeholder
    const currentEmail = relationship.dependent.authUser.email;
    const isPlaceholderEmail = currentEmail.endsWith(
      "@placeholder.instride.local"
    );

    if (isPlaceholderEmail) {
      await auth.api.changeEmail({
        query: {
          id: relationship.dependent.authUser.id,
        },
        body: {
          newEmail: params.email,
        },
      });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const [invitation] = await db
      .insert(guardianInvitations)
      .values({
        relationshipId: params.relationshipId,
        email: params.email,
        token,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: [guardianInvitations.relationshipId, guardianInvitations.email],
        set: {
          token,
          expiresAt,
        },
      })
      .returning();

    // TODO: Send invitation email
    return invitation;
  }
);

export const acceptInvitation = api(
  {
    method: "POST",
    path: "/guardians/invitations/:token/accept",
    expose: true,
    auth: true,
  },
  async (params: { token: string }) => {
    const { userID } = requireAuth();

    // 1. Find the invitation by token
    const invitation = await db.query.guardianInvitations.findFirst({
      where: {
        token: params.token,
        relationship: true,
      },
      with: {
        relationship: true,
      },
    });

    assertExists(invitation, "Invitation not found");
    assertExists(invitation.relationship, "Relationship not found");

    if (invitation.status !== InvitationStatus.PENDING) {
      throw APIError.permissionDenied("Invitation already processed");
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      throw APIError.permissionDenied("Invitation expired");
    }

    // 2. Verify email matches
    const user = await db.query.authUsers.findFirst({
      where: {
        id: userID,
      },
    });

    if (!user || user.email !== invitation.email) {
      throw APIError.permissionDenied("Email doesn't match invitation");
    }

    // 3. Update member to link to this user
    await db
      .update(members)
      .set({
        userId: user.id,
      })
      .where(eq(members.id, invitation.relationship.dependentMemberId));

    // 4. Update invitation status
    await db
      .update(guardianInvitations)
      .set({
        status: InvitationStatus.ACCEPTED,
        acceptedAt: new Date(),
      })
      .where(eq(guardianInvitations.id, invitation.id));

    // 5. Update relationship status
    await db
      .update(guardianRelationships)
      .set({
        status: GuardianRelationshipStatus.ACTIVE,
      })
      .where(eq(guardianRelationships.id, invitation.relationship?.id));
  }
);
