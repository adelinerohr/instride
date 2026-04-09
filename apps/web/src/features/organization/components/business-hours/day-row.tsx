import { formatDayOfWeek, type DayHours } from "@instride/shared";

import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  const value = `${String(h).padStart(2, "0")}:${m}`;
  const label = new Date(`1970-01-01T${value}`).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  return { value, label };
});

interface DayRowProps {
  day: DayHours;
  onChange: (updated: DayHours) => void;
  /** Effective org hours shown as a hint when trainer inherits */
  orgHint?: {
    isOpen: boolean;
    openTime: string | null;
    closeTime: string | null;
  } | null;
  /** Whether to show the "Inherit from org" toggle */
  showInheritToggle?: boolean;
  inheritsFromOrg?: boolean;
  onInheritChange?: (inherits: boolean) => void;
  /** Clamp time selections to within these bounds */
  clampTo?: {
    openTime: string;
    closeTime: string;
  } | null;
}

export function DayRow({
  day,
  onChange,
  orgHint,
  showInheritToggle,
  inheritsFromOrg,
  onInheritChange,
  clampTo,
}: DayRowProps) {
  const filteredOpen = clampTo
    ? TIME_OPTIONS.filter((t) => t.value >= clampTo.openTime)
    : TIME_OPTIONS;

  const filteredClose = clampTo
    ? TIME_OPTIONS.filter((t) => t.value <= clampTo.closeTime)
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
        <Checkbox
          checked={day.isOpen && !isInheriting}
          disabled={isInheriting}
          onCheckedChange={(checked) =>
            onChange({
              ...day,
              isOpen: checked,
              openTime: checked ? (day.openTime ?? "09:00") : null,
              closeTime: checked ? (day.closeTime ?? "17:00") : null,
            })
          }
        />
        <span
          className={cn(
            "text-sm font-medium w-10",
            (!day.isOpen || isInheriting) && "text-muted-foreground"
          )}
        >
          {formatDayOfWeek(day.dayOfWeek).slice(0, 3)}
        </span>
      </div>

      {/* Hours or closed/inherit state */}
      <div className="flex items-center gap-2 flex-wrap">
        {isInheriting ? (
          <span className="text-sm text-muted-foreground">
            {orgHint?.isOpen
              ? `Inherits org hours (${orgHint.openTime} – ${orgHint.closeTime})`
              : "Closed (org default)"}
          </span>
        ) : !day.isOpen ? (
          <span className="text-sm text-muted-foreground">Closed</span>
        ) : (
          <>
            <Select
              value={day.openTime ?? "09:00"}
              onValueChange={(v) => onChange({ ...day, openTime: v })}
            >
              <SelectTrigger className="w-28 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filteredOpen.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-muted-foreground text-sm">to</span>

            <Select
              value={day.closeTime ?? "17:00"}
              onValueChange={(v) => onChange({ ...day, closeTime: v })}
            >
              <SelectTrigger className="w-28 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filteredClose
                  .filter((t) => !day.openTime || t.value > day.openTime)
                  .map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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
}
