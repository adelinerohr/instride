import type { AuthUser } from "@instride/api";
import { XIcon } from "lucide-react";

import { categoryColorClasses, getUserColor } from "@/shared/lib/config/colors";
import { cn } from "@/shared/lib/utils";
import { getInitials } from "@/shared/lib/utils/format";

import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
  ItemDescription,
} from "../ui/item";

function UserAvatar({
  user,
  name,
  image,
  ...props
}: React.ComponentProps<typeof Avatar> & {
  user?: AuthUser;
  name?: string;
  image?: string | null;
}) {
  const color = user ? getUserColor(user.id) : "clay";
  const classes = categoryColorClasses(color).primary;
  return (
    <Avatar {...props}>
      <AvatarImage
        src={image ?? user?.image ?? undefined}
        alt={name ?? user?.name ?? ""}
      />
      <AvatarFallback className={cn(classes, "text-primary-foreground!")}>
        {getInitials(name ?? user?.name ?? "")}
      </AvatarFallback>
    </Avatar>
  );
}

function UserAvatarItem({
  user,
  description,
  className,
  ...props
}: React.ComponentProps<typeof Item> & {
  user: AuthUser;
  description?: string;
}) {
  const { size, ...rest } = props;

  return (
    <Item
      size={size ?? "xs"}
      className={cn(!size && "w-full p-0", className)}
      {...rest}
    >
      <ItemMedia>
        <UserAvatar
          user={user}
          size={!size || size === "xs" ? "sm" : "default"}
        />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{user.name}</ItemTitle>
        {description && <ItemDescription>{description}</ItemDescription>}
      </ItemContent>
    </Item>
  );
}

function UserAvatarBadge({
  user,
  clearable = false,
  onClear,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  user: AuthUser;
  clearable?: boolean;
  onClear?: () => void;
}) {
  const color = user ? getUserColor(user.id) : "clay";
  const classes = categoryColorClasses(color);

  return (
    <div
      className={cn(
        "rounded-full p-1 border flex items-center gap-1 pr-2",
        className,
        classes.bg,
        classes.border
      )}
      {...props}
    >
      <UserAvatar user={user} size="xs" />
      <span className={cn(classes.fg, "text-xs font-medium")}>{user.name}</span>
      {clearable && (
        <XIcon
          className={cn(classes.fg, "size-3 cursor-pointer")}
          onClick={onClear}
        />
      )}
    </div>
  );
}

export { UserAvatar, UserAvatarItem, UserAvatarBadge };
