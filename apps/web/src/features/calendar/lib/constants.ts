export const SLOT_HEIGHT = 200; // pixels per hour slot
export const MOBILE_SLOT_HEIGHT = 72; // px per hour on mobile

export const QUARTER_HEIGHT = SLOT_HEIGHT / 4; // pixels per quarter hour slot
export const MOBILE_QUARTER_HEIGHT = MOBILE_SLOT_HEIGHT / 4;

export const START_HOUR = 7; // calendar starts at 6 AM
export const END_HOUR = 22; // calendar ends at 10 PM
export const HOURS = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, i) => i + START_HOUR
);
export const TOTAL_HEIGHT = SLOT_HEIGHT * HOURS.length;

export const MINUTES_IN_DAY = 24 * 60;
