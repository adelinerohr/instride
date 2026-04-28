import { type ConversationSummary } from "@instride/api";
import {
  isAfter,
  isSameDay,
  isYesterday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { PlusIcon } from "lucide-react";
import * as React from "react";

import { InputSearch } from "@/shared/components/fragments/input-search";
import { Button } from "@/shared/components/ui/button";
import { DialogTrigger } from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { cn } from "@/shared/lib/utils";

import { ConversationItem } from "./conversation-item";
import {
  NewConversationModal,
  newConversationModalHandler,
} from "./new-conversation-modal";

interface ChatLayoutProps {
  conversations: ConversationSummary[];
  activeConversationId?: string;
  searchQuery?: string;
  onSearchQueryChange: (query: string | undefined) => void;
  onSelectConversation: (id: string) => void;
  children: React.ReactNode;
  viewerMemberId: string;
}

export function ChatLayout({
  conversations,
  activeConversationId,
  searchQuery,
  onSearchQueryChange,
  onSelectConversation,
  children,
  viewerMemberId,
}: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const groupedConversations = React.useMemo(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisMonth = startOfMonth(now);

    type ChatGroup = {
      label: string;
      conversations: ConversationSummary[];
    };

    const groups: ChatGroup[] = [
      { label: "Today", conversations: [] },
      { label: "Yesterday", conversations: [] },
      { label: "This Week", conversations: [] },
      { label: "This Month", conversations: [] },
      { label: "Older", conversations: [] },
    ];

    const sortedConversations = [...conversations].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    for (const conversation of sortedConversations) {
      const conversationDate = new Date(conversation.createdAt);
      if (isSameDay(conversationDate, now)) {
        groups[0]?.conversations.push(conversation);
      } else if (isYesterday(conversationDate)) {
        groups[1]?.conversations.push(conversation);
      } else if (isAfter(conversationDate, thisWeekStart)) {
        groups[2]?.conversations.push(conversation);
      } else if (isAfter(conversationDate, thisMonth)) {
        groups[3]?.conversations.push(conversation);
      } else {
        groups[4]?.conversations.push(conversation);
      }
    }

    return groups.filter((group) => group.conversations.length > 0);
  }, [conversations]);

  const filteredConversations = React.useMemo(() => {
    if (!searchQuery) return conversations;
    return conversations.filter((conversation) => {
      return conversation.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    });
  }, [conversations, searchQuery]);

  const isSearchMode = searchQuery && searchQuery.length > 0;

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div
        className={cn(
          "flex h-full shrink-0 flex-col border-r border-border/50 transition-all duration-300 bg-sidebar",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden border-r-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="shrink-0 space-y-2 p-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold font-display">Messages</span>
            <DialogTrigger
              handle={newConversationModalHandler}
              render={<Button variant="ghost" size="icon" />}
            >
              <PlusIcon />
            </DialogTrigger>
          </div>

          {/* Search Input */}
          <InputSearch
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="h-8 bg-white"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 px-2 pb-4">
              {isSearchMode && filteredConversations.length === 0 && (
                <div className="px-3 py-4 text-center text-muted-foreground text-sm">
                  No chats found for "{searchQuery}"
                </div>
              )}
              {isSearchMode && filteredConversations.length > 0 && (
                <div>
                  <div className="mb-1 px-3 py-1 text-muted-foreground text-xs font-medium">
                    Search Results
                  </div>
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isActive={conversation.id === activeConversationId}
                        onClick={() => onSelectConversation(conversation.id)}
                        viewerMemberId={viewerMemberId}
                      />
                    ))}
                  </div>
                </div>
              )}
              {!isSearchMode &&
                groupedConversations.map((group) => (
                  <div key={group.label}>
                    <div className="mb-1 px-3 py-1 text-muted-foreground text-xs font-medium">
                      {group.label}
                    </div>
                    <div className="space-y-1">
                      {group.conversations.map((conversation) => (
                        <ConversationItem
                          key={conversation.id}
                          conversation={conversation}
                          isActive={conversation.id === activeConversationId}
                          onClick={() => onSelectConversation(conversation.id)}
                          viewerMemberId={viewerMemberId}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
      <NewConversationModal />
    </div>
  );
}
