import { useMarkAttendance, type types } from "@instride/api";
import { ArrowDownIcon, BanIcon, EllipsisVerticalIcon } from "lucide-react";

import { UserAvatar } from "@/shared/components/fragments/user-avatar";
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium uppercase text-muted-foreground">
          Signups ({instance.enrollments?.length}/{instance.maxRiders})
        </span>
        {!isPortal && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Check-in
            <ArrowDownIcon className="size-4" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {instance.enrollments?.map((enrollment) => {
          const authUser = enrollment.rider?.member?.authUser;

          return (
            <div
              className="flex items-center justify-between"
              key={enrollment.id}
            >
              <div className="flex items-center gap-3">
                <UserAvatar user={authUser!} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{authUser?.name}</span>
                  {authUser?.email && (
                    <span className="text-xs text-muted-foreground">
                      {authUser?.email}
                    </span>
                  )}
                </div>
              </div>

              {!isPortal && (
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
