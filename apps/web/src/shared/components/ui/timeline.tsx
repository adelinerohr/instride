import * as React from "react";

import { cn } from "@/shared/lib/utils";

function Timeline({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline"
      className={cn("relative flex flex-col", className)}
      {...props}
    />
  );
}

function TimelineItem({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-item"
      className={cn("relative flex gap-3 pb-8 last:pb-0", className)}
      {...props}
    >
      {/* Indicator column */}
      <div className="relative flex flex-col items-center">
        <div className="size-2.5 shrink-0 rounded-full bg-primary/60 ring-4 ring-background z-10" />
        {/* Line - absolute positioned to span full height including padding */}
        <div
          className="absolute top-2.5 bottom-0 w-px bg-border [[data-slot=timeline-item]:last-child_&]:hidden"
          style={{ height: "calc(100% + 1rem)" }}
        />
      </div>
      <div className="flex-1 flex flex-col gap-1 -mt-0.5">{children}</div>
    </div>
  );
}

function TimelineDate({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-date"
      className={cn(
        "flex items-center gap-1 text-xs text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function TimelineTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="timeline-title"
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  );
}

function TimelineDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="timeline-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Timeline,
  TimelineDate,
  TimelineDescription,
  TimelineItem,
  TimelineTitle,
};
