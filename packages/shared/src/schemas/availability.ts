import z from "zod";

import { DayOfWeek } from "../models/enums";

export const dayHoursSchema = z
  .object({
    dayOfWeek: z.enum(DayOfWeek),
    isOpen: z.boolean(),
    openTime: z
      .union([z.string(), z.null()])
      .optional()
      .transform((v) => v ?? null),
    closeTime: z
      .union([z.string(), z.null()])
      .optional()
      .transform((v) => v ?? null),
  })
  .refine(
    (data) => {
      if (!data.isOpen) return true;
      const open = data.openTime;
      const close = data.closeTime;
      return open != null && open !== "" && close != null && close !== "";
    },
    { message: "Open days must have both open and close times" }
  )
  .refine(
    (data) => {
      if (!data.isOpen) return true;
      const open = data.openTime;
      const close = data.closeTime;
      if (open == null || close == null || open === "" || close === "")
        return true;
      return open < close;
    },
    { message: "Open time must be before close time" }
  );

export type DayHoursSchema = z.infer<typeof dayHoursSchema>;

/** Form state is only `days`; `boardId` is taken from route/props at submit. */
export const availabilityDaysFormSchema = z.object({
  days: z.array(dayHoursSchema).length(7),
});

export type AvailabilityDaysFormSchema = z.infer<
  typeof availabilityDaysFormSchema
>;

export const organizationAvailabilitySchema = z.object({
  boardId: z.uuid().nullable(),
  days: z.array(dayHoursSchema).length(7),
});

export type OrganizationAvailabilitySchema = z.infer<
  typeof organizationAvailabilitySchema
>;

export const trainerDayHoursSchema = dayHoursSchema.extend({
  inheritsFromOrg: z.boolean(),
});

export type TrainerDayHoursSchema = z.infer<typeof trainerDayHoursSchema>;

export const trainerAvailabilitySchema = z.object({
  boardId: z.uuid().nullable(),
  days: z.array(dayHoursSchema).length(7),
});

export type TrainerAvailabilitySchema = z.infer<
  typeof trainerAvailabilitySchema
>;
