import type { AuthUser } from "@instride/api";
import { useNavigate, useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  ArrowLeftIcon,
  CalendarIcon,
  EditIcon,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";

import { cn } from "@/shared/lib/utils";

import { UserAvatar } from "../fragments/user-avatar";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Tag, TagGroup } from "../ui/tag";

function ProfilePage({
  type,
  className,
  ...props
}: React.ComponentProps<"div"> & { type: "trainer" | "rider" }) {
  return (
    <div
      data-type={type}
      className={cn(
        "flex flex-col h-full p-4 space-y-4 group/profile-page",
        className
      )}
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
  const { slug } = useParams({ from: "/org/$slug/(authenticated)" });
  const navigate = useNavigate();

  return (
    <div
      className={cn("flex items-center justify-start gap-2", className)}
      {...props}
    >
      <div
        className="flex items-center gap-2 group-data-[type=trainer]/profile-page:hidden cursor-pointer"
        onClick={() =>
          navigate({ to: "/org/$slug/admin/members/riders", params: { slug } })
        }
      >
        <ArrowLeftIcon className="size-3" />
        <span className="text-sm">Riders</span>
      </div>
      <div
        className="flex items-center gap-2 group-data-[type=rider]/profile-page:hidden cursor-pointer"
        onClick={() =>
          navigate({
            to: "/org/$slug/admin/members/trainers",
            params: { slug },
          })
        }
      >
        <ArrowLeftIcon className="size-3" />
        <span className="text-sm">Trainers</span>
      </div>
      <span className="text-sm text-muted-foreground">/</span>
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
}

function ProfileHero({
  user,
  createdAt,
  className,
  onEdit,
  ...props
}: React.ComponentProps<"div"> & {
  user: AuthUser;
  createdAt: string;
  onEdit: () => void;
}) {
  return (
    <div
      className={cn(
        "flex gap-4 items-start bg-card justify-between border rounded-lg p-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        <UserAvatar size="xl" user={user} />
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-semibold font-display">
            {user.name}
          </span>
          <TagGroup>
            <Tag icon={CalendarIcon}>
              Joined {format(new Date(createdAt), "MMM d, yyyy")}
            </Tag>
          </TagGroup>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onEdit}>
          <EditIcon />
          Edit
        </Button>
      </div>
    </div>
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

function ProfileSidebar({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-4", className)} {...props} />;
}

function ProfileContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-4", className)} {...props} />;
}

function ProfileCard({
  title,
  icon: Icon,
  action,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  title: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-4 space-y-3 w-full",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="size-3" />}
        <span className="text-sm font-semibold font-display">{title}</span>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ProfileCardFooter({
  items,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  items: { label: string; value: string }[];
}) {
  return (
    <>
      <Separator />
      <div className={cn("space-y-2", className)} {...props}>
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 justify-between"
          >
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <span className="text-xs font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export {
  ProfilePage,
  ProfilePageHeader,
  ProfileHero,
  ProfileStats,
  ProfileStatItem,
  ProfileBody,
  ProfileSidebar,
  ProfileContent,
  ProfileCard,
  ProfileCardFooter,
};
