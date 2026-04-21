import {
  isCategoryColor,
  CATEGORY_DOT_CLASSES,
} from "@/shared/lib/config/colors";
import { cn } from "@/shared/lib/utils";

interface CategoryDotProps {
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CategoryDot({
  color,
  size = "md",
  className,
}: CategoryDotProps) {
  const dotClass = isCategoryColor(color)
    ? CATEGORY_DOT_CLASSES[color]
    : "bg-muted-foreground";

  const sizeClass = { sm: "size-2.5", md: "size-4", lg: "size-6" }[size];

  return (
    <div
      className={cn("rounded-full", sizeClass, dotClass, className)}
      aria-hidden="true"
    />
  );
}
