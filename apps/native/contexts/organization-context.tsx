import {
  APIError,
  organizationOptions,
  setOrganizationContext,
  types,
  useMyMembership,
} from "@instride/api";
import { MembershipRole } from "@instride/shared";
import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";

import { authClient } from "@/lib/auth-client";

const ORGANIZATION_SLUG =
  process.env.EXPO_PUBLIC_ORGANIZATION_SLUG ?? "instride";

interface OrganizationContextType {
  organizationId: string | null;
  organizationSlug: string;
  organization: types.Organization | null;
  isReady: boolean;
  error: string | null;
}

const OrganizationContext = React.createContext<
  OrganizationContextType | undefined
>(undefined);

export function OrganizationProvider({ children }: React.PropsWithChildren) {
  const queryClient = useQueryClient();
  const [organizationId, setOrganizationId] = React.useState<string | null>(
    null
  );
  const [organization, setOrganization] =
    React.useState<types.Organization | null>(null);
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const bootstrap = React.useCallback(async () => {
    try {
      const organization = await queryClient.fetchQuery(
        organizationOptions.bySlug(ORGANIZATION_SLUG)
      );

      setOrganizationId(organization.id);
      setOrganization(organization);
      setOrganizationContext(organization.id);

      const { error: organizationError } =
        await authClient.organization.setActive({
          organizationId: organization.authOrganizationId,
          organizationSlug: organization.slug,
        });

      setError(organizationError ? "Failed to bootstrap organization" : null);
      setIsReady(true);
    } catch (error) {
      setError(
        error instanceof APIError
          ? error.message
          : "Failed to bootstrap organization"
      );
    }
  }, [queryClient]);

  React.useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const value = React.useMemo(
    () => ({
      organizationId,
      organizationSlug: ORGANIZATION_SLUG,
      organization,
      isReady,
      error,
    }),
    [organizationId, isReady, error]
  );

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = React.useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
}

/**
 * Returns the current user's membership and derived role helpers.
 * Must be used inside an authenticated + org-ready subtree.
 */
export function useCurrentMember() {
  const { data: member } = useMyMembership();

  const roles = React.useMemo(() => member?.roles ?? [], [member]);

  const isAdmin = React.useMemo(
    () => roles.includes(MembershipRole.ADMIN),
    [roles]
  );
  const isTrainer = React.useMemo(
    () => roles.includes(MembershipRole.TRAINER),
    [roles]
  );
  const isRider = React.useMemo(
    () => roles.includes(MembershipRole.RIDER),
    [roles]
  );
  const isGuardian = React.useMemo(
    () => roles.includes(MembershipRole.GUARDIAN),
    [roles]
  );
  const isAdminOrTrainer = React.useMemo(
    () => isAdmin || isTrainer,
    [isAdmin, isTrainer]
  );

  return {
    member,
    roles,
    isAdmin,
    isTrainer,
    isRider,
    isGuardian,
    isAdminOrTrainer,
  };
}
