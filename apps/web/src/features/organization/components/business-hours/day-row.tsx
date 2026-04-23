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

/**
 * A single day's row in the business hours editor.
 *
 * Layout:
 *   [Day ☐] [Closed]                                 (when closed)
 *   [Day ☑] [09:00 → 17:00]              [+ Add slot] (single-slot open day)
 *   [Day ☑] [09:00 → 12:00]        [×]
 *           [15:00 → 18:00]        [×]   [+ Add slot] (multi-slot open day)
 *
 * No inheritance toggle (trainer rows no longer inherit — hours are always
 * explicit). No client-side clamping of time dropdowns — clamp violations
 * are surfaced by schema validation on submit instead, since with multiple
 * org slots per day filtering options would hide legitimate choices.
 */
export const DayRow = withFieldGroup({
  defaultValues: {
    dayOfWeek: DayOfWeek.MON as DayOfWeek,
    isOpen: false as boolean,
    slots: [] as TimeSlot[],
  },
  props: {} as {
    /**
     * Optional visual hint showing the org's slots for this day, rendered
     * under trainer rows so the user knows what windows they have to stay
     * inside. Purely informational; no enforcement here.
     */
    orgHint?: {
      isOpen: boolean;
      slots: TimeSlot[];
    } | null;
  },
  render: ({ group, ...props }) => {
    const slots = useStore(group.store, (s) => s.values.slots);

    return (
      <div className="grid w-full grid-cols-5 px-4 py-2 gap-y-2">
        {/* Day label + open toggle — always on the first row */}
        <div className="col-span-5 sm:col-span-1 flex items-center h-9">
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
        </div>

        {/* Slots area + trailing controls */}
        <div className="col-span-5 sm:col-span-4">
          <group.Subscribe selector={(state) => state.values.isOpen}>
            {(isOpen) =>
              isOpen ? (
                <group.AppField
                  name="slots"
                  mode="array"
                  children={(field) => (
                    <div className="flex items-start justify-between gap-2">
                      {/* Left: stacked slots */}
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
                      </div>

                      {/* Right: + and hint, aligned to the first slot row */}
                      <div className="flex h-9 items-center gap-1 shrink-0">
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
                  <span className="pl-2 text-sm text-muted-foreground">
                    Closed
                  </span>
                  {props.orgHint && <OrgHint hint={props.orgHint} />}
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
      <div className="flex items-center gap-2">
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
              fieldClassName="w-fit"
            />
          )}
        />

        <span className="text-muted-foreground text-sm">to</span>

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
              fieldClassName="w-fit"
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
