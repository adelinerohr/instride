import { MembershipRole } from "@instride/db/enums";
import { z } from "zod";

export const CreateInvitationSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  roles: z.array(z.enum(MembershipRole)).min(1),
});
export type CreateInvitationValues = z.infer<typeof CreateInvitationSchema>;

export const InvitationIdSchema = z.object({ invitationId: z.uuid() });

export const InvitationTokenSchema = z.object({ token: z.string().min(1) });
