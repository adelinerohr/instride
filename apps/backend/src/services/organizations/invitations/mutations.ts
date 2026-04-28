import {
  AcceptInvitationRequest,
  RejectInvitationRequest,
  SendInvitationRequest,
} from "@instride/api/contracts";
import { InvitationStatus } from "@instride/shared";
import { generateId } from "better-auth";
import { api, APIError } from "encore.dev/api";
import { render } from "react-email";

import { authService, createAuthService } from "@/services/auth/auth.service";
import { assertAdmin } from "@/services/auth/gates";
import { OrganizationInvitationEmail } from "@/services/email/templates";
import { sendEmailTopic } from "@/services/email/topic";
import { requireAuth } from "@/shared/auth";
import { APP_NAME } from "@/shared/constants";
import { getBaseUrl } from "@/shared/utils/url";

import { db } from "../db";
import { organizationRepo } from "../organization.repo";
import {
  createInvitationService,
  invitationService,
} from "./invitation.service";

export const sendInvitation = api(
  {
    method: "POST",
    path: "/organizations/:organizationId/invitations",
    auth: true,
    expose: true,
  },
  async (request: SendInvitationRequest): Promise<void> => {
    const { userID } = requireAuth();

    if (request.roles.length === 0) {
      throw APIError.invalidArgument("At least one role required");
    }

    // Block "admin"-as-self-elevation? No — assertAdmin already verifies
    // caller is admin in this org, and admins can grant any role.

    const organization = await organizationRepo.findOne(request.organizationId);

    await assertAdmin(organization.id, userID);

    const inviter = await authService.findOneUser(userID);

    const invitation = await invitationService.upsertPending({
      organizationId: organization.authOrganizationId,
      email: request.email,
      roles: request.roles,
      inviterId: userID,
    });

    const baseUrl = getBaseUrl({
      type: "web",
      organizationSlug: organization.slug,
    });
    const inviteLink = `${baseUrl}/invitation/${invitation.id}?type=organization`;

    const component = OrganizationInvitationEmail({
      appName: APP_NAME,
      invitedByName: inviter.name,
      invitedByEmail: inviter.email,
      organizationName: organization.name,
      inviteLink,
    });

    const [html, text] = await Promise.all([
      render(component),
      render(component, { plainText: true }),
    ]);

    await sendEmailTopic.publish({
      to: request.email,
      subject: `${inviter.name} invited you to join ${organization.name} on ${APP_NAME}`,
      html,
      text,
    });
  }
);

export const acceptInvitation = api(
  {
    method: "POST",
    path: "/invitations/:id/accept",
    auth: true,
    expose: true,
  },
  async ({ id }: AcceptInvitationRequest): Promise<void> => {
    const { userID } = requireAuth();

    const user = await authService.findOneUser(userID);

    const invitation = await invitationService.findOne(id);

    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      throw APIError.permissionDenied("This invitation is not for you");
    }
    if (invitation.status !== InvitationStatus.PENDING) {
      throw APIError.failedPrecondition(
        `Invitation already ${invitation.status}`
      );
    }
    if (invitation.expiresAt < new Date()) {
      // Mark as cancelled so it stops appearing as pending.
      await invitationService.updateStatus(
        invitation.id,
        InvitationStatus.CANCELLED
      );
      throw APIError.failedPrecondition("Invitation expired");
    }

    // Create the authMembers row with the comma-separated convention your
    // codebase uses elsewhere. The local `members` row is created later
    // by onboardMember (or, for users who already have one in another
    // capacity, doesn't apply here — they shouldn't have an invitation).
    await db.transaction(async (tx) => {
      const txAuthService = createAuthService(tx);
      const txInvitationService = createInvitationService(tx);

      const existing = await txAuthService.findOneMember(
        userID,
        invitation.organizationId
      );

      if (existing) {
        // User somehow already has membership — defensive: union roles and
        // mark invitation accepted. This shouldn't happen in normal flow
        // because the wizard would have completed already.
        const existingRoles = new Set(
          existing.role.split(",").map((r) => r.trim())
        );
        invitation.roles.forEach((r) => existingRoles.add(r));
        await txAuthService.updateMember(existing.id, {
          role: [...existingRoles].join(","),
        });
      } else {
        await txAuthService.createMember({
          id: generateId(),
          userId: userID,
          organizationId: invitation.organizationId,
          role: invitation.roles.join(","),
        });
      }

      await txInvitationService.updateStatus(
        invitation.id,
        InvitationStatus.ACCEPTED
      );
    });
  }
);

export const rejectInvitation = api(
  {
    method: "POST",
    path: "/invitations/:id/reject",
    auth: true,
    expose: true,
  },
  async ({ id }: RejectInvitationRequest): Promise<void> => {
    const { userID } = requireAuth();
    const user = await authService.findOneUser(userID);

    const invitation = await invitationService.findOne(id);

    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      throw APIError.permissionDenied("This invitation is not for you");
    }
    if (invitation.status !== InvitationStatus.PENDING) {
      throw APIError.failedPrecondition(
        `Invitation already ${invitation.status}`
      );
    }

    await invitationService.updateStatus(
      invitation.id,
      InvitationStatus.REJECTED
    );
  }
);

export const cancelInvitation = api(
  {
    method: "POST",
    path: "/invitations/:id/cancel",
    auth: true,
    expose: true,
  },
  async ({ id }: { id: string }): Promise<void> => {
    const { userID } = requireAuth();

    const invitation = await invitationService.findOne(id);
    // Look up the org by authOrganizationId to feed assertAdmin.
    const organization = await organizationRepo.findOne(
      invitation.organizationId
    );

    await assertAdmin(organization.id, userID);

    if (invitation.status !== InvitationStatus.PENDING) {
      throw APIError.failedPrecondition(
        `Invitation already ${invitation.status}`
      );
    }

    await invitationService.updateStatus(
      invitation.id,
      InvitationStatus.CANCELLED
    );
  }
);
