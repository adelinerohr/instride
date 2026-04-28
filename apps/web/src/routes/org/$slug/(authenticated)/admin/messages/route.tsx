import { chatOptions } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import z from "zod";

import { ChatLayout } from "@/features/chat/components/sidebar";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/messages"
)({
  component: RouteComponent,
  validateSearch: z.object({
    filter: z
      .enum(["all", "riders", "guardians", "pending"])
      .optional()
      .default("all"),
    query: z.string().optional(),
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(chatOptions.listConversations());
  },
});

function RouteComponent() {
  const { member } = Route.useRouteContext();
  const { data: conversations } = useSuspenseQuery(
    chatOptions.listConversations()
  );

  const { conversationId } = useParams({ strict: false });
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const onSearchQueryChange = (query: string | undefined) => {
    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        query,
      }),
    });
  };

  const onSelectConversation = (conversationId: string) => {
    navigate({
      to: "/org/$slug/admin/messages/$conversationId",
      params: (prev) => ({
        ...prev,
        conversationId,
      }),
    });
  };

  return (
    <ChatLayout
      viewerMemberId={member.id}
      conversations={conversations}
      activeConversationId={conversationId}
      searchQuery={search.query}
      onSearchQueryChange={onSearchQueryChange}
      onSelectConversation={onSelectConversation}
    >
      <Outlet />
    </ChatLayout>
  );
}
