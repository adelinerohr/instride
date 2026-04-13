import type { types } from "@instride/api";
import type { MembershipRole } from "@instride/shared";

export function hasAnyRole(
  member: types.Member,
  roles: MembershipRole[]
): boolean {
  return roles.some((role) => member.roles.includes(role));
}

export function hasRole(member: types.Member, role: MembershipRole): boolean {
  return member.roles.includes(role);
}

export function hasOnlyRole(
  member: types.Member,
  role: MembershipRole
): boolean {
  return member.roles.length === 1 && hasRole(member, role);
}
