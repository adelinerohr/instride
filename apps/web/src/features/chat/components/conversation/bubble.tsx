import type { Message } from "@instride/api";
import { getUser } from "@instride/api";
import { format } from "date-fns";

import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { cn } from "@/shared/lib/utils";

import type { MessageRunPosition } from "../../utils/grouping";

interface MessageBubbleProps {
  message: Message;
  direction: "own" | "other";
  position: MessageRunPosition;
}

export function MessageBubble({
  message,
  direction,
  position,
}: MessageBubbleProps) {
  const showSenderLabel =
    direction === "other" && (position === "first" || position === "only");
  const showAvatar =
    direction === "other" && (position === "last" || position === "only");
  const showTimestamp = position === "last" || position === "only";

  const runSpacing =
    position === "first" || position === "only" ? "mt-2" : "mt-0.5";

  // Soft-deleted messages render as a placeholder, not the original body.
  const isDeleted = message.deletedAt !== null;

  const senderUser = getUser({ member: message.sender });

  return (
    <div
      className={cn(
        "flex w-full",
        direction === "own" ? "justify-end" : "justify-start",
        runSpacing
      )}
    >
      <div
        className={cn(
          "flex max-w-[70%] gap-2",
          direction === "own" ? "flex-row-reverse" : "flex-row"
        )}
      >
        {direction === "other" && (
          <div className="w-8 shrink-0">
            {showAvatar && <UserAvatar user={senderUser} size="sm" />}
          </div>
        )}

        <div className="flex flex-col gap-1">
          {showSenderLabel && (
            <span className="text-sm font-medium text-foreground">
              {senderUser.name}
            </span>
          )}
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm",
              direction === "own"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-card text-card-foreground rounded-bl-sm",
              isDeleted && "italic opacity-60"
            )}
          >
            {isDeleted ? "Message deleted" : message.body}
          </div>
          {showTimestamp && (
            <span
              className={cn(
                "text-[10px] text-muted-foreground",
                direction === "own" ? "text-right" : "text-left"
              )}
            >
              {format(new Date(message.createdAt), "h:mm aa")}
              {message.editedAt && !isDeleted && " · edited"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
