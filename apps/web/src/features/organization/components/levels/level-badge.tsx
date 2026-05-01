import type { Level } from "@instride/api";

import { CategoryDot } from "@/shared/components/fragments/category-dot";
import { Badge } from "@/shared/components/ui/badge";
import { categoryBadgeClasses } from "@/shared/lib/config/colors";

export interface LevelBadgeProps {
  level?: Level | null;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  const levelClass = categoryBadgeClasses(level?.color);

  return (
    <Badge variant="outline" className={levelClass}>
      <CategoryDot size="sm" color={level?.color ?? "unrestricted"} />
      {level?.name ?? "Unrestricted"}
    </Badge>
  );
}
