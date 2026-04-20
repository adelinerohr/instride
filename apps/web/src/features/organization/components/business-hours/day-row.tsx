import {
  DayOfWeek,
  normalizeTimeSlot,
  TIME_OPTIONS,
  type TimeSlot,
} from "@instride/shared";
import { DAY_LABEL_MAP } from "@instride/shared";
import { useStore } from "@tanstack/react-form";
import { PlusIcon, XIcon } from "lucide-react";

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
      <div className="grid min-h-10 w-full grid-cols-5 px-6 items-start py-2">
        {/* Day label + open toggle */}
        <div className="col-span-5 max-h-10 sm:col-span-1 items-start">
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
                    fieldClassName="flex h-8 items-center! gap-3"
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

        <div className="col-span-5 sm:col-span-4 items-start">
          <group.Subscribe selector={(state) => state.values.isOpen}>
            {(isOpen) =>
              isOpen ? (
                <group.AppField
                  name="slots"
                  mode="array"
                  children={(field) => (
                    <div className="flex flex-row justify-between items-start">
                      <div className="flex flex-col gap-4">
                        {field.state.value.map((_, slotIndex) => (
                          <SlotRow
                            key={`${field.state.value[slotIndex].openTime}-${field.state.value[slotIndex].closeTime}`}
                            form={group}
                            fields={`slots[${slotIndex}]`}
                            canRemove={field.state.value.length > 1}
                            onRemove={() => field.removeValue(slotIndex)}
                          />
                        ))}
                      </div>

                      <div className="flex h-9 flex-row items-center">
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
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
                      </div>
                    </div>
                  )}
                />
              ) : (
                <span className="flex h-9 items-center pl-2 text-sm text-muted-foreground">
                  Closed
                </span>
              )
            }
          </group.Subscribe>

          {props.orgHint && (
            <p className="text-xs text-muted-foreground">
              {props.orgHint.isOpen && props.orgHint.slots.length > 0
                ? `Org hours: ${props.orgHint.slots
                    .map(
                      (s) =>
                        `${s.openTime.slice(0, 5)}–${s.closeTime.slice(0, 5)}`
                    )
                    .join(", ")}`
                : "Org closed this day"}
            </p>
          )}
        </div>
      </div>
    );
  },
});

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
      <div className="flex items-center gap-2 flex-wrap">
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
            className="h-7 w-7"
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
