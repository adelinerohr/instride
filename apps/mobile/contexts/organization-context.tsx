import {
  organizationOptions,
  registerRuntime,
  useMyMembership,
} from "@instride/api";
import type { MemberWithRoles } from "@instride/shared";
import { useQueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authClient } from "@/lib/auth-client";

const ORGANIZATION_SLUG =
  process.env.EXPO_PUBLIC_ORGANIZATION_SLUG ?? "instride";

type OrganizationContextType = {
  organizationId: string | null;
  organizationSlug: string;
  isReady: boolean;
  error: string | null;
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export const OrganizationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = useQueryClient();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    try {
      const organization = await queryClient.fetchQuery(
        organizationOptions.bySlug(ORGANIZATION_SLUG)
      );

      if (!organization) {
        setError("Organization not found");
        return;
      }

      registerRuntime({
        getOrganizationId: () => organization.id,
      });

      setOrganizationId(organization.id);

      await authClient.updateSession({
        contextOrganizationId: organization.id,
      } as Parameters<typeof authClient.updateSession>[0]);

      await authClient.organization.setActive({
        organizationId: organization.authOrganizationId,
        organizationSlug: organization.slug,
      });

      setIsReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load organization");
    }
  }, [queryClient]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const value = useMemo(
    () => ({
      organizationId,
      organizationSlug: ORGANIZATION_SLUG,
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
};

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganization must be used within OrganizationProvider");
  }
  return context;
}

/**
 * Returns the current user's membership and derived role helpers.
 * Must be used inside an authenticated + org-ready subtree.
 */
export function useCurrentMember() {
  const { data: member } = useMyMembership();

  const roles = useMemo(() => member?.roles ?? [], [member]);

  const isAdmin = useMemo(() => roles.includes("admin"), [roles]);
  const isTrainer = useMemo(() => roles.includes("trainer"), [roles]);
  const isRider = useMemo(() => roles.includes("rider"), [roles]);
  const isAdminOrTrainer = useMemo(
    () => isAdmin || isTrainer,
    [isAdmin, isTrainer]
  );

  return {
    member: member as MemberWithRoles | undefined,
    roles,
    isAdmin,
    isTrainer,
    isRider,
    isAdminOrTrainer,
  };
}
