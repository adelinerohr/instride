import * as React from "react";

export function useKioskExpiry(expiresAt: string | null, onExpire: () => void) {
  React.useEffect(() => {
    if (!expiresAt) return;

    const msRemaining = new Date(expiresAt).getTime() - Date.now();
    if (msRemaining <= 0) {
      onExpire();
      return;
    }

    const id = window.setTimeout(onExpire, msRemaining);
    return () => window.clearTimeout(id);
  }, [expiresAt, onExpire]);
}

export function useKioskIdleTimeout(
  enabled: boolean,
  onIdle: () => void,
  idleMs: number
) {
  React.useEffect(() => {
    if (!enabled) return;

    let timer: number | null = null;
    const reset = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(onIdle, idleMs);
    };

    const events = [
      "mousemove",
      "keydown",
      "scroll",
      "click",
      "touchstart",
    ] as const;
    reset();

    for (const event of events) {
      window.addEventListener(event, reset, { passive: true });
    }

    return () => {
      if (timer) window.clearTimeout(timer);
      for (const event of events) {
        window.removeEventListener(event, reset);
      }
    };
  }, [enabled, onIdle, idleMs]);
}
