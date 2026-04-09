import { z } from "zod";

export const dateLikeSchema = z.union([z.date(), z.string()]);
export type DateLike = z.infer<typeof dateLikeSchema>;
