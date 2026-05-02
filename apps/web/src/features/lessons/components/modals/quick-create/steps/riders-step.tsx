import { getUser, type Rider, type Trainer } from "@instride/api";
import { useStore } from "@tanstack/react-form";
import { UsersIcon } from "lucide-react";
import * as React from "react";

import { quickCreateLessonFormOpts } from "@/features/lessons/lib/quick-create.form";
import { InputSearch } from "@/shared/components/fragments/input-search";
import {
  UserAvatar,
  UserAvatarBadge,
} from "@/shared/components/fragments/user-avatar";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Field, FieldContent, FieldLabel } from "@/shared/components/ui/field";
import { withForm } from "@/shared/hooks/use-form";
import { useIsMobile } from "@/shared/hooks/use-mobile";

interface Props {
  riders: Rider[];
  selectedTrainer?: Trainer;
  boardName: string;
}

export const RidersStep = withForm({
  ...quickCreateLessonFormOpts,
  props: {} as Props,
  render: ({ form, riders, boardName, selectedTrainer }) => {
    const mobile = useIsMobile();
    const [searchQuery, setSearchQuery] = React.useState("");

    const MAX_VISIBLE = mobile ? 3 : 5;

    const filteredRiders = React.useMemo(() => {
      const filtered = selectedTrainer
        ? riders.filter((rider) => rider.memberId !== selectedTrainer.memberId)
        : riders;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return filtered;
      return filtered.filter((rider) =>
        getUser({ rider }).name.toLowerCase().includes(query)
      );
    }, [riders, searchQuery]);

    const selectedRiderIds = useStore(
      form.store,
      (state) => state.values.riderIds
    );

    const isSearching = searchQuery.trim().length > 0;
    const shouldCollapse = !isSearching && filteredRiders.length > MAX_VISIBLE;
    const visible = shouldCollapse
      ? filteredRiders.slice(0, MAX_VISIBLE)
      : filteredRiders;
    const hiddenCount = filteredRiders.length - MAX_VISIBLE;

    return (
      <div className="space-y-3">
        <p className="flex items-center gap-1 text-sm text-muted-foreground justify-between">
          <div className="flex items-center gap-1">
            <UsersIcon className="size-4" />
            <span className="font-semibold text-foreground">
              {selectedRiderIds.length}
            </span>
            selected
          </div>
          <div className="flex items-center gap-1">
            Showing riders assigned to
            <span className="font-semibold text-foreground">{boardName}</span>
          </div>
        </p>

        <form.Field name="riderIds">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            const selectedRiders = riders.filter((rider) =>
              field.state.value.includes(rider.id)
            );

            return (
              <div className="space-y-3">
                <InputSearch
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search riders..."
                />
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {visible.map((rider) => {
                    const checked = field.state.value.includes(rider.id);
                    const riderUser = getUser({ rider });
                    return (
                      <FieldLabel htmlFor={rider.id} key={rider.id}>
                        <Field
                          orientation="horizontal"
                          data-invalid={isInvalid}
                          className="items-center!"
                        >
                          <FieldContent className="flex-row gap-2 items-center">
                            <UserAvatar user={riderUser} size="sm" />
                            <span className="text-sm font-medium leading-tight">
                              {riderUser.name}
                            </span>
                          </FieldContent>
                          <Checkbox
                            id={rider.id}
                            checked={checked}
                            onCheckedChange={(checked) =>
                              field.handleChange(
                                checked
                                  ? [...field.state.value, rider.id]
                                  : field.state.value.filter(
                                      (id) => id !== rider.id
                                    )
                              )
                            }
                          />
                        </Field>
                      </FieldLabel>
                    );
                  })}
                  {shouldCollapse && (
                    <div className="flex items-center gap-2 rounded-lg border p-3 opacity-50 justify-center">
                      <div className="truncate text-sm font-medium text-muted-foreground">
                        + {hiddenCount} {hiddenCount === 1 ? "rider" : "riders"}
                      </div>
                    </div>
                  )}
                </div>
                {selectedRiders.length > 0 && (
                  <div className="flex items-center flex-wrap gap-2">
                    {selectedRiders.map((rider) => (
                      <UserAvatarBadge
                        key={rider.id}
                        user={getUser({ rider })}
                        clearable
                        onClear={() =>
                          field.handleChange(
                            field.state.value.filter((id) => id !== rider.id)
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          }}
        </form.Field>
      </div>
    );
  },
});
