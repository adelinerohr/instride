import { activityQueries, getUser, membersOptions } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  CalendarIcon,
  CircleIcon,
  CoinsIcon,
  EllipsisVerticalIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  TrashIcon,
  type LucideIcon,
} from "lucide-react";
import React from "react";

import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { Page, PageHeader } from "@/shared/components/layout/page";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/shared/components/ui/item";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/members/riders/$riderId"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const rider = await context.queryClient.ensureQueryData(
      membersOptions.riderById(params.riderId)
    );
    await context.queryClient.ensureQueryData(
      activityQueries.listRider(rider.id, rider.memberId)
    );

    return { rider };
  },
});

function RouteComponent() {
  const { riderId, slug } = Route.useParams();
  const { data: rider } = useSuspenseQuery(membersOptions.riderById(riderId));

  const user = getUser({ rider });

  return (
    <Page className="gap-0! flex-1">
      <PageHeader title={user.name}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline" size="icon" />}
          >
            <EllipsisVerticalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <TrashIcon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>
      <div className="flex items-start divide-x h-full ">
        <div className="size-full divide-y border-b w-fit md:min-w-1/4">
          <div className="flex flex-col items-center justify-center p-6">
            <UserAvatar user={user} size="xl" />
            <span className="text-lg font-medium">{user.name}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
          <ItemGroup className="p-6">
            <div className="text-xs font-medium mb-2 text-muted-foreground">
              Personal Information
            </div>
            <RiderProperty
              icon={CalendarIcon}
              label="Joined at"
              value={format(
                rider.member?.createdAt ?? rider.createdAt,
                "MMMM d, yyyy"
              )}
              emptyText="No date set"
            />
            <RiderProperty
              icon={PhoneIcon}
              label="Phone"
              value={user.phone}
              emptyText="No phone number set"
            />
            <RiderProperty
              icon={MailIcon}
              label="Email"
              value={user.email}
              emptyText="No email address set"
            />
            <RiderProperty
              iconComponent={
                <CircleIcon
                  stroke={rider.level?.color ?? "gray"}
                  fill={rider.level?.color ?? "gray"}
                  className="size-4"
                />
              }
              label="Level"
              value={rider.level?.name}
              emptyText="Unrestricted"
            />
          </ItemGroup>
          <ItemGroup className="p-4 gap-0!">
            <RiderProperty
              icon={CoinsIcon}
              label="Credit Balance"
              value="10"
              emptyText="No credit balance set"
            />
          </ItemGroup>
        </div>
        <Tabs defaultValue="overview" className="flex-1">
          <div className="w-full border-b p-2 pb-0">
            <TabsList variant="line" className="gap-4">
              <TabsTrigger
                value="overview"
                nativeButton={false}
                render={
                  <Link
                    to="/org/$slug/admin/members/riders/$riderId"
                    params={{ slug, riderId }}
                  />
                }
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                nativeButton={false}
                render={
                  <Link
                    to="/org/$slug/admin/members/riders/$riderId/activity"
                    params={{ slug, riderId }}
                  />
                }
              >
                Activity
              </TabsTrigger>
              <TabsTrigger
                value="lessons"
                nativeButton={false}
                render={
                  <Link
                    to="/org/$slug/admin/members/riders/$riderId/activity"
                    params={{ slug, riderId }}
                  />
                }
              >
                Lessons
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="h-full p-4">
            <Outlet />
          </div>
        </Tabs>
      </div>
    </Page>
  );
}

function RiderProperty({
  icon: Icon,
  iconComponent,
  value,
  label,
  emptyText = "No value set",
}: {
  icon?: LucideIcon;
  iconComponent?: React.ReactNode;
  value?: string | null;
  label?: string;
  emptyText?: string;
}) {
  return (
    <Item size="xs" className="gap-3 items-center p-0">
      <ItemMedia className="self-center!">
        {iconComponent}
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </ItemMedia>
      <ItemContent>
        <ItemDescription>{label}</ItemDescription>
        <ItemTitle className={cn(!value && "text-muted-foreground", "text-xs")}>
          {value ?? emptyText}
        </ItemTitle>
      </ItemContent>
    </Item>
  );
}
