import type {
  ListInvitationsResponse,
  SendInvitationRequest,
} from "@instride/api/contracts";
import { isAPIError } from "better-auth/api";
import { api, APIError } from "encore.dev/api";

import { auth } from "@/services/auth/auth";
import { buildSessionCookieHeader } from "@/services/auth/session-cookie";
import { requireAuth, requireOrganizationAuth } from "@/shared/auth";

import { toInvitation } from "./mappers";
import { organizationService } from "./organization.service";

export const listInvitations = api(
  { method: "GET", path: "/invitations", auth: true, expose: true },
  async (): Promise<ListInvitationsResponse> => {
    const { token, organizationId } = requireOrganizationAuth();

    const organization = await organizationService.findOne(organizationId);

    try {
      const data = await auth.api.listInvitations({
        query: { organizationId: organization.authOrganizationId },
        headers: new Headers({
          cookie: buildSessionCookieHeader(token),
        }),
      });
      return { invitations: data.map(toInvitation) };
    } catch (error) {
      if (isAPIError(error)) {
        throw APIError.internal(error.message, error);
      }
      throw APIError.internal("Failed to list invitations");
    }
  }
);

export const listUserInvitations = api(
  { method: "GET", path: "/invitations/user", auth: true, expose: true },
  async (): Promise<ListInvitationsResponse> => {
    try {
      const data = await auth.api.listUserInvitations();
      return { invitations: data.map(toInvitation) };
    } catch (error) {
      if (isAPIError(error)) {
        throw APIError.internal(error.message, error);
      }
      throw APIError.internal("Failed to list invitations");
    }
  }
);

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
          cookie: buildSessionCookieHeader(token),
        }),
      });
    } catch (error) {
      if (isAPIError(error)) {
        throw APIError.internal(error.message, error);
      }
      throw APIError.internal("Failed to send invitation");
    }
  }
);
