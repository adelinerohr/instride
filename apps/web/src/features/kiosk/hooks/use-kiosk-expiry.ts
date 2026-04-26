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

export function useExpiryCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!expiresAt) {
      setRemaining(null);
      return;
    }

    const tick = () => {
      const msRemaining = new Date(expiresAt).getTime() - Date.now();
      if (msRemaining <= 0) {
        setRemaining(null);
        return false;
      }
      const totalSeconds = Math.ceil(msRemaining / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setRemaining(`${minutes}:${String(seconds).padStart(2, "0")}`);
      return true;
    };

    if (!tick()) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}
