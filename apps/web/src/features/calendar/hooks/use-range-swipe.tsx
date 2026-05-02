import * as React from "react";

import { navigateDate } from "../utils/date";
import { useCalendar } from "./use-calendar";
import {
  useHorizontalSwipeNavigate,
  type SwipeDirection,
} from "./use-horizontal-swipe-navigate";

export type Direction = SwipeDirection;

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

  return useHorizontalSwipeNavigate({
    enabled,
    swipeThresholdPx,
    horizontalDominance,
    wheelThresholdPx,
    wheelCooldownMs,
    onNavigate: navigate,
  });
}
