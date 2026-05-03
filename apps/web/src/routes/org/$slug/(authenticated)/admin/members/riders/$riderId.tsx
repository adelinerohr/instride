import {
  activityQueries,
  enrollmentOptions,
  getUser,
  membersOptions,
} from "@instride/api";
import { formatUSPhone } from "@instride/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  AlertTriangleIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
} from "lucide-react";

import { LessonCardList } from "@/features/lessons/components/card";
import { EmergencyContactModal } from "@/features/organization/components/members/modals/emergency-contact";
import {
  ProfileBody,
  ProfileCard,
  ProfileCardFooter,
  ProfileContent,
  ProfileHero,
  ProfilePage,
  ProfilePageHeader,
  ProfileSidebar,
  ProfileStatItem,
  ProfileStats,
} from "@/shared/components/layout/profile-page";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle } from "@/shared/components/ui/empty";
import { Progress } from "@/shared/components/ui/progress";
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

    await Promise.all([
      context.queryClient.ensureQueryData(
        activityQueries.listRider(rider.id, rider.memberId)
      ),
      context.queryClient.ensureQueryData(
        enrollmentOptions.byRiderId(rider.id)
      ),
    ]);

    return { rider };
  },
});

// TODO: add stats
function RouteComponent() {
  const { riderId } = Route.useParams();
  const { data: rider } = useSuspenseQuery(membersOptions.riderById(riderId));
  const { data: enrollments } = useSuspenseQuery(
    enrollmentOptions.byRiderId(riderId)
  );

  const emergencyContactModal = EmergencyContactModal.useModal();

  const user = getUser({ rider });
  const isPlaceholderEmail = user.email.includes("placeholder");

  const nextFourLessons = enrollments
    .filter((enrollment) => new Date(enrollment.instance.start) > new Date())
    .slice(0, 4);

  const lastSixLessons = enrollments
    .filter((enrollment) => new Date(enrollment.instance.start) < new Date())
    .slice(0, 6);

  return (
    <ProfilePage type="rider">
      <ProfilePageHeader name={user.name} />
      <ProfileHero user={user} createdAt={rider.createdAt} onEdit={() => {}} />
      <ProfileStats>
        <ProfileStatItem
          label="Total Lessons"
          value={enrollments.length.toString()}
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
        <ProfileContent>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Upcoming</span>
            <span className="text-xs text-muted-foreground">
              Next {nextFourLessons.length} lessons scheduled
            </span>
            <LessonCardList
              variant="compact"
              items={nextFourLessons.map((enrollment) => ({
                lesson: enrollment.instance,
                perspective: {
                  kind: "rider",
                  rider: enrollment.rider,
                  isEnrolled: true,
                },
              }))}
              emptyState={
                <Empty className="border border-dashed w-full">
                  <EmptyHeader>
                    <EmptyTitle>No lessons upcoming</EmptyTitle>
                  </EmptyHeader>
                </Empty>
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">History</span>
            <span className="text-xs text-muted-foreground">
              Last 6 lessons
            </span>
            <LessonCardList
              variant="compact"
              items={lastSixLessons.map((enrollment) => ({
                lesson: enrollment.instance,
                perspective: {
                  kind: "rider",
                  rider: enrollment.rider,
                  isEnrolled: true,
                },
              }))}
              emptyState={
                <Empty className="border border-dashed w-full">
                  <EmptyHeader>
                    <EmptyTitle>No lessons taken</EmptyTitle>
                  </EmptyHeader>
                </Empty>
              }
            />
          </div>
        </ProfileContent>
        <ProfileSidebar>
          <ProfileCard title="Contact">
            <TagGroup direction="vertical">
              <Tag icon={MailIcon}>
                {isPlaceholderEmail ? "Guardian managed" : user.email}
              </Tag>
              <Tag icon={PhoneIcon}>
                {user.phone ? formatUSPhone(user.phone) : "No phone number set"}
              </Tag>
            </TagGroup>
            <ProfileCardFooter
              items={[
                {
                  label: "Born",
                  value: format(
                    new Date(user.dateOfBirth ?? ""),
                    "MMM d, yyyy"
                  ),
                },
              ]}
            />
          </ProfileCard>
          <ProfileCard
            title="Emergency Contact"
            icon={AlertTriangleIcon}
            action={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => emergencyContactModal.open({ rider })}
              >
                <PencilIcon />
              </Button>
            }
          >
            {rider.emergencyContactName && rider.emergencyContactPhone ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">
                  {rider.emergencyContactName}
                </span>
                <Tag icon={PhoneIcon}>
                  {formatUSPhone(rider.emergencyContactPhone)}
                </Tag>
              </div>
            ) : (
              <span className="text-sm text-destructive">
                No emergency contact set
              </span>
            )}
          </ProfileCard>
          <ProfileCard
            title="Billing"
            action={<Badge variant="amber">10-Lesson Package</Badge>}
          >
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
            <ProfileCardFooter
              items={[
                { label: "Next bill", value: "May 18, 2026" },
                { label: "Amount", value: "$100" },
              ]}
            />
          </ProfileCard>
        </ProfileSidebar>
      </ProfileBody>
    </ProfilePage>
  );
}
