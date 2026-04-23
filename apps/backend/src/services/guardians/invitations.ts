import { GuardianRelationshipStatus, InvitationStatus } from "@instride/shared";
import { eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";
import { render } from "react-email";

import { requireAuth, requireOrganizationAuth } from "@/shared/auth";
import { APP_NAME } from "@/shared/constants";
import { memberFragment } from "@/shared/utils/fragments";
import { getBaseUrl } from "@/shared/utils/url";
import { assertExists, assertMember } from "@/shared/utils/validation";

import { authUsers } from "../auth/schema";
import DependentInvitationEmail from "../email/templates/dependent-invitation";
import { sendEmailTopic } from "../email/topic";
import { authMembers, members } from "../organizations/schema";
import { db } from "./db";
import { guardianInvitations, guardianRelationships } from "./schema";
import { GuardianInvitation } from "./types/models";

interface GetPendingInvitationResponse {
  invitation: { token: string; organizationSlug: string } | null;
}

export const getPendingInvitation = api(
  {
    method: "GET",
    path: "/guardians/invitations/me/pending",
    expose: true,
    auth: true,
  },
  async (): Promise<GetPendingInvitationResponse> => {
    const { userID } = requireAuth();

    const user = await db.query.authUsers.findFirst({ where: { id: userID } });
    if (!user) return { invitation: null };

    const invitation = await db.query.guardianInvitations.findFirst({
      where: {
        email: user.email,
        status: InvitationStatus.PENDING,
      },
      with: {
        relationship: {
          with: { organization: true },
        },
      },
    });

    if (!invitation || !invitation.relationship?.organization) {
      return { invitation: null };
    }

    return {
      invitation: {
        token: invitation.token,
        organizationSlug: invitation.relationship.organization.slug,
      },
    };
  }
);

export const getInvitationByToken = api(
  {
    method: "GET",
    path: "/guardians/invitations/:token",
    expose: true,
    auth: true,
  },
  async (params: { token: string }): Promise<GuardianInvitation> => {
    const { token } = params;

    const invitation = await db.query.guardianInvitations.findFirst({
      where: { token },
      with: {
        relationship: {
          with: {
            organization: true,
            dependent: memberFragment,
            guardian: memberFragment,
          },
        },
      },
    });

    assertExists(invitation, "Invitation not found");
    assertExists(invitation.relationship, "Relationship not found");
    assertExists(
      invitation.relationship.organization,
      "Organization not found"
    );
    assertMember(invitation.relationship.dependent, "Dependent not found");
    assertMember(invitation.relationship.guardian, "Guardian not found");

    return {
      ...invitation,
      expiresAt: invitation.expiresAt.toISOString(),
      guardianName: invitation.relationship.guardian.authUser.name,
      guardianEmail: invitation.relationship.guardian.authUser.email,
      dependentName: invitation.relationship.dependent.authUser.name,
      organizationName: invitation.relationship.organization.name,
      organizationSlug: invitation.relationship.organization.slug,
    };
  }
);

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
        organization: true,
        dependent: memberFragment,
        guardian: memberFragment,
      },
    });

    assertExists(relationship, "Relationship not found");
    assertExists(relationship.organization, "Organization not found");
    assertMember(relationship.dependent, "Dependent not found");
    assertMember(relationship.guardian, "Guardian not found");

    // Note: the placeholder auth user's email is NOT changed here.
    // The placeholder stays disposable — it gets deleted when the
    // real dependent user accepts the invitation.

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
          status: InvitationStatus.PENDING,
        },
      })
      .returning();

    const baseUrl = getBaseUrl({
      type: "web",
      organizationSlug: relationship.organization.slug,
    });

    const component = DependentInvitationEmail({
      appName: APP_NAME,
      guardianName: relationship.guardian.authUser.name,
      guardianEmail: relationship.guardian.authUser.email,
      dependentName: relationship.dependent.authUser.name,
      organizationName: relationship.organization.name,
      inviteLink: `${baseUrl}/invitation/${invitation.token}?type=guardian&email=${encodeURIComponent(params.email)}`,
    });

    const [html, text] = await Promise.all([
      render(component),
      render(component, { plainText: true }),
    ]);

    await sendEmailTopic.publish({
      to: params.email,
      subject: `${relationship.guardian.authUser.name} invited you to join ${relationship.organization.name} on ${APP_NAME}`,
      html,
      text,
    });

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

    const currentUser = await db.query.authUsers.findFirst({
      where: { id: userID },
    });
    assertExists(currentUser, "User not found");

    if (currentUser.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw APIError.permissionDenied("Email doesn't match invitation");
    }

    // The placeholder member currently points at a placeholder auth user.
    // Relink it to the currently-authenticated user, then clean up the
    // orphaned placeholder auth row.
    const placeholderMember = await db.query.members.findFirst({
      where: { id: invitation.relationship.dependentMemberId },
    });
    assertExists(placeholderMember, "Placeholder member not found");

    const placeholderAuthUserId = placeholderMember.userId;

    await db.transaction(async (tx) => {
      // Relink member to the real user
      await tx
        .update(members)
        .set({
          userId: currentUser.id,
          isPlaceholder: false,
          onboardingComplete: true,
        })
        .where(eq(members.id, placeholderMember.id));

      // Also relink the Better Auth membership row (authMembers) so the
      // org plugin sees the current user as a member of this org
      await tx
        .update(authMembers)
        .set({ userId: currentUser.id })
        .where(eq(authMembers.id, placeholderMember.authMemberId));

      await tx
        .update(guardianInvitations)
        .set({
          status: InvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
        })
        .where(eq(guardianInvitations.id, invitation.id));

      await tx
        .update(guardianRelationships)
        .set({ status: GuardianRelationshipStatus.ACTIVE })
        .where(eq(guardianRelationships.id, invitation.relationship!.id));

      // Delete the now-orphaned placeholder auth user.
      // Only safe if the placeholder wasn't linked to anything else.
      if (placeholderAuthUserId !== currentUser.id) {
        await tx
          .delete(authUsers)
          .where(eq(authUsers.id, placeholderAuthUserId));
      }
    });
  }
);
