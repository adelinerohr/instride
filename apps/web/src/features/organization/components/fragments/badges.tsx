import type { Board, Level } from "@instride/api";

import { CategoryDot } from "@/shared/components/fragments/category-dot";
import { Badge } from "@/shared/components/ui/badge";
import {
  categoryBadgeClasses,
  getBoardColor,
} from "@/shared/lib/config/colors";
import { cn } from "@/shared/lib/utils";

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

export interface BoardBadgeProps {
  board: Pick<Board, "id" | "name">;
}

export function BoardBadge({ board }: BoardBadgeProps) {
  const boardClass = categoryBadgeClasses(getBoardColor(board.id));

  return (
    <Badge variant="outline" className={cn(boardClass, "bg-transparent")}>
      {board.name}
    </Badge>
  );
}
