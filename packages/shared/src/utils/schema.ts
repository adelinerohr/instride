import { z } from "zod";

export const dateLikeSchema = z.union([z.date(), z.string()]);
export type DateLike = z.infer<typeof dateLikeSchema>;

export const optionalNumberSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.number().optional()
);
export type OptionalNumber = z.infer<typeof optionalNumberSchema>;

export const requiredNumberSchema = z.coerce.number();
export type RequiredNumber = z.infer<typeof requiredNumberSchema>;
