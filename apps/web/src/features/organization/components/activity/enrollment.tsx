import { useGetLessonInstance, useMember, type types } from "@instride/api";
import { getUser } from "@instride/shared";
import { useLoaderData } from "@tanstack/react-router";
import { format } from "date-fns";

import { viewLessonModalHandler } from "@/features/lessons/components/modals/view-lesson";
import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/shared/components/ui/item";
import {
  TimelineDate,
  TimelineItem,
  TimelineTitle,
} from "@/shared/components/ui/timeline";

interface EnrollmentActivityProps {
  activity: types.Activity;
}

interface ActivityMetadata {
  instanceId: string;
  startTime: string;
  endTime: string;
  lessonName: string;
  trainerMemberId: string;
}

export function EnrollmentActivity({ activity }: EnrollmentActivityProps) {
  const { rider } = useLoaderData({
    from: "/org/$slug/(authenticated)/admin/members/riders/$riderId",
  });

  const metadata = activity.metadata as ActivityMetadata;

  if (!activity.actorMember) {
    return null;
  }

  const { data: trainer, isPending } = useMember(metadata.trainerMemberId);
  const { data: lesson, isPending: isLessonPending } = useGetLessonInstance(
    metadata.instanceId
  );

  if (isPending || isLessonPending) {
    return <div>Loading...</div>;
  }

  if (!trainer || !lesson) {
    throw new Error("Trainer or lesson not found");
  }

  const trainerUser = getUser({ member: trainer });
  const actorUser = getUser({ member: activity.actorMember });
  const riderUser = getUser({ rider });

  const isOwnAction = activity.actorMemberId === activity.ownerMemberId;

  const title = isOwnAction
    ? `${actorUser.name} booked a lesson with ${trainerUser.name}`
    : `${actorUser.name} booked a lesson for ${riderUser.name} with ${trainerUser.name}`;

  return (
    <TimelineItem>
      <TimelineDate>
        {format(activity.createdAt, "MMM d, yyyy h:mm a")}
      </TimelineDate>
      <TimelineTitle>{title}</TimelineTitle>
      <Item
        variant="outline"
        className="cursor-pointer mt-2"
        onClick={() => {
          viewLessonModalHandler.openWithPayload({
            lesson,
          });
        }}
      >
        <ItemMedia>
          <UserAvatar user={trainerUser} size="lg" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{metadata.lessonName}</ItemTitle>
          <ItemDescription>
            {format(new Date(metadata.startTime), "EEEE, MMMM d")} &middot;{" "}
            {format(new Date(metadata.startTime), "h:mm")} -{" "}
            {format(new Date(metadata.endTime), "h:mm a")}
          </ItemDescription>
        </ItemContent>
      </Item>
    </TimelineItem>
  );
}
