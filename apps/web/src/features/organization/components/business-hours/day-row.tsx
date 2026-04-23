import {
  DayOfWeek,
  formatTimeSlot,
  normalizeTimeSlot,
  TIME_OPTIONS,
  type TimeSlot,
} from "@instride/shared";
import { DAY_LABEL_MAP } from "@instride/shared";
import { useStore } from "@tanstack/react-form";
import { AlertCircleIcon, PlusIcon, XIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { withFieldGroup } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

const DEFAULT_SLOT: TimeSlot = { openTime: "09:00", closeTime: "17:00" };

export const DayRow = withFieldGroup({
  defaultValues: {
    dayOfWeek: DayOfWeek.MON as DayOfWeek,
    isOpen: false as boolean,
    slots: [] as TimeSlot[],
  },
  props: {} as {
    orgHint?: {
      isOpen: boolean;
      slots: TimeSlot[];
    } | null;
  },
  render: ({ group, ...props }) => {
    const slots = useStore(group.store, (s) => s.values.slots);

    return (
      <div className="flex flex-col gap-3 px-4 py-3 sm:grid sm:grid-cols-5 sm:gap-y-2 sm:py-2">
        {/* Day label + checkbox — full width on mobile, first column on desktop */}
        <div className="flex items-center justify-between sm:col-span-1 sm:h-9 sm:justify-start">
          <group.Subscribe
            selector={(state) => ({
              dayOfWeek: state.values.dayOfWeek,
              isOpen: state.values.isOpen,
            })}
          >
            {({ dayOfWeek, isOpen }) => (
              <group.AppField
                name="isOpen"
                listeners={{
                  onChange: ({ value }) => {
                    if (value && slots.length === 0) {
                      group.setFieldValue("slots", [DEFAULT_SLOT]);
                    }
                  },
                }}
                children={(field) => (
                  <field.CheckboxField
                    fieldClassName="flex items-center gap-3"
                    label={DAY_LABEL_MAP[dayOfWeek].slice(0, 3)}
                    labelClassName={cn(
                      "text-sm font-medium w-10",
                      !isOpen && "text-muted-foreground"
                    )}
                  />
                )}
              />
            )}
          </group.Subscribe>

          {/* Org hint anchored to the right on mobile (since slots stack below) */}
          {props.orgHint && (
            <div className="sm:hidden">
              <OrgHint hint={props.orgHint} />
            </div>
          )}
        </div>

        {/* Slots area */}
        <div className="sm:col-span-4">
          <group.Subscribe selector={(state) => state.values.isOpen}>
            {(isOpen) =>
              isOpen ? (
                <group.AppField
                  name="slots"
                  mode="array"
                  children={(field) => (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      {/* Stacked slots */}
                      <div className="flex flex-col gap-2">
                        {field.state.value.map((slot, slotIndex) => (
                          <div
                            key={`${slot.openTime}-${slot.closeTime}-${slotIndex}`}
                            className="flex h-9 items-center"
                          >
                            <SlotRow
                              form={group}
                              fields={`slots[${slotIndex}]`}
                              canRemove={field.state.value.length > 1}
                              onRemove={() => field.removeValue(slotIndex)}
                            />
                          </div>
                        ))}

                        {/* Mobile: "Add slot" as a full-width text button below the stack */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="justify-start px-2 text-muted-foreground sm:hidden"
                          onClick={() => {
                            const last = field.state.value.at(-1);
                            const nextStart = last?.closeTime ?? "09:00";
                            field.pushValue({
                              openTime: nextStart,
                              closeTime: DEFAULT_SLOT.closeTime,
                            });
                          }}
                        >
                          <PlusIcon className="size-4 mr-1.5" />
                          Add time slot
                        </Button>
                      </div>

                      {/* Desktop: "+" and hint on the right */}
                      <div className="hidden h-9 shrink-0 items-center gap-1 sm:flex">
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  const last = field.state.value.at(-1);
                                  const nextStart = last?.closeTime ?? "09:00";
                                  field.pushValue({
                                    openTime: nextStart,
                                    closeTime: DEFAULT_SLOT.closeTime,
                                  });
                                }}
                              />
                            }
                          >
                            <PlusIcon className="size-4 shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent>New time slot</TooltipContent>
                        </Tooltip>

                        {props.orgHint && <OrgHint hint={props.orgHint} />}
                      </div>
                    </div>
                  )}
                />
              ) : (
                <div className="flex h-9 items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground sm:pl-2">
                    Closed
                  </span>
                  {/* Desktop-only hint; mobile hint lives next to the checkbox */}
                  {props.orgHint && (
                    <div className="hidden sm:block">
                      <OrgHint hint={props.orgHint} />
                    </div>
                  )}
                </div>
              )
            }
          </group.Subscribe>
        </div>
      </div>
    );
  },
});

function OrgHint({ hint }: { hint: { isOpen: boolean; slots: TimeSlot[] } }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 ml-auto"
          />
        }
      >
        <AlertCircleIcon className="size-4" />
      </TooltipTrigger>
      <TooltipContent>
        {hint.isOpen && hint.slots.length > 0
          ? `Org hours: ${hint.slots
              .map(
                (s) =>
                  `${formatTimeSlot(s.openTime, "9:00 AM")} - ${formatTimeSlot(s.closeTime, "5:00 PM")}`
              )
              .join(", ")}`
          : "Org closed this day"}
      </TooltipContent>
    </Tooltip>
  );
}

const SlotRow = withFieldGroup({
  defaultValues: {
    openTime: "09:00",
    closeTime: "17:00",
  },
  props: {} as {
    canRemove: boolean;
    onRemove: () => void;
  },
  render: ({ group, ...props }) => {
    return (
      <div className="flex items-center gap-2 w-full">
        <group.AppField
          name={`openTime`}
          children={(field) => (
            <field.SelectField
              defaultHeight
              alignItemWithTrigger
              items={TIME_OPTIONS}
              itemToValue={(t: { value: string }) => t.value}
              matchValue={(v) => normalizeTimeSlot(v, "09:00")}
              renderValue={(t: { label: string }) => t.label}
              fieldClassName="flex-1 sm:w-fit sm:flex-initial"
            />
          )}
        />

        <span className="text-muted-foreground text-sm shrink-0">to</span>

        <group.AppField
          name={`closeTime`}
          children={(field) => (
            <field.SelectField
              defaultHeight
              alignItemWithTrigger
              items={TIME_OPTIONS}
              itemToValue={(t: { value: string }) => t.value}
              matchValue={(v) => normalizeTimeSlot(v, "17:00")}
              renderValue={(t: { label: string }) => t.label}
              fieldClassName="flex-1 sm:w-fit sm:flex-initial"
            />
          )}
        />

        {props.canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={props.onRemove}
            aria-label="Remove slot"
          >
            <XIcon className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  },
});
