import { chatOptions } from "@instride/api";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircleIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/portal/messages/"
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    const conversations = await context.queryClient.ensureQueryData(
      chatOptions.listConversations()
    );
    if (conversations.length > 0) {
      throw Route.redirect({
        to: "/org/$slug/admin/messages/$conversationId",
        params: { conversationId: conversations[0].id },
        replace: true,
      });
    }
  },
});

function RouteComponent() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MessageCircleIcon />
        </EmptyMedia>
        <EmptyTitle>No conversations yet</EmptyTitle>
        <EmptyDescription>
          Create a new conversation to get started.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
