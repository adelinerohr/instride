import { MembershipRole } from "@instride/shared";

export const CATEGORY_COLORS = [
  "amber",
  "sage",
  "slate",
  "terracotta",
  "plum",
  "clay",
] as const;

export const CATEGORY_DOT_CLASSES: Record<CategoryColor, string> = {
  amber: "bg-category-amber-dot",
  sage: "bg-category-sage-dot",
  slate: "bg-category-slate-dot",
  terracotta: "bg-category-terracotta-dot",
  plum: "bg-category-plum-dot",
  clay: "bg-category-clay-dot",
};

export type CategoryColor = (typeof CATEGORY_COLORS)[number];

export function isCategoryColor(v: string): v is CategoryColor {
  return (CATEGORY_COLORS as readonly string[]).includes(v);
}

export function getUserColor(userId: string): CategoryColor {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}

export function getTrainerColor(trainerId: string): CategoryColor {
  let hash = 0;
  for (let i = 0; i < trainerId.length; i++) {
    hash = trainerId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}

export function getBoardColor(boardId: string): CategoryColor {
  let hash = 0;
  for (let i = 0; i < boardId.length; i++) {
    hash = boardId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}

export function getRoleColor(role: MembershipRole): CategoryColor {
  switch (role) {
    case MembershipRole.ADMIN:
      return "amber";
    case MembershipRole.TRAINER:
      return "sage";
    case MembershipRole.RIDER:
      return "slate";
    case MembershipRole.GUARDIAN:
      return "terracotta";
    default:
      return "clay";
  }
}

// For display — human-readable label
export const CATEGORY_COLOR_LABELS: Record<CategoryColor, string> = {
  amber: "Amber",
  sage: "Sage",
  slate: "Slate",
  terracotta: "Terracotta",
  plum: "Plum",
  clay: "Clay",
};

// Resolves a category color to Tailwind classes for a lesson-block-style pill.
// Matches the trainer palette structure from your theme.
export function categoryBadgeClasses(color?: string): string {
  const map: Record<CategoryColor, string> = {
    amber:
      "border-category-amber-border bg-category-amber-bg text-category-amber-fg",
    sage: "border-category-sage-border bg-category-sage-bg text-category-sage-fg",
    slate:
      "border-category-slate-border bg-category-slate-bg text-category-slate-fg",
    terracotta:
      "border-category-terracotta-border bg-category-terracotta-bg text-category-terracotta-fg",
    plum: "border-category-plum-border bg-category-plum-bg text-category-plum-fg",
    clay: "border-category-clay-border bg-category-clay-bg text-category-clay-fg",
  };

  if (!color || !isCategoryColor(color)) {
    return map["clay"];
  } else {
    return map[color];
  }
}

export function categoryColorClasses(color?: string): {
  border: string;
  bg: string;
  primary: string;
  fg: string;
} {
  const map: Record<
    CategoryColor,
    { border: string; bg: string; primary: string; fg: string }
  > = {
    amber: {
      border: "border-category-amber-border",
      bg: "bg-category-amber-bg",
      primary: "bg-category-amber-dot",
      fg: "text-category-amber-fg",
    },
    sage: {
      border: "border-category-sage-border",
      bg: "bg-category-sage-bg",
      primary: "bg-category-sage-dot",
      fg: "text-category-sage-fg",
    },
    slate: {
      border: "border-category-slate-border",
      bg: "bg-category-slate-bg",
      primary: "bg-category-slate-dot",
      fg: "text-category-slate-fg",
    },
    terracotta: {
      border: "border-category-terracotta-border",
      bg: "bg-category-terracotta-bg",
      primary: "bg-category-terracotta-dot",
      fg: "text-category-terracotta-fg",
    },
    plum: {
      border: "border-category-plum-border",
      bg: "bg-category-plum-bg",
      primary: "bg-category-plum-dot",
      fg: "text-category-plum-fg",
    },
    clay: {
      border: "border-category-clay-border",
      bg: "bg-category-clay-bg",
      primary: "bg-category-clay-dot",
      fg: "text-category-clay-fg",
    },
  };

  if (!color || !isCategoryColor(color)) {
    return map["clay"];
  } else {
    return map[color];
  }
}
