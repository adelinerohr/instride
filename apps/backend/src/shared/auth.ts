import { APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";

import { AuthData } from "@/services/auth/handler";

export const requireAuth = (): AuthData => {
  return getAuthData()!;
};

interface OrganizationAuthData extends AuthData {
  organizationId: string;
}

export const requireOrganizationAuth = (): OrganizationAuthData => {
  const auth = requireAuth();
  if (!auth.organizationId) {
    throw APIError.failedPrecondition("Organization ID is required");
  }

  return { ...auth, organizationId: auth.organizationId };
};
