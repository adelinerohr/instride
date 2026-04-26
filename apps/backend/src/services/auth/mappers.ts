import { AuthMember, AuthUser } from "@instride/api/contracts";

import { toISO, toISOOrNull, toTimestamps } from "@/shared/utils/mappers";

import { AuthMemberRow } from "../organizations/schema/members";
import { AuthUserRow } from "./schema";

export function toAuthUser(row: AuthUserRow): AuthUser {
  return {
    ...row,
    banExpires: toISOOrNull(row.banExpires),
    ...toTimestamps(row.createdAt, row.updatedAt),
  };
}

export function toAuthMember(row: AuthMemberRow): AuthMember {
  return {
    ...row,
    createdAt: toISO(row.createdAt),
  };
}
