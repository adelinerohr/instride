import { GuardianPermissionsPatchSchema } from "@instride/db/guardian-permissions";
import { z } from "zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const nameSchema = z.string().trim().min(1).max(120);
const dateOfBirthSchema = z.string().regex(ISO_DATE, "Use YYYY-MM-DD");

export const CreateDependentSchema = z.object({
  name: nameSchema,
  dateOfBirth: dateOfBirthSchema.nullish(),
  /** Admins can create a dependent on behalf of another member. Defaults to the caller. */
  guardianMemberId: z.uuid().optional(),
  /** Parental consent for a minor's account and data. Must be true. */
  consent: z.literal(true, { error: "Consent is required to add a dependent" }),
  permissions: GuardianPermissionsPatchSchema.optional(),
});
export type CreateDependentValues = z.infer<typeof CreateDependentSchema>;

export const DependentMemberSchema = z.object({ dependentMemberId: z.uuid() });

export const UpdateDependentSchema = DependentMemberSchema.extend({
  name: nameSchema.optional(),
  dateOfBirth: dateOfBirthSchema.nullish(),
});
export type UpdateDependentValues = z.infer<typeof UpdateDependentSchema>;

export const UpdatePermissionsSchema = DependentMemberSchema.extend({
  permissions: GuardianPermissionsPatchSchema,
});

export const RevokeGuardianSchema = z.object({ relationshipId: z.uuid() });

export const InviteByEmailSchema = DependentMemberSchema.extend({
  email: z.email(),
});
