import type { types } from "@instride/api";

import { CategoryDot } from "@/shared/components/fragments/category-dot";
import { Badge } from "@/shared/components/ui/badge";
import {
  categoryColorClasses,
  isCategoryColor,
} from "@/shared/lib/config/colors";

export interface LevelBadgeProps {
  level?: types.Level | null;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  const levelClass =
    level?.color && isCategoryColor(level.color)
      ? categoryColorClasses(level.color)
      : undefined;

  return (
    <Badge variant={level ? "outline" : "secondary"} className={levelClass}>
      <CategoryDot size="sm" color={level?.color ?? "unrestricted"} />
      {level?.name ?? "Unrestricted"}
    </Badge>
  );
}
