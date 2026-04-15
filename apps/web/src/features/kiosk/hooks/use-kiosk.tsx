import {
  useClearKioskIdentity,
  useKioskSession,
  useVerifyKioskIdentity,
} from "@instride/api";
import * as React from "react";

import { buildKioskPermissions } from "../lib/permissions";
import {
  KioskScope,
  type KioskActingContext,
  type KioskPermissionSet,
} from "../lib/types";

interface KioskContextValue {
  sessionId: string | null;
  acting: KioskActingContext;
  permissions: KioskPermissionSet;
  startActing: (input: { memberId: string; pin: string }) => Promise<void>;
  stopActing: () => Promise<void>;
}

const KioskContext = React.createContext<KioskContextValue | null>(null);

interface KioskProviderProps {
  sessionId: string;
  children: React.ReactNode;
}

export function KioskProvider({ sessionId, children }: KioskProviderProps) {
  const { data: session } = useKioskSession(sessionId);

  const acting: KioskActingContext = session?.acting ?? {
    actingMemberId: null,
    scope: KioskScope.DEFAULT,
    expiresAt: null,
  };

  const verifyKioskIdentity = useVerifyKioskIdentity();
  const clearKioskIdentity = useClearKioskIdentity();

  // Auto-expire on timeout
  React.useEffect(() => {
    if (!acting.expiresAt || !sessionId) return;

    const expiresAtMs = new Date(acting.expiresAt).getTime();
    const msRemaining = expiresAtMs - Date.now();

    if (msRemaining <= 0) {
      void clearKioskIdentity.mutateAsync({ sessionId });
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void clearKioskIdentity.mutateAsync({ sessionId });
    }, msRemaining);

    return () => window.clearTimeout(timeoutId);
  }, [acting.expiresAt, sessionId]);

  // Idle timeout (3 minutes of inactivity)
  React.useEffect(() => {
    if (acting.scope === "default" || !sessionId) return;

    let idleTimer: number | null = null;
    const idleMs = 3 * 60 * 1000; // 3 minutes

    const resetIdleTimer = () => {
      if (idleTimer) {
        window.clearTimeout(idleTimer);
      }

      idleTimer = window.setTimeout(() => {
        void clearKioskIdentity.mutateAsync({ sessionId });
      }, idleMs);
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    resetIdleTimer();

    for (const event of events) {
      window.addEventListener(event, resetIdleTimer, { passive: true });
    }

    return () => {
      if (idleTimer) {
        window.clearTimeout(idleTimer);
      }

      for (const event of events) {
        window.removeEventListener(event, resetIdleTimer);
      }
    };
  }, [acting.scope, sessionId]);

  const permissions = React.useMemo(
    () => buildKioskPermissions(acting),
    [acting]
  );

  return (
    <KioskContext.Provider
      value={{
        sessionId,
        acting,
        permissions,
        startActing: async ({ memberId, pin }) => {
          if (!sessionId) {
            throw new Error("No kiosk session selected");
          }

          await verifyKioskIdentity.mutateAsync({
            sessionId,
            memberId,
            pin,
          });
        },
        stopActing: async () => {
          if (!sessionId) return;
          await clearKioskIdentity.mutateAsync({ sessionId });
        },
      }}
    >
      {children}
    </KioskContext.Provider>
  );
}

export function useKiosk() {
  const context = React.useContext(KioskContext);
  if (!context) {
    throw new Error("useKiosk must be used within a KioskProvider");
  }
  return context;
}
