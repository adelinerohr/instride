import { DayOfWeek } from "@instride/shared";
import { DAY_LABEL_MAP } from "@instride/utils";
import {
  formatTimeLabel,
  normalizeTimeSlot,
  TIME_OPTIONS,
} from "@instride/utils";
import { useStore } from "@tanstack/react-form";

import { Badge } from "@/shared/components/ui/badge";
import { withFieldGroup } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

export const DayRow = withFieldGroup({
  defaultValues: {
    dayOfWeek: DayOfWeek.MON as DayOfWeek,
    isOpen: false as boolean,
    openTime: null as string | null,
    closeTime: null as string | null,
  },
  props: {} as {
    /** Effective org hours shown as a hint when trainer inherits */
    orgHint?: {
      isOpen: boolean;
      openTime: string | null;
      closeTime: string | null;
    } | null;
    /** Whether to show the "Inherit from org" toggle */
    showInheritToggle?: boolean;
    inheritsFromOrg?: boolean;
    onInheritChange?: (_inherits: boolean) => void;
    /** Clamp time selections to within these bounds */
    clampTo?: {
      openTime: string;
      closeTime: string;
    } | null;
  },
  render: ({ group, ...props }) => {
    const {
      clampTo,
      orgHint,
      showInheritToggle,
      inheritsFromOrg,
      onInheritChange,
    } = props;

    const dayOfWeek = useStore(group.store, (s) => s.values.dayOfWeek);
    const isOpen = useStore(group.store, (s) => s.values.isOpen);

    const clampOpen = clampTo
      ? normalizeTimeSlot(clampTo.openTime, "00:00")
      : null;
    const clampClose = clampTo
      ? normalizeTimeSlot(clampTo.closeTime, "23:30")
      : null;

    const filteredOpen = clampTo
      ? TIME_OPTIONS.filter((t) => t.value >= clampOpen!)
      : TIME_OPTIONS;

    const filteredClose = clampTo
      ? TIME_OPTIONS.filter((t) => t.value <= clampClose!)
      : TIME_OPTIONS;

    const isInheriting = showInheritToggle && inheritsFromOrg;

    return (
      <div
        className={cn(
          "grid items-center gap-3 py-3 border-b last:border-b-0",
          "grid-cols-[6rem_auto]"
        )}
      >
        {/* Day label + open toggle */}
        <div className="flex items-center gap-2 pl-2">
          <group.AppField
            name="isOpen"
            children={(field) => (
              <field.CheckboxField
                label={DAY_LABEL_MAP[dayOfWeek].slice(0, 3)}
                labelClassName={cn(
                  "text-sm font-medium w-10",
                  (!isOpen || isInheriting) && "text-muted-foreground"
                )}
              />
            )}
          />
        </div>

        {/* Hours or closed/inherit state */}
        <div className="flex items-center gap-2 flex-wrap">
          {isInheriting ? (
            <span className="text-sm text-muted-foreground">
              {orgHint?.isOpen
                ? `Inherits org hours (${formatTimeLabel(orgHint.openTime)} – ${formatTimeLabel(orgHint.closeTime)})`
                : "Closed (org default)"}
            </span>
          ) : !isOpen ? (
            <span className="text-sm text-muted-foreground">Closed</span>
          ) : (
            <>
              <group.AppField
                name="openTime"
                children={(field) => (
                  <field.SelectField
                    alignItemWithTrigger
                    items={filteredOpen}
                    itemToValue={(t) => t.value}
                    matchValue={(v) => normalizeTimeSlot(v, "09:00")}
                    renderValue={(t) => t.label}
                    fieldClassName="w-28"
                  />
                )}
              />

              <span className="text-muted-foreground text-sm">to</span>

              <group.AppField
                name="closeTime"
                children={(field) => (
                  <field.SelectField
                    alignItemWithTrigger
                    items={filteredClose}
                    itemToValue={(t) => t.value}
                    matchValue={(v) => normalizeTimeSlot(v, "17:00")}
                    renderValue={(t) => t.label}
                    fieldClassName="w-28"
                  />
                )}
              />
            </>
          )}

          {/* Inherit toggle for trainer rows */}
          {showInheritToggle && (
            <button
              type="button"
              onClick={() => onInheritChange?.(!inheritsFromOrg)}
              className="ml-auto"
            >
              <Badge
                variant={inheritsFromOrg ? "secondary" : "outline"}
                className="cursor-pointer text-xs"
              >
                {inheritsFromOrg ? "Using org hours" : "Custom"}
              </Badge>
            </button>
          )}
        </div>
      </div>
    );
  },
});
