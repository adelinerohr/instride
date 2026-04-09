import z from "zod";

import { DayOfWeek } from "../models/enums";

export const dayHoursSchema = z
  .object({
    dayOfWeek: z.enum(DayOfWeek),
    isOpen: z.boolean(),
    openTime: z.string().nullable(), // "HH:MM" 24-hour
    closeTime: z.string().nullable(),
  })
  .refine(
    (data) => {
      if (!data.isOpen) return true;
      return data.openTime !== null && data.closeTime !== null;
    },
    { message: "Open days must have both open and close times" }
  )
  .refine(
    (data) => {
      if (!data.isOpen || !data.openTime || !data.closeTime) return true;
      return data.openTime < data.closeTime;
    },
    { message: "Open time must be before close time" }
  );

export type DayHoursSchema = z.infer<typeof dayHoursSchema>;

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
