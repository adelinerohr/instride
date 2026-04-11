import { membersOptions, type types } from "@instride/api";
import { useStore } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckIcon, SearchIcon, UsersIcon, XIcon } from "lucide-react";
import * as React from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
} from "@/shared/components/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { withForm } from "@/shared/hooks/form";
import { cn } from "@/shared/lib/utils";
import { getInitials } from "@/shared/lib/utils/format";

import { lessonFormOpts } from "../../lib/new-lesson.form";

export const LessonRidersFormSection = withForm({
  ...lessonFormOpts,
  props: {
    isUnlocked: false as boolean,
  },
  render: ({ form, isUnlocked }) => {
    const { data: riders } = useSuspenseQuery(membersOptions.riders());
    const [isOpen, setIsOpen] = React.useState(false);

    // Auto-open once both previous steps are done
    const wasUnlocked = React.useRef(false);
    React.useEffect(() => {
      if (isUnlocked && !wasUnlocked.current) {
        wasUnlocked.current = true;
        setIsOpen(true);
      }
    }, [isUnlocked]);

    const boardId = useStore(form.store, (state) => state.values.boardId);
    const levelId = useStore(form.store, (state) => state.values.levelId);

    const filteredRiders = riders.filter(
      (rider) =>
        rider.boardAssignments?.some(
          (assignment) => assignment.boardId === boardId
        ) && rider.ridingLevelId === levelId
    );

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card
          className={!isUnlocked ? "opacity-60 pointer-events-none" : undefined}
        >
          <CardHeader>
            <CardTitle>Riders</CardTitle>
            <CardDescription>Add riders to the lesson</CardDescription>
          </CardHeader>
          <CollapsibleContent className="space-y-4">
            <CardContent>
              <form.Field
                name="riderIds"
                children={(field) => (
                  <RiderPicker
                    riders={filteredRiders}
                    value={field.state.value ?? []}
                    onChange={field.handleChange}
                  />
                )}
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  },
});

// ─── RiderPicker ────────────────────────────────────────────────────────────

const MAX_DISPLAY = 6;

type RiderPickerProps = {
  riders: types.Rider[];
  value: { id: string }[];
  onChange: (value: { id: string }[]) => void;
};

function RiderPicker({ riders, value, onChange }: RiderPickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedSet = new Set(value);
  const selectedRiders = riders.filter((r) => selectedSet.has({ id: r.id }));
  const displayedRiders = selectedRiders.slice(0, MAX_DISPLAY);
  const overflowCount = selectedRiders.length - MAX_DISPLAY;

  const toggleRider = (riderId: string) => {
    if (selectedSet.has({ id: riderId })) {
      onChange(value.filter(({ id }) => id !== riderId));
    } else {
      onChange([...value, { id: riderId }]);
    }
  };

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal bg-transparent"
            />
          }
        >
          Search and add riders to this lesson
          <SearchIcon />
        </PopoverTrigger>
        <PopoverContent className="w-(--anchor-width) p-0">
          <Command>
            <CommandInput placeholder="Search for a rider" />
            <CommandList>
              <CommandEmpty>No riders found</CommandEmpty>
              <CommandGroup>
                {riders.map((rider) => (
                  <CommandItem
                    key={rider.id}
                    value={rider.id}
                    onSelect={() => toggleRider(rider.id)}
                  >
                    <Avatar className="size-6">
                      <AvatarImage
                        src={rider.member?.authUser?.image ?? undefined}
                      />
                      <AvatarFallback>
                        {getInitials(rider.member?.authUser?.name ?? "")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{rider.member?.authUser?.name ?? ""}</span>
                    <CheckIcon
                      className={cn(
                        "ml-auto",
                        selectedSet.has({ id: rider.id })
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedRiders.length > 0 ? (
        <div className="flex items-center -space-x-2">
          {displayedRiders.map((rider) => (
            <Tooltip key={rider.id}>
              <TooltipTrigger render={<div className="relative group" />}>
                <Avatar className="h-10 w-10 border-2 border-background">
                  <AvatarImage
                    src={rider.member?.authUser?.image ?? undefined}
                  />
                  <AvatarFallback>
                    {getInitials(rider.member?.authUser?.name ?? "")}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => toggleRider(rider.id)}
                  className="cursor-pointer absolute -top-1 -right-1 h-5 w-5 rounded-full bg-muted border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XIcon className="size-3 shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {rider.member?.authUser?.name ?? ""}
              </TooltipContent>
            </Tooltip>
          ))}
          {overflowCount > 0 && (
            <div className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-sm font-medium">
              +{overflowCount}
            </div>
          )}
        </div>
      ) : (
        <Empty className="w-full border border-dashed">
          <EmptyHeader>
            <EmptyMedia>
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>No riders selected</EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
