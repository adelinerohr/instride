import { z } from "zod";

import { DayOfWeek } from "../models/enums";

/**
 * A single open window within a day.
 * Time format is "HH:MM" or "HH:MM:SS" — we accept both because server rows
 * come back as "HH:MM:SS" but form selects emit "HH:MM".
 */
export const timeSlotSchema = z
  .object({
    openTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format"),
    closeTime: z
      .string()
      .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format"),
  })
  .refine((slot) => slot.openTime < slot.closeTime, {
    message: "Open time must be before close time",
    path: ["closeTime"],
  });

/**
 * A single day's hours. Closed days must have zero slots; open days must have
 * at least one slot with non-overlapping time ranges.
 */
export const dayHoursSchema = z
  .object({
    dayOfWeek: z.enum(DayOfWeek),
    isOpen: z.boolean(),
    slots: z.array(timeSlotSchema),
  })
  .superRefine((day, ctx) => {
    if (!day.isOpen) {
      if (day.slots.length > 0) {
        ctx.addIssue({
          code: "custom",
          message: "Closed days must not have any slots",
          path: ["slots"],
        });
      }
      return;
    }

    if (day.slots.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Open days must have at least one slot",
        path: ["slots"],
      });
      return;
    }

    // Detect overlaps by sorting a copy and checking consecutive pairs.
    // Report the overlap on the *later* slot's openTime so the error lands
    // next to the field the user most likely just changed.
    const indexed = day.slots.map((slot, index) => ({ slot, index }));
    const sorted = [...indexed].sort((a, b) =>
      a.slot.openTime < b.slot.openTime
        ? -1
        : a.slot.openTime > b.slot.openTime
          ? 1
          : 0
    );

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (curr.slot.openTime < prev.slot.closeTime) {
        ctx.addIssue({
          code: "custom",
          message: `Slot overlaps with ${prev.slot.openTime.slice(0, 5)}–${prev.slot.closeTime.slice(0, 5)}`,
          path: ["slots", curr.index, "openTime"],
        });
      }
    }
  });

/**
 * The full week as edited in the business-hours form.
 * Exactly 7 entries, one per day of week, in the canonical DayOfWeek order.
 */
export const availabilityDaysFormSchema = z.object({
  days: z.array(dayHoursSchema).length(7, "Must include exactly 7 days"),
});

export type AvailabilityDaysFormValues = z.infer<
  typeof availabilityDaysFormSchema
>;

export const createTimeBlockSchema = z.object({
  trainerId: z.string().min(1, "Please select a trainer."),
  start: z.object({
    date: z.string().min(1, "Please enter a valid date."),
    time: z.string().min(1, "Please enter a valid time."),
  }),
  end: z.object({
    date: z.string().min(1, "Please enter a valid date."),
    time: z.string().min(1, "Please enter a valid time."),
  }),
  reason: z.string().nullable(),
});

export type CreateTimeBlockSchema = z.infer<typeof createTimeBlockSchema>;
