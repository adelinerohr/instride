import {
  GetInvitationResponse,
  ListInvitationsResponse,
} from "@instride/api/contracts";
import { MembershipRole } from "@instride/shared";
import { api, APIError } from "encore.dev/api";

import { authService } from "@/services/auth/auth.service";
import { requireAuth, requireOrganizationAuth } from "@/shared/auth";

import { toInvitation } from "../mappers";
import { organizationService } from "../organization.service";
import { invitationService } from "./invitation.service";

export const listInvitations = api(
  { method: "GET", path: "/invitations", auth: true, expose: true },
  async (): Promise<ListInvitationsResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const organization = await organizationService.findOne(organizationId);

    const rows = await invitationService.findManyByOrg(
      organization.authOrganizationId
    );
    return { invitations: rows.map(toInvitation) };
  }
);

export const listUserInvitations = api(
  { method: "GET", path: "/invitations/user", auth: true, expose: true },
  async (): Promise<ListInvitationsResponse> => {
    const { userID } = requireAuth();
    const user = await authService.findOneUser(userID);
    const rows = await invitationService.findManyByEmail(user.email);
    return { invitations: rows.map(toInvitation) };
  }
);

export const listMyInvitedRoles = api(
  {
    method: "GET",
    path: "/organization/:organizationId/members/me/invited-roles",
    expose: true,
    auth: true,
  },
  async ({
    organizationId,
  }: {
    organizationId: string;
  }): Promise<{ roles: MembershipRole[] }> => {
    const { userID } = requireOrganizationAuth();

    const user = await authService.findOneUser(userID);

    const organization = await organizationService.findOne(organizationId);

    const accepted = await invitationService.findAcceptedForOrgEmail({
      organizationId: organization.authOrganizationId,
      email: user.email,
    });

    return { roles: accepted?.roles ?? [] };
  }
);

export const getInvitation = api(
  {
    method: "GET",
    path: "/invitations/:id",
    auth: true,
    expose: true,
  },
  async ({ id }: { id: string }): Promise<GetInvitationResponse> => {
    const { userID } = requireAuth();
    const user = await authService.findOneUser(userID);
    const invitation = await invitationService.findOne(id);

    // Recipient-only — admins use listInvitations.
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      throw APIError.permissionDenied("This invitation is not for you");
    }

    return { invitation: toInvitation(invitation) };
  }
);
