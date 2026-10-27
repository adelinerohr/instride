import { MembershipRole } from "@instride/db/enums";
import { z } from "zod";

/**
 * Admin invites someone to join with these roles. An empty list is allowed:
 * a parent who doesn't ride joins with no roles and adds their dependents.
 */
export const CreateInvitationSchema = z.object({
  email: z.email(),
  roles: z.array(z.enum(MembershipRole)),
});
export type CreateInvitationValues = z.infer<typeof CreateInvitationSchema>;

export const InvitationIdSchema = z.object({ invitationId: z.uuid() });

export const InvitationTokenSchema = z.object({ token: z.string().min(1) });
