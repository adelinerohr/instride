import type { Rider } from "@instride/api";
import { UsersIcon } from "lucide-react";

import { riderCreateLessonFormOpts } from "@/features/lessons/lib/rider.form";
import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { withForm } from "@/shared/hooks/use-form";

export const BookingForSection = withForm({
  ...riderCreateLessonFormOpts,
  props: {
    riders: [] as Rider[],
  },
  render: ({ form, riders }) => {
    const handleRiderChange = (newRiderId: string) => {
      form.setFieldValue("riderId", newRiderId);
      form.setFieldValue("boardId", "");
      form.setFieldValue("trainerId", "");
      form.setFieldValue("serviceId", "");
    };

    return (
      <div className="space-y-4 p-4 rounded-lg border-primary/30 border bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UsersIcon className="size-4" />
            <h3 className="font-medium">Booking for</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            You can switch any time
          </span>
        </div>
        <form.Field name="riderId">
          {(field) => (
            <div className="flex items-center w-full gap-4">
              {riders.map((rider) => (
                <button
                  key={rider.id}
                  type="button"
                  data-selected={field.state.value === rider.id}
                  className="flex w-full cursor-pointer items-center gap-4 p-3 rounded-lg border border-input bg-transparent data-selected:bg-white data-selected:border-primary/50"
                  onClick={() => handleRiderChange(rider.id)}
                >
                  <UserAvatar user={rider.member.authUser} />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      {rider.member.authUser.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {rider.level?.name ?? "Unrestricted"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </form.Field>
      </div>
    );
  },
});
