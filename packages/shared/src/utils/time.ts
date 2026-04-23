import { MAX_SLOT_MINUTES, TIME_OPTIONS } from "../constants";

/**
 * Coerce DB/API time strings (e.g. `09:00:00`, `09:00:00+00`) to `HH:MM` values
 * that match {@link TIME_OPTIONS}. Selects show raw `value` when no item matches.
 * @param raw - The raw time string to normalize.
 * @param fallback - The fallback value to return if the raw string is null or undefined.
 * @returns The normalized time string.
 */
export function normalizeTimeSlot(
  raw: string | null | undefined,
  fallback: string
): string {
  if (raw == null || raw === "") {
    return fallback;
  }

  const s = String(raw).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);

  if (!m || !m[1] || !m[2]) {
    return fallback;
  }

  const hh = m[1].padStart(2, "0");
  const mm = m[2];
  const candidate = `${hh}:${mm}`;

  if (TIME_OPTIONS.some((t) => t.value === candidate)) {
    return candidate;
  }

  const minutes = Number.parseInt(hh, 10) * 60 + Number.parseInt(mm, 10);
  const snapped = Math.round(minutes / 30) * 30;
  const clamped = Math.min(MAX_SLOT_MINUTES, Math.max(0, snapped));
  const h = Math.floor(clamped / 60);
  const min = clamped % 60;

  const snappedValue = `${String(h).padStart(2, "0")}:${
    min === 0 ? "00" : "30"
  }`;

  return TIME_OPTIONS.some((t) => t.value === snappedValue)
    ? snappedValue
    : fallback;
}

/**
 * Format a time string as a 12-hour label (e.g. "09:00" → "9:00 AM").
 * Normalizes the input first, so this accepts DB/API formats like
 * `09:00:00+00` as well as the `HH:MM` values used in the UI.
 * @param raw - The raw time string to format.
 * @param fallback - The fallback time value (must be a valid HH:MM in TIME_OPTIONS).
 * @returns The 12-hour formatted label.
 */
export function formatTimeSlot(
  raw: string | null | undefined,
  fallback: string
): string {
  const normalized = normalizeTimeSlot(raw, fallback);
  const option = TIME_OPTIONS.find((t) => t.value === normalized);
  return option?.label ?? fallback;
}
