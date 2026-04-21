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
export function categoryColorClasses(color: CategoryColor): string {
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
  return map[color];
}
