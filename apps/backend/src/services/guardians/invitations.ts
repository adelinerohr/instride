import type {
  GetGuardianInvitationResponse,
  GetPendingInvitationResponse,
  SendDependentInvitationResponse,
  SendDependentInvitationRequest,
} from "@instride/api/contracts";
import { GuardianRelationshipStatus, InvitationStatus } from "@instride/shared";
import { eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";
import { render } from "react-email";

import { authUsers } from "@/services/auth/schema";
import DependentInvitationEmail from "@/services/email/templates/dependent-invitation";
import { sendEmailTopic } from "@/services/email/topic";
import { authMembers, members } from "@/services/organizations/schema";
import { requireAuth, requireOrganizationAuth } from "@/shared/auth";
import { APP_NAME } from "@/shared/constants";
import { getBaseUrl } from "@/shared/utils/url";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";
import { guardianService } from "./guardian.service";
import {
  toGuardianInvitation,
  toGuardianInvitationWithContext,
} from "./mappers";
import { guardianInvitations, guardianRelationships } from "./schema";

const INVITATION_EXPIRY_DAYS = 14;

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

    const invitation = await guardianService.findPendingInvitationForEmail(
      user.email
    );

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
  async ({
    token,
  }: {
    token: string;
  }): Promise<GetGuardianInvitationResponse> => {
    const invitation = await guardianService.findInvitationByToken(token);
    assertExists(invitation, "Invitation not found");

    return { invitation: toGuardianInvitationWithContext(invitation) };
  }
);

export const sendInvitation = api(
  {
    method: "POST",
    path: "/guardians/:relationshipId/invitations",
    expose: true,
    auth: true,
  },
  async (
    request: SendDependentInvitationRequest
  ): Promise<SendDependentInvitationResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const relationship = await db.query.guardianRelationships.findFirst({
      where: { id: request.relationshipId, organizationId },
      with: {
        organization: true,
        guardian: { with: { authUser: true } },
        dependent: { with: { authUser: true } },
      },
    });

    assertExists(relationship, "Relationship not found");
    assertExists(relationship.organization, "Organization not found");
    assertExists(relationship.guardian, "Guardian not found");
    assertExists(relationship.guardian.authUser, "Guardian has no auth user");
    assertExists(relationship.dependent, "Dependent not found");
    assertExists(relationship.dependent.authUser, "Dependent has no auth user");

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    const invitation = await guardianService.upsertInvitation({
      relationshipId: request.relationshipId,
      email: request.email,
      token,
      expiresAt,
    });

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
      inviteLink: `${baseUrl}/invitation/${invitation.token}?type=guardian&email=${encodeURIComponent(request.email)}`,
    });

    const [html, text] = await Promise.all([
      render(component),
      render(component, { plainText: true }),
    ]);

    await sendEmailTopic.publish({
      to: request.email,
      subject: `${relationship.guardian.authUser.name} invited you to join ${relationship.organization.name} on ${APP_NAME}`,
      html,
      text,
    });

    return { invitation: toGuardianInvitation(invitation) };
  }
);

export const acceptInvitation = api(
  {
    method: "POST",
    path: "/guardians/invitations/:token/accept",
    expose: true,
    auth: true,
  },
  async ({ token }: { token: string }): Promise<void> => {
    const { userID } = requireAuth();

    const invitation = await guardianService.findInvitationScalar(token);
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
      throw APIError.permissionDenied("Email does not match invitation");
    }

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

      // Better Auth membership row
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

      // Drop the orphaned placeholder auth user (only if it isn't already
      // the current user — defensive, shouldn't happen)
      if (placeholderAuthUserId !== currentUser.id) {
        await tx
          .delete(authUsers)
          .where(eq(authUsers.id, placeholderAuthUserId));
      }
    });
  }
);
