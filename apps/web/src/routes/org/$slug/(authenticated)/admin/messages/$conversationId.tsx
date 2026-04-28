import { chatOptions } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Conversation } from "@/features/chat/components/conversation";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/messages/$conversationId"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      chatOptions.getConversation(params.conversationId)
    );
    await context.queryClient.ensureInfiniteQueryData(
      chatOptions.listMessages(params.conversationId)
    );
  },
});

function RouteComponent() {
  const { conversationId } = Route.useParams();
  const { member } = Route.useRouteContext();

  const { data: conversation } = useSuspenseQuery(
    chatOptions.getConversation(conversationId)
  );

  return (
    <Conversation conversation={conversation} viewerMemberId={member.id} />
  );
}
