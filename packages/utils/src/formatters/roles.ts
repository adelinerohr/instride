import { MembershipRole } from "@instride/shared";

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
