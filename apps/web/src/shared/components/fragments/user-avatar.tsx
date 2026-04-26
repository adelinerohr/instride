import type { AuthUser } from "@instride/api";

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
  return (
    <Avatar {...props}>
      <AvatarImage
        src={image ?? user?.image ?? undefined}
        alt={name ?? user?.name ?? ""}
      />
      <AvatarFallback>{getInitials(name ?? user?.name ?? "")}</AvatarFallback>
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

export { UserAvatar, UserAvatarItem };
