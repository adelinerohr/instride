import {
  useClearKioskIdentity,
  useKioskSession,
  useMembers,
  useVerifyKioskIdentity,
  type Member,
} from "@instride/api";
import { KioskScope } from "@instride/shared";
import * as React from "react";

import { buildKioskPermissions } from "../lib/permissions";
import { type KioskActingContext, type KioskPermissionSet } from "../lib/types";
import { useKioskExpiry, useKioskIdleTimeout } from "./use-kiosk-expiry";

interface KioskContextValue {
  sessionId: string;
  acting: KioskActingContext;
  /** The member currently acting, or null if in DEFAULT scope. */
  actingMember: Member | null;
  permissions: KioskPermissionSet;
  startActing: (input: { memberId: string; pin: string }) => Promise<void>;
  stopActing: () => Promise<void>;
}

const DEFAULT_ACTING: KioskActingContext = {
  actingMemberId: null,
  scope: KioskScope.DEFAULT,
  expiresAt: null,
};

const KioskContext = React.createContext<KioskContextValue | null>(null);

interface KioskProviderProps {
  sessionId: string;
  children: React.ReactNode;
}

export function KioskProvider({ sessionId, children }: KioskProviderProps) {
  const { data: session } = useKioskSession(sessionId);
  const { data: members } = useMembers();

  const acting: KioskActingContext = session?.acting ?? DEFAULT_ACTING;

  const verifyKioskIdentity = useVerifyKioskIdentity();
  const clearKioskIdentity = useClearKioskIdentity();

  const clearIdentity = React.useCallback(() => {
    void clearKioskIdentity.mutateAsync({ sessionId });
  }, [sessionId, clearKioskIdentity]);

  useKioskExpiry(acting.expiresAt, clearIdentity);
  useKioskIdleTimeout(
    acting.scope !== KioskScope.DEFAULT,
    clearIdentity,
    3 * 60 * 1000
  );

  const actingMember = React.useMemo(() => {
    if (!acting.actingMemberId || !members) return null;
    return members.find((m) => m.id === acting.actingMemberId) ?? null;
  }, [acting.actingMemberId, members]);

  const permissions = React.useMemo(
    () => buildKioskPermissions(acting, !!actingMember),
    [acting, actingMember]
  );

  const startActing = React.useCallback(
    async (input: { memberId: string; pin: string }) => {
      await verifyKioskIdentity.mutateAsync({ sessionId, ...input });
    },
    [sessionId, verifyKioskIdentity]
  );

  const stopActing = React.useCallback(async () => {
    await clearKioskIdentity.mutateAsync({ sessionId });
  }, [sessionId, clearKioskIdentity]);

  const value = React.useMemo(
    () => ({
      sessionId,
      acting,
      actingMember,
      permissions,
      startActing,
      stopActing,
    }),
    [sessionId, acting, actingMember, permissions, startActing, stopActing]
  );

  return (
    <KioskContext.Provider value={value}>{children}</KioskContext.Provider>
  );
}

export function useKiosk() {
  const context = React.useContext(KioskContext);
  if (!context) {
    throw new Error("useKiosk must be used within a KioskProvider");
  }
  return context;
}

/**
 * Variant of `useKiosk` that returns null instead of throwing when used
 * outside a `KioskProvider`. For components that render in both kiosk and
 * non-kiosk contexts (lesson view, calendar) and need to branch behavior.
 */
export function useKioskOptional(): KioskContextValue | null {
  return React.useContext(KioskContext);
}
