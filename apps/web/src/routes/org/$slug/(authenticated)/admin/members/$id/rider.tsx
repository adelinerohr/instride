import {
  boardsOptions,
  enrollmentOptions,
  membersOptions,
  levelOptions,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

import { RiderOverview } from "@/features/organization/components/members/profile/rider/overview";
import { RiderActivityTab } from "@/features/organization/components/members/profile/rider/tabs/activity";
import { RiderLessonsTab } from "@/features/organization/components/members/profile/rider/tabs/lessons";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/shared/components/ui/tabs";

export enum RiderTab {
  Activity = "activity",
  Lessons = "lessons",
  Payments = "payments",
}

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/members/$id/rider"
)({
  component: RouteComponent,
  validateSearch: z.object({
    tab: z.enum(RiderTab),
  }),
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(
      membersOptions(context.organization.id).byId(params.id)
    );
    context.queryClient.ensureQueryData(
      boardsOptions.list({ memberId: params.id, isTrainer: false })
    );
    context.queryClient.ensureQueryData(
      levelOptions(context.organization.id).all()
    );
    context.queryClient.ensureQueryData(
      enrollmentOptions(context.organization.id).myEnrollments()
    );
  },
});

function RouteComponent() {
  const { tab } = Route.useSearch();
  const { organization } = Route.useRouteContext();
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();

  const { data: membership, isLoading } = useSuspenseQuery(
    membersOptions(organization.id).byId(id)
  );

  const handleTabChange = (value: RiderTab) => {
    navigate({
      search: {
        tab: value,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 h-full">
        <div className="h-40 rounded-xl bg-muted" />
        <div className="h-40 rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 h-full">
      <RiderOverview member={membership} />
      <div className="bg-card rounded-md border">
        <Tabs
          value={tab}
          onValueChange={(value) => handleTabChange(value)}
          className="w-full"
        >
          <div className="w-full border-b">
            <TabsList variant="line" className="px-4 pt-2">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="activity" className="p-4">
            <RiderActivityTab member={membership} />
          </TabsContent>
          <TabsContent value="lessons" className="p-4">
            <RiderLessonsTab member={membership} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
