import * as React from "react";

export type SwipeDirection = "previous" | "next";

export type HorizontalSwipeNavigateOptions = {
  enabled?: boolean;
  /** Touch/drag threshold in pixels */
  swipeThresholdPx?: number;
  /** Require horizontal motion to dominate vertical motion */
  horizontalDominance?: number;
  /** Trackpad: ignore tiny jitter */
  wheelThresholdPx?: number;
  /** Trackpad: prevent multiple navigations per gesture */
  wheelCooldownMs?: number;
  onNavigate: (direction: SwipeDirection) => void;
};

/**
 * Pointer + horizontal wheel gestures that call `onNavigate` when the user
 * swipes horizontally (after dominance + threshold checks).
 */
export function useHorizontalSwipeNavigate(
  options: HorizontalSwipeNavigateOptions
) {
  const {
    enabled = true,
    swipeThresholdPx = 70,
    horizontalDominance = 1.35,
    wheelThresholdPx = 35,
    wheelCooldownMs = 450,
    onNavigate,
  } = options;

  const pointerIdRef = React.useRef<number | null>(null);
  const startXRef = React.useRef(0);
  const startYRef = React.useRef(0);
  const decisionRef = React.useRef<"undecided" | "horizontal" | "vertical">(
    "undecided"
  );
  const lastWheelNavAtRef = React.useRef(0);
  const wheelTargetRef = React.useRef<HTMLElement | null>(null);

  const resetPointerTracking = React.useCallback(() => {
    pointerIdRef.current = null;
    decisionRef.current = "undecided";
  }, []);

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;

      pointerIdRef.current = e.pointerId;
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      decisionRef.current = "undecided";
    },
    [enabled]
  );

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      if (pointerIdRef.current !== e.pointerId) return;
      if (decisionRef.current !== "undecided") return;

      const dx = e.clientX - startXRef.current;
      const dy = e.clientY - startYRef.current;

      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;

      if (Math.abs(dy) > Math.abs(dx) * horizontalDominance) {
        decisionRef.current = "vertical";
        return;
      }

      decisionRef.current = "horizontal";
    },
    [enabled, horizontalDominance]
  );

  const onPointerUp = React.useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      if (pointerIdRef.current !== e.pointerId) return;

      const dx = e.clientX - startXRef.current;
      const dy = e.clientY - startYRef.current;

      if (
        decisionRef.current === "horizontal" &&
        Math.abs(dx) >= swipeThresholdPx &&
        Math.abs(dy) <= Math.abs(dx) * horizontalDominance
      ) {
        onNavigate(dx < 0 ? "next" : "previous");
      }

      resetPointerTracking();
    },
    [
      enabled,
      horizontalDominance,
      onNavigate,
      resetPointerTracking,
      swipeThresholdPx,
    ]
  );

  const onPointerCancel = React.useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      if (pointerIdRef.current !== e.pointerId) return;
      resetPointerTracking();
    },
    [enabled, resetPointerTracking]
  );

  React.useEffect(() => {
    const el = wheelTargetRef.current;
    if (!el || !enabled) return;

    const handler = (e: WheelEvent) => {
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      if (absX < absY * horizontalDominance) return;
      if (absX < wheelThresholdPx) return;

      const now = performance.now();
      if (now - lastWheelNavAtRef.current < wheelCooldownMs) return;
      lastWheelNavAtRef.current = now;

      e.preventDefault();
      onNavigate(e.deltaX > 0 ? "next" : "previous");
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [
    enabled,
    horizontalDominance,
    onNavigate,
    wheelCooldownMs,
    wheelThresholdPx,
  ]);

  return {
    swipeHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    } satisfies React.HTMLAttributes<HTMLElement>,
    wheelTargetRef,
    swipeClassName: "touch-pan-y overscroll-x-contain",
  };
}
