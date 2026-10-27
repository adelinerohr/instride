import { MembershipRole } from "@instride/db/enums";
import { z } from "zod";

export const SetMemberRolesSchema = z.object({
  memberId: z.uuid(),
  roles: z.array(z.enum(MembershipRole)).min(1),
});
export type SetMemberRolesValues = z.infer<typeof SetMemberRolesSchema>;

export const RemoveMemberSchema = z.object({ memberId: z.uuid() });
