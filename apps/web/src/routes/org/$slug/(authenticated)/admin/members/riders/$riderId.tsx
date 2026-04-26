import { activityQueries, getUser, membersOptions } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  AlertTriangleIcon,
  CalendarIcon,
  EditIcon,
  MailIcon,
  PhoneIcon,
} from "lucide-react";

import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import {
  ProfileBody,
  ProfileHero,
  ProfilePage,
  ProfilePageHeader,
  ProfileStatItem,
  ProfileStats,
} from "@/shared/components/layout/profile-page";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { Separator } from "@/shared/components/ui/separator";
import { Tag, TagGroup } from "@/shared/components/ui/tag";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/members/riders/$riderId"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    // TODO: prefetch enrollment data
    const rider = await context.queryClient.ensureQueryData(
      membersOptions.riderById(params.riderId)
    );
    await context.queryClient.ensureQueryData(
      activityQueries.listRider(rider.id, rider.memberId)
    );

    return { rider };
  },
});

// TODO: add edit emergency contact modal
// TODO: add stats
function RouteComponent() {
  const { riderId } = Route.useParams();
  const { data: rider } = useSuspenseQuery(membersOptions.riderById(riderId));

  const user = getUser({ rider });
  const isPlaceholderEmail = user.email.includes("placeholder");

  return (
    <ProfilePage>
      <ProfilePageHeader name={user.name} />
      <ProfileHero>
        <div className="flex items-center gap-4">
          <UserAvatar size="2xl" user={user} />
          <div className="flex flex-col gap-2">
            <span className="text-2xl font-semibold font-display">
              {user.name}
            </span>
            <TagGroup>
              <Tag icon={CalendarIcon}>
                Joined {format(new Date(rider.createdAt), "MMM d, yyyy")}
              </Tag>
            </TagGroup>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <EditIcon />
            Edit
          </Button>
        </div>
      </ProfileHero>
      <ProfileStats>
        <ProfileStatItem
          label="Total Lessons"
          value="47"
          description="+6 this month"
        />
        <ProfileStatItem
          label="Attendance"
          value="94%"
          description="last 90 days"
        />
        <ProfileStatItem
          label="Level"
          value={rider.level ? rider.level.name : "Unrestricted"}
        />
        <ProfileStatItem
          label="Streak"
          value="4 weeks"
          description="consecutive lessons"
        />
      </ProfileStats>
      <ProfileBody>
        <div className="flex flex-col gap-4">Lessons</div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 bg-card border rounded-lg p-4">
            <span className="text-sm font-medium">Contact</span>
            <TagGroup direction="vertical">
              <Tag icon={MailIcon}>
                {isPlaceholderEmail ? "Guardian managed" : user.email}
              </Tag>
              <Tag icon={PhoneIcon}>{user.phone ?? "No phone number set"}</Tag>
            </TagGroup>
            <Separator />
            <div className="flex items-center gap-4 justify-between">
              <span className="text-xs text-muted-foreground">Born</span>
              <span className="text-xs">
                {format(new Date(user.dateOfBirth ?? ""), "MMM d, yyyy")}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangleIcon className="size-3" />
              Emergency Contact
            </div>
            {rider.emergencyContactName && rider.emergencyContactPhone ? (
              <>
                <span className="text-sm font-medium">
                  {rider.emergencyContactName}
                </span>
                <Tag icon={PhoneIcon}>{rider.emergencyContactPhone}</Tag>
              </>
            ) : (
              <span className="text-sm text-destructive">
                No emergency contact set
              </span>
            )}
          </div>
          <div className="flex flex-col gap-4 bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 justify-between">
              <span className="text-sm font-semibold">Billing</span>
              <Badge variant="amber">10-Lesson Package</Badge>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground">
                Lessons remaining
              </span>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-semibold">6</span>
                <span className="text-xs text-muted-foreground">/ 10</span>
              </div>
              <Progress value={60} />
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 justify-between">
                <span className="text-xs text-muted-foreground">Next bill</span>
                <span className="text-xs font-medium">May 18, 2026</span>
              </div>
              <div className="flex items-center gap-2 justify-between">
                <span className="text-xs text-muted-foreground">Amount</span>
                <span className="text-xs font-medium">$100</span>
              </div>
            </div>
          </div>
        </div>
      </ProfileBody>
    </ProfilePage>
  );
}
