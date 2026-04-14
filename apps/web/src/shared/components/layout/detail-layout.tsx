import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/shared/lib/utils";
import { getInitials } from "@/shared/lib/utils/format";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "../ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../ui/item";

function DetailLayout({
  title,
  description,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  title: string;
  description: string;
}) {
  return (
    <div className="h-full overflow-y-auto">
      <div
        className={cn(
          "flex flex-col-reverse sm:flex-row gap-6 p-0 sm:p-4 items-start relative",
          className
        )}
        {...props}
      >
        <div className="flex flex-1 flex-col gap-4 w-full">{children}</div>
        <div className="sticky top-4 w-full sm:w-1/3 px-4 py-2 bg-secondary/50 text-secondary-foreground border border-secondary-border rounded-md flex flex-col gap-1">
          <span className="text-lg font-semibold">{title}</span>
          <p className="text-secondary-foreground/60">{description}</p>
        </div>
      </div>
    </div>
  );
}

function DetailCard({
  title,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  title: string;
}) {
  return (
    <div
      className={cn(
        "bg-white p-4 rounded-md border flex flex-col gap-4",
        className
      )}
      {...props}
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

function DetailRelationCard({
  title,
  className,
  description,
  children,
  renderEmpty = false,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDescription,
  ...props
}: React.ComponentProps<"div"> & {
  title: string;
  description?: string;
  renderEmpty?: boolean;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (renderEmpty) {
    <Empty>
      <EmptyHeader>
        {EmptyIcon && (
          <EmptyMedia variant="icon">
            <EmptyIcon className="size-6" />
          </EmptyMedia>
        )}
        <EmptyTitle>{emptyTitle}</EmptyTitle>
        <EmptyDescription>{emptyDescription}</EmptyDescription>
      </EmptyHeader>
    </Empty>;
  }

  return (
    <div
      className={cn("bg-white p-4 rounded-md border space-y-4", className)}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function DetailAvatarItem({
  imageSrc,
  name,
  content,
  action,
  className,
  ...props
}: React.ComponentProps<typeof Item> & {
  imageSrc?: string | null;
  name: string;
  content: string;
  action?: React.ReactNode;
}) {
  return (
    <Item variant="outline" className={className} {...props}>
      <ItemMedia>
        <Avatar size="lg">
          <AvatarImage src={imageSrc || undefined} alt={name} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{name}</ItemTitle>
        <ItemDescription>{content}</ItemDescription>
      </ItemContent>
      {action && <ItemActions>{action}</ItemActions>}
    </Item>
  );
}

function DetailIconItem({
  title,
  content,
  icon: Icon,
  className,
  action,
  ...props
}: React.ComponentProps<typeof Item> & {
  title: string;
  content?: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <Item variant="outline" className={className} {...props}>
      <ItemMedia variant="icon">
        <Icon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        {content && <ItemDescription>{content}</ItemDescription>}
      </ItemContent>
      {action && <ItemActions>{action}</ItemActions>}
    </Item>
  );
}

function DetailItem({
  title,
  content,
  icon: Icon,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "content"> & {
  title: string;
  content: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className={cn("flex items-center gap-4", className)} {...props}>
      <div className="size-10 bg-secondary flex items-center justify-center rounded-sm">
        <Icon strokeWidth={1} className="text-secondary-foreground size-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="text-sm font-medium">{content}</span>
      </div>
    </div>
  );
}

export {
  DetailAvatarItem,
  DetailIconItem,
  DetailCard,
  DetailItem,
  DetailLayout,
  DetailRelationCard,
};
