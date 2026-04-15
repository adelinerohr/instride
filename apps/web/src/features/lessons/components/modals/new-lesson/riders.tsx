import { getUser, type types } from "@instride/api";
import { useStore } from "@tanstack/react-form";
import { ChevronDownIcon, UsersIcon } from "lucide-react";

import { lessonFormOpts } from "@/features/lessons/lib/new-lesson.form";
import { UserAvatarItem } from "@/shared/components/fragments/user-avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { withForm } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

export const RidersSection = withForm({
  ...lessonFormOpts,
  props: {
    riders: [] as types.Rider[],
    isOpen: true as boolean,
    onOpenChange: (_open: boolean) => {},
  },
  render: ({ form, riders, isOpen, onOpenChange }) => {
    const selectedRiders = useStore(
      form.store,
      (s: any) => s.values.riderIds as any[]
    );

    const count = selectedRiders?.length ?? 0;

    return (
      <Collapsible
        className="rounded-lg border"
        open={isOpen}
        onOpenChange={onOpenChange}
      >
        <CollapsibleTrigger
          render={
            <button className="flex w-full items-center justify-between px-4 py-3" />
          }
        >
          <div className="flex items-center gap-2">
            <UsersIcon className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Riders</span>
            {!isOpen && count > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {count} selected
              </span>
            )}
            {!isOpen && count === 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                Optional
              </span>
            )}
          </div>
          <ChevronDownIcon
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 border-t p-4">
          <form.AppField
            name="riderIds"
            children={(field) => (
              <field.MultiSelectField
                items={riders ?? []}
                itemToValue={(rider) => rider.id}
                itemToLabel={(rider) => getUser({ rider }).name}
                renderValue={(rider) => (
                  <UserAvatarItem user={getUser({ rider })} />
                )}
                label="Riders"
                placeholder="Select riders"
              />
            )}
          />
        </CollapsibleContent>
      </Collapsible>
    );
  },
});
