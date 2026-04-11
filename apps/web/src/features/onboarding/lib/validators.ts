import { updateUserInputSchema } from "@instride/shared";
import { z } from "zod";

export const personalDetailsSchema = z.object({
  personalDetails: z.object({
    ...updateUserInputSchema.shape,
    imageFile: z.file().nullable(),
    removeImage: z.boolean(),
  }),
});
