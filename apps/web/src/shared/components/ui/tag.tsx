import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/shared/lib/utils";

function TagGroup({
  className,
  direction = "horizontal",
  ...props
}: React.ComponentProps<"div"> & { direction?: "horizontal" | "vertical" }) {
  return (
    <div
      className={cn(
        "flex",
        direction === "horizontal"
          ? "flex-row items-center gap-4"
          : "flex-col items-start gap-2",
        className
      )}
      data-slot="tag-group"
      {...props}
    />
  );
}

function Tag({
  icon: Icon,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: LucideIcon;
}) {
  return (
    <div
      className={cn("flex items-center gap-2", className)}
      data-slot="tag"
      {...props}
    >
      {Icon && <Icon className="size-3 text-muted-foreground" />}
      <span className="text-xs text-muted-foreground">{children}</span>
    </div>
  );
}

export { TagGroup, Tag };
