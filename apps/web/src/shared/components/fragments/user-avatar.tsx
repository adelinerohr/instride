import type { types } from "@instride/api";

import { getInitials } from "@/shared/lib/utils/format";

import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

interface UserAvatarProps extends React.ComponentProps<typeof Avatar> {
  user: types.AuthUser;
}

export function UserAvatar({ user, ...props }: UserAvatarProps) {
  return (
    <Avatar {...props}>
      <AvatarImage src={user.image ?? undefined} alt={user.name} />
      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
    </Avatar>
  );
}
