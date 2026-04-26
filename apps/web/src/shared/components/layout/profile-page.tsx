import { ArrowLeftIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/shared/lib/utils";

function ProfilePage({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col h-full p-4 space-y-4", className)}
      {...props}
    />
  );
}

// TODO: add back button
function ProfilePageHeader({
  name,
  className,
  ...props
}: React.ComponentProps<"div"> & { name: string }) {
  return (
    <div
      className={cn("flex items-center justify-start gap-2", className)}
      {...props}
    >
      <div className="flex items-center gap-2">
        <ArrowLeftIcon className="size-3" />
        <span className="text-sm">Members</span>
      </div>
      <span className="text-sm text-muted-foreground">/</span>
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
}

function ProfileHero({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex gap-4 items-start bg-card justify-between border rounded-lg p-4",
        className
      )}
      {...props}
    />
  );
}

function ProfileStats({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid grid-cols-2 md:flex gap-4", className)}
      {...props}
    />
  );
}

function ProfileStatItem({
  label,
  value,
  description,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  label: string;
  value: string;
  description?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-4 flex flex-col gap-2 w-full",
        className
      )}
      {...props}
    >
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold font-display">{value}</span>
      {description && (
        <span className="text-xs text-muted-foreground">{description}</span>
      )}
    </div>
  );
}

function ProfileBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-[2fr_0.9fr] gap-4",
        className
      )}
      {...props}
    />
  );
}

export {
  ProfilePage,
  ProfilePageHeader,
  ProfileHero,
  ProfileStats,
  ProfileStatItem,
  ProfileBody,
};
