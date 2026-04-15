import { useMarkAttendance, type types } from "@instride/api";
import { getUser } from "@instride/shared";
import { Link, useRouteContext } from "@tanstack/react-router";
import { isAfter, isSameDay } from "date-fns";
import { ArrowDownIcon, BanIcon, EllipsisVerticalIcon } from "lucide-react";

import { UserAvatarItem } from "@/shared/components/fragments/user-avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { Switch } from "@/shared/components/ui/switch";

type RidersListProps = {
  instance: types.LessonInstance;
  isPortal: boolean;
};

export function RidersList({ instance, isPortal }: RidersListProps) {
  const { organization } = useRouteContext({
    from: "/org/$slug/(authenticated)",
  });
  const updateAttendance = useMarkAttendance();

  if (instance.enrollments?.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BanIcon className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No riders</EmptyTitle>
          <EmptyDescription>
            No one has signed up for this {instance.service?.name ?? "lesson"}{" "}
            yet.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const showCheckIn =
    !isPortal &&
    (isSameDay(new Date(instance.start), new Date()) ||
      isAfter(new Date(), new Date(instance.start)));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium uppercase text-muted-foreground">
          Enrollments ({instance.enrollments?.length}/{instance.maxRiders})
        </span>
        {showCheckIn && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Check-in
            <ArrowDownIcon className="size-4" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {instance.enrollments?.map((enrollment) => {
          if (!enrollment.rider) return null;
          const user = getUser({ rider: enrollment.rider });

          return (
            <div
              className="flex items-center justify-between"
              key={enrollment.id}
            >
              <Link
                to="/org/$slug/admin/members/riders/$riderId"
                className="cursor-pointer w-full"
                params={{
                  riderId: enrollment.rider?.id ?? "",
                  slug: organization.slug,
                }}
              >
                <UserAvatarItem user={user} variant="outline" size="default" />
              </Link>

              {showCheckIn && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={enrollment.attended ?? false}
                    disabled={updateAttendance.isPending}
                    onCheckedChange={() =>
                      updateAttendance.mutate({
                        enrollmentId: enrollment.id,
                        request: { attended: !enrollment.attended },
                      })
                    }
                  />
                  <Button variant="ghost" size="icon">
                    <EllipsisVerticalIcon className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
