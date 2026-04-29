import {
  useClearKioskIdentity,
  useKioskSession,
  useVerifyKioskIdentity,
} from "@instride/api";
import { KioskScope } from "@instride/shared";
import * as React from "react";

import { buildKioskPermissions } from "../lib/permissions";
import { type KioskActingContext, type KioskPermissionSet } from "../lib/types";
import { useKioskExpiry, useKioskIdleTimeout } from "./use-kiosk-expiry";

interface KioskContextValue {
  sessionId: string;
  acting: KioskActingContext;
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
    3 * 60 * 1000 // 3 minutes
  );

  const permissions = React.useMemo(
    () => buildKioskPermissions(acting),
    [acting]
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
      permissions,
      startActing,
      stopActing,
    }),
    [sessionId, acting, permissions, startActing, stopActing]
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
