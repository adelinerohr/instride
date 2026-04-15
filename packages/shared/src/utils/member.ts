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

export function getMember(input: {
  trainer?: types.Trainer;
  rider?: types.Rider;
}): types.Member {
  if (input.trainer) {
    if (input.trainer.member) {
      return input.trainer.member;
    }
  }

  if (input.rider) {
    if (input.rider.member) {
      return input.rider.member;
    }
  }

  throw new Error("No member found");
}

export function getUser(input: {
  trainer?: types.Trainer;
  rider?: types.Rider;
  member?: types.Member;
}) {
  if (input.trainer) {
    const member = getMember({ trainer: input.trainer });
    if (member.authUser) {
      return member.authUser;
    }
  }

  if (input.rider) {
    const member = getMember({ rider: input.rider });
    if (member.authUser) {
      return member.authUser;
    }
  }

  if (input.member) {
    if (input.member.authUser) {
      return input.member.authUser;
    }
  }

  throw new Error("No user found");
}
