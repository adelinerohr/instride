import type { Level } from "@instride/api";

import { CategoryDot } from "@/shared/components/fragments/category-dot";
import { Badge } from "@/shared/components/ui/badge";
import { categoryBadgeClasses } from "@/shared/lib/config/colors";

export interface LevelBadgeProps {
  level?: Level | null;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  const levelClass = level?.color
    ? categoryBadgeClasses(level.color)
    : undefined;

  return (
    <Badge variant={level ? "outline" : "secondary"} className={levelClass}>
      <CategoryDot size="sm" color={level?.color ?? "unrestricted"} />
      {level?.name ?? "Unrestricted"}
    </Badge>
  );
}
