import * as React from "react";

import { navigateDate } from "../utils/date";
import { useCalendar } from "./use-calendar";

export type Direction = "previous" | "next";

export type SwipeOptions = {
  enabled?: boolean;
  /** Touch/drag threshold in pixels */
  swipeThresholdPx?: number;
  /** Require horizontal motion to dominate vertical motion */
  horizontalDominance?: number;
  /** Trackpad: ignore tiny jitter */
  wheelThresholdPx?: number;
  /** Trackpad: prevent multiple navigations per gesture */
  wheelCooldownMs?: number;
};

export function useRangeSwipe(options: SwipeOptions = {}) {
  const {
    enabled = true,
    swipeThresholdPx = 70,
    horizontalDominance = 1.35,
    wheelThresholdPx = 35,
    wheelCooldownMs = 450,
  } = options;

  const { selectedDate, setSelectedDate, selectedView, selectedMultiDayCount } =
    useCalendar();

  const navigate = React.useCallback(
    (direction: Direction) => {
      setSelectedDate(
        navigateDate({
          direction,
          selectedView,
          selectedDate,
          selectedMultiDayCount,
        })
      );
    },
    [setSelectedDate, selectedView, selectedDate, selectedMultiDayCount]
  );

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

      console.log("[swipe] down", {
        type: e.pointerType,
        x: e.clientX,
        y: e.clientY,
      });
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
        console.log("[swipe] decided vertical", { dx, dy });
        return;
      }

      decisionRef.current = "horizontal";
      console.log("[swipe] decided horizontal", { dx, dy });
    },
    [enabled, horizontalDominance]
  );

  const onPointerUp = React.useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      if (pointerIdRef.current !== e.pointerId) return;

      const dx = e.clientX - startXRef.current;
      const dy = e.clientY - startYRef.current;

      console.log("[swipe] up", {
        dx,
        dy,
        decision: decisionRef.current,
        threshold: swipeThresholdPx,
      });

      if (
        decisionRef.current === "horizontal" &&
        Math.abs(dx) >= swipeThresholdPx &&
        Math.abs(dy) <= Math.abs(dx) * horizontalDominance
      ) {
        navigate(dx < 0 ? "next" : "previous");
      }

      resetPointerTracking();
    },
    [
      enabled,
      horizontalDominance,
      navigate,
      resetPointerTracking,
      swipeThresholdPx,
    ]
  );

  const onPointerCancel = React.useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      if (pointerIdRef.current !== e.pointerId) return;
      console.log("[swipe] cancel");
      resetPointerTracking();
    },
    [enabled, resetPointerTracking]
  );

  // Native non-passive wheel listener on the viewport.
  // React's synthetic onWheel is passive and can't preventDefault, plus
  // the scroll container often consumes the event before it bubbles.
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
      navigate(e.deltaX > 0 ? "next" : "previous");
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [
    enabled,
    horizontalDominance,
    navigate,
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
