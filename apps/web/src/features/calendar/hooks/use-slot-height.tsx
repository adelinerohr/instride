import * as React from "react";

import { useIsMobile } from "@/shared/hooks/use-mobile";

import { END_HOUR, START_HOUR } from "../lib/constants";

const HOUR_COUNT = END_HOUR - START_HOUR + 1;

const DESKTOP_MIN = 100;
const DESKTOP_MAX = 250;
const MOBILE_MIN = 64;
const MOBILE_MAX = 128;

// How much vertical space is consumed by headers/toolbars above the scroll area.
// Rough estimate — doesn't need to be exact since min/max clamp it.
const CHROME_OFFSET = 220;

export function useSlotHeight() {
  const isMobile = useIsMobile();
  const [viewportHeight, setViewportHeight] = React.useState(() =>
    typeof window === "undefined" ? 900 : window.innerHeight
  );

  React.useEffect(() => {
    const handler = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return React.useMemo(() => {
    const min = isMobile ? MOBILE_MIN : DESKTOP_MIN;
    const max = isMobile ? MOBILE_MAX : DESKTOP_MAX;

    // Target: fit ~70% of hours in one screen before needing to scroll.
    // Adjust the 0.7 multiplier to control how aggressively it compresses.
    const targetVisibleHours = HOUR_COUNT * 0.7;
    const available = viewportHeight - CHROME_OFFSET;
    const ideal = available / targetVisibleHours;

    const slotHeight = Math.round(Math.max(min, Math.min(max, ideal)));
    return {
      slotHeight,
      quarterHeight: slotHeight / 4,
      totalHeight: slotHeight * HOUR_COUNT,
    };
  }, [viewportHeight, isMobile]);
}
