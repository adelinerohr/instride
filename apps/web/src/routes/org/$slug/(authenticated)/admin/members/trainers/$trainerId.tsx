import {
  businessHoursOptions,
  getUser,
  instanceOptions,
  membersOptions,
} from "@instride/api";
import {
  formatUSPhone,
  isTrainerWorkingOnDay,
  pluralize,
  resolveEffectiveBusinessHours,
} from "@instride/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfWeek,
} from "date-fns";
import { ChevronRightIcon, MailIcon, PhoneIcon } from "lucide-react";

import { LessonCardList } from "@/features/lessons/components/card";
import {
  ProfileBody,
  ProfileCard,
  ProfileContent,
  ProfileHero,
  ProfilePage,
  ProfilePageHeader,
  ProfileSidebar,
  ProfileStatItem,
  ProfileStats,
} from "@/shared/components/layout/profile-page";
import { buttonVariants } from "@/shared/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Empty, EmptyTitle, EmptyHeader } from "@/shared/components/ui/empty";
import { Tag, TagGroup } from "@/shared/components/ui/tag";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/members/trainers/$trainerId"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        membersOptions.trainerById(params.trainerId)
      ),
      context.queryClient.ensureQueryData(
        instanceOptions.byTrainer(params.trainerId)
      ),
      context.queryClient.ensureQueryData(
        businessHoursOptions.trainer(params.trainerId)
      ),
    ]);
  },
});

function RouteComponent() {
  const { slug, trainerId } = Route.useParams();
  const { data: trainer } = useSuspenseQuery(
    membersOptions.trainerById(trainerId)
  );
  const { data: lessons } = useSuspenseQuery(
    instanceOptions.byTrainer(trainerId)
  );
  const { data: businessHours } = useSuspenseQuery(
    businessHoursOptions.trainer(trainerId)
  );

  const user = getUser({ trainer });

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const thisWeekLessons = lessons.filter((lesson) =>
    isWithinInterval(new Date(lesson.start), { start: weekStart, end: weekEnd })
  );

  return (
    <ProfilePage type="trainer">
      <ProfilePageHeader name={user.name} />
      <ProfileHero
        user={user}
        createdAt={trainer.createdAt}
        onEdit={() => {}}
      />
      <ProfileStats>
        <ProfileStatItem
          label="Total Lessons"
          value={lessons.length.toString()}
        />
      </ProfileStats>
      <ProfileBody>
        <ProfileContent>
          <Card>
            <CardHeader>
              <CardTitle>Weekly Availability</CardTitle>
              <CardDescription>
                {format(weekStart, "MMM d")} -{" "}
                {isSameMonth(weekStart, weekEnd)
                  ? format(weekEnd, "d")
                  : format(weekEnd, "MMM d")}
              </CardDescription>
              <CardAction>
                <Link
                  to="/org/$slug/admin/calendar"
                  params={{ slug }}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  View Calendar
                  <ChevronRightIcon />
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const items = lessons.filter((lesson) =>
                  isSameDay(new Date(lesson.start), day)
                );
                const isOff = isTrainerWorkingOnDay({
                  day,
                  businessHours: resolveEffectiveBusinessHours(businessHours),
                });

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "flex flex-col border border-accent rounded-lg p-3 justify-center items-center",
                      isOff && "border-muted-foreground/20 bg-muted opacity-50"
                    )}
                  >
                    <span className="text-xs uppercase text-muted-foreground">
                      {format(day, "EE")}
                    </span>
                    <span className="font-semibold tabular-nums font-display">
                      {isOff ? "-" : items.length}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {isOff ? "off" : "lessons"}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>This Week's Lessons</CardTitle>
              <CardDescription>
                {thisWeekLessons.length}{" "}
                {pluralize(thisWeekLessons.length, "lesson")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LessonCardList
                variant="compact"
                items={thisWeekLessons.map((lesson) => ({
                  lesson,
                  perspective: { kind: "admin" },
                }))}
                emptyState={
                  <Empty className="border border-dashed w-full">
                    <EmptyHeader>
                      <EmptyTitle>No lessons this week</EmptyTitle>
                    </EmptyHeader>
                  </Empty>
                }
              />
            </CardContent>
          </Card>
        </ProfileContent>
        <ProfileSidebar>
          <ProfileCard title="Contact">
            <TagGroup direction="vertical">
              <Tag icon={MailIcon}>{user.email}</Tag>
              <Tag icon={PhoneIcon}>
                {user.phone ? formatUSPhone(user.phone) : "No phone number set"}
              </Tag>
            </TagGroup>
          </ProfileCard>
        </ProfileSidebar>
      </ProfileBody>
    </ProfilePage>
  );
}
