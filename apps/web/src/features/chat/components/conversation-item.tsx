import { getUser, type ConversationSummary } from "@instride/api";
import { format } from "date-fns";

import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { AvatarGroup } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";

import { useParties } from "../hooks/use-parties";

interface ConversationItemProps {
  conversation: ConversationSummary;
  isActive: boolean;
  onClick: () => void;
  viewerMemberId: string;
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
  viewerMemberId,
}: ConversationItemProps) {
  const { primary, dependent } = useParties(conversation, viewerMemberId);

  const dependentUser = dependent ? getUser({ rider: dependent }) : null;
  const primaryUser = getUser({ member: primary });

  return (
    <div
      className={cn(
        "group relative flex items-start gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white",
        isActive && "bg-white border"
      )}
      onClick={onClick}
    >
      {dependentUser ? (
        <AvatarGroup>
          <UserAvatar user={dependentUser} />
          <UserAvatar user={primaryUser} />
        </AvatarGroup>
      ) : (
        <UserAvatar user={primaryUser} />
      )}
      <div className="flex flex-col">
        <div className="font-medium text-sm">{primaryUser.name}</div>
        {dependentUser && (
          <div className="text-xs text-muted-foreground">
            For {dependentUser.name}
          </div>
        )}
        <div className="text-xs text-muted-foreground truncate">
          {conversation.lastMessage?.body ?? "No messages yet"}
        </div>
      </div>
      <div className="ml-auto text-[10px] text-muted-foreground">
        {format(new Date(conversation.lastMessageAt ?? ""), "h:mm aa")}
      </div>
    </div>
  );
}
