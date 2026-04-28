import type { Message } from "@instride/api";
import { MessageAttachmentType } from "@instride/shared";
import * as React from "react";

import { ScrollArea } from "@/shared/components/ui/scroll-area";

import { groupMessages } from "../../utils/grouping";
import { MessageBubble } from "./bubble";
import { InviteAttachment } from "./lesson-attachment/invite";
import { ProposalAttachment } from "./lesson-attachment/proposal";

interface MessageListProps {
  messages: Message[];
  viewerMemberId: string;
}

export function MessageList({ messages, viewerMemberId }: MessageListProps) {
  const grouped = React.useMemo(() => groupMessages(messages), [messages]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  console.log(grouped);

  return (
    <ScrollArea className="min-h-0 flex-1" ref={scrollRef}>
      <div className="flex flex-col gap-1 px-6 py-4">
        {grouped.map(({ message, position, showDayDivider, dayLabel }) => {
          const direction =
            message.senderId === viewerMemberId ? "own" : "other";
          const timestamp = new Date(message.createdAt);

          return (
            <React.Fragment key={message.id}>
              {showDayDivider && dayLabel && <DayDivider label={dayLabel} />}

              {renderMessageContent({
                message,
                direction,
                position,
                timestamp,
              })}
            </React.Fragment>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function renderMessageContent({
  message,
  direction,
  position,
  timestamp,
}: {
  message: Message;
  direction: "own" | "other";
  position: ReturnType<typeof groupMessages>[number]["position"];
  timestamp: Date;
}) {
  // Plain text
  if (!message.attachmentType) {
    return (
      <MessageBubble
        message={message}
        direction={direction}
        position={position}
      />
    );
  }

  // Lesson invite — references an existing instance, has a response row
  if (
    message.attachmentType === MessageAttachmentType.LESSON_REFERENCE &&
    message.referencedLessonInstance &&
    message.response
  ) {
    return (
      <InviteAttachment
        lesson={message.referencedLessonInstance}
        response={message.response}
        direction={direction}
        timestamp={timestamp}
      />
    );
  }

  // Lesson proposal — has metadata payload, has a response row
  if (
    message.attachmentType === MessageAttachmentType.LESSON_PROPOSAL &&
    message.attachmentMetadata &&
    message.response
  ) {
    return (
      <ProposalAttachment
        proposal={message.attachmentMetadata}
        response={message.response}
        direction={direction}
        timestamp={timestamp}
      />
    );
  }

  return null;
}

function DayDivider({ label }: { label: string }) {
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-border/60" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  );
}
