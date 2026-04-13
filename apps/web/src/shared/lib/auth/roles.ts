import { type Member, MembershipRole } from "@instride/shared";

export function isAdmin(member: Member): boolean {
  return member.roles.includes(MembershipRole.ADMIN);
}

export function isTrainer(member: Member): boolean {
  return member.roles.includes(MembershipRole.TRAINER);
}

export function isRider(member: Member): boolean {
  return member.roles.includes(MembershipRole.RIDER);
}

export function isGuardian(member: Member): boolean {
  return member.roles.includes(MembershipRole.GUARDIAN);
}

export function isAdminOrTrainer(member: Member): boolean {
  return isAdmin(member) || isTrainer(member);
}

export function isOnlyRider(member: Member): boolean {
  return member.roles.length === 1 && isRider(member);
}

export function hasAnyRole(member: Member, roles: MembershipRole[]): boolean {
  return roles.some((role) => member.roles.includes(role));
}

export function hasRole(member: Member, role: MembershipRole): boolean {
  return member.roles.includes(role);
}

export const ROLE_LABELS = {
  [MembershipRole.ADMIN]: "Admin",
  [MembershipRole.TRAINER]: "Trainer",
  [MembershipRole.RIDER]: "Rider",
  [MembershipRole.GUARDIAN]: "Guardian",
};

export const ROLE_VARIANTS: Record<
  MembershipRole,
  | "link"
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | null
  | undefined
> = {
  [MembershipRole.ADMIN]: "default",
  [MembershipRole.TRAINER]: "secondary",
  [MembershipRole.RIDER]: "outline",
  [MembershipRole.GUARDIAN]: "ghost",
};
