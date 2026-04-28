import type { Conversation } from "@instride/api";
import { getUser } from "@instride/api";
import { CalendarIcon, MoreHorizontalIcon } from "lucide-react";

import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { AvatarGroup } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import { useParties } from "../../hooks/use-parties";

interface ConversationHeaderProps {
  conversation: Conversation;
  /** The viewer's member ID — used to pick "the other side" for display. */
  viewerMemberId: string;
}

export function ConversationHeader({
  conversation,
  viewerMemberId,
}: ConversationHeaderProps) {
  const { primary, dependent } = useParties(conversation, viewerMemberId);

  const dependentUser = dependent ? getUser({ rider: dependent }) : null;
  const primaryUser = getUser({ member: primary });

  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-6 py-4">
      <div className="flex items-center gap-3">
        {dependentUser ? (
          <AvatarGroup>
            <UserAvatar user={dependentUser} />
            <UserAvatar user={primaryUser} />
          </AvatarGroup>
        ) : (
          <UserAvatar user={primaryUser} />
        )}

        <div className="flex flex-col gap-0.5">
          <div className="font-semibold">{primaryUser.name}</div>
          {dependentUser && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>For</span>
              <span className="font-medium text-foreground">
                {dependentUser.name}
              </span>
              <Badge variant="amber">dependent</Badge>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="View calendar">
          <CalendarIcon className="size-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Conversation options"
              />
            }
          >
            <MoreHorizontalIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mute conversation</DropdownMenuItem>
            <DropdownMenuItem>Pin conversation</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
