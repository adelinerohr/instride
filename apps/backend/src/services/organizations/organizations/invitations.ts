import { InvitationStatus, MembershipRole } from "@instride/shared";
import { isAPIError } from "better-auth/api";
import { api, APIError } from "encore.dev/api";

import { auth } from "@/services/auth/auth";
import { requireAuth, requireOrganizationAuth } from "@/shared/auth";

import { ListInvitationsResponse } from "../types/contracts";

export const listInvitations = api(
  {
    method: "GET",
    path: "/invitations",
    auth: true,
    expose: true,
  },
  async (): Promise<ListInvitationsResponse> => {
    const { token, session } = requireOrganizationAuth();

    if (!session.session.activeOrganizationId) {
      throw APIError.failedPrecondition("Active organization ID is required");
    }

    try {
      const data = await auth.api.listInvitations({
        query: {
          organizationId: session.session.activeOrganizationId,
        },
        headers: new Headers({
          cookie: `better-auth.session_token=${token}`,
        }),
      });

      return {
        invitations: data.map((invitation) => ({
          ...invitation,
          role: invitation.role.split(",") as MembershipRole[],
          status: invitation.status.toLowerCase() as InvitationStatus,
        })),
      };
    } catch (error) {
      if (isAPIError(error)) {
        throw APIError.internal(error.message, error);
      }

      throw APIError.internal("Failed to list invitations");
    }
  }
);

export const listUserInvitations = api(
  {
    method: "GET",
    path: "/invitations/user",
    auth: true,
    expose: true,
  },
  async (): Promise<ListInvitationsResponse> => {
    try {
      const data = await auth.api.listUserInvitations();

      return {
        invitations: data.map((invitation) => ({
          ...invitation,
          role: invitation.role.split(",") as MembershipRole[],
          status: invitation.status.toLowerCase() as InvitationStatus,
        })),
      };
    } catch (error) {
      if (isAPIError(error)) {
        throw APIError.internal(error.message, error);
      }

      throw APIError.internal("Failed to list invitations");
    }
  }
);

interface SendInvitationRequest {
  organizationId: string;
  email: string;
  role: MembershipRole[];
  resend?: boolean;
}

export const sendInvitation = api(
  {
    method: "POST",
    path: "/organizations/:organizationId/invitations",
    auth: true,
    expose: true,
  },
  async (request: SendInvitationRequest): Promise<void> => {
    const { token } = requireAuth();

    try {
      await auth.api.createInvitation({
        body: {
          email: request.email,
          role: request.role,
          organizationId: request.organizationId,
          resend: request.resend,
        },
        headers: new Headers({
          cookie: `better-auth.session_token=${token}`,
        }),
      });
    } catch (error) {
      if (isAPIError(error)) {
        throw APIError.internal(error.message, error);
      }
    }
  }
);
