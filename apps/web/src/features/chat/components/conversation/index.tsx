import { chatOptions, type Conversation } from "@instride/api";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import * as React from "react";

import { Composer } from "./composer";
import { ConversationHeader } from "./header";
import { MessageList } from "./list";

interface ConversationProps {
  conversation: Conversation;
  viewerMemberId: string;
}

export function Conversation({
  conversation,
  viewerMemberId,
}: ConversationProps) {
  const { data } = useSuspenseInfiniteQuery(
    chatOptions.listMessages(conversation.id)
  );

  // Infinite query returns pages reverse-chronological (newest first).
  // Flatten to a single array, then reverse for chronological display.
  const messages = React.useMemo(
    () => data.pages.flatMap((p) => p.messages).reverse(),
    [data.pages]
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ConversationHeader
        conversation={conversation}
        viewerMemberId={viewerMemberId}
      />
      <MessageList messages={messages} viewerMemberId={viewerMemberId} />
      <Composer conversation={conversation} viewerMemberId={viewerMemberId} />
    </div>
  );
}
