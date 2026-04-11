import { membersOptions } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";

import { MemberOverview } from "@/features/organization/components/members/profile/overview";
import { PageHeader } from "@/shared/components/layout/page";
import { Button } from "@/shared/components/ui/button";
import {
  Tabs,
  TabsLine,
  TabsLineTrigger,
  TabsContent,
} from "@/shared/components/ui/tabs";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/members/$id/"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(membersOptions.byId(params.id));
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: member, isLoading } = useSuspenseQuery(membersOptions.byId(id));

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-md bg-muted" />
        <div className="h-40 rounded-xl bg-muted" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Member not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={member.authUser?.name ?? ""}
        description={member.authUser?.email ?? ""}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: ".." })}
          >
            <ArrowLeftIcon className="size-4" />
            Members
          </Button>
        }
      />

      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="overview">
          <div className="border-b border-border px-6">
            <TabsLine>
              <TabsLineTrigger value="overview">Overview</TabsLineTrigger>
              <TabsLineTrigger value="enrollments">Enrollments</TabsLineTrigger>
            </TabsLine>
          </div>

          <div className="p-6">
            <TabsContent value="overview">
              <MemberOverview member={member} />
            </TabsContent>
            <TabsContent value="enrollments">
              <div className="max-w-xl">
                <div className="rounded-xl border border-border p-5 text-sm text-muted-foreground">
                  Member enrollment history will appear here. This requires a
                  member-specific enrollment endpoint.
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
