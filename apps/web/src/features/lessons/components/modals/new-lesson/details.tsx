import { RecurrenceFrequency } from "@instride/shared";
import { useStore } from "@tanstack/react-form";
import { format } from "date-fns";
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import * as React from "react";

import { lessonFormOpts } from "@/features/lessons/lib/new-lesson.form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  InputGroupAddon,
  InputGroupText,
} from "@/shared/components/ui/input-group";
import { Switch } from "@/shared/components/ui/switch";
import { withForm } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

export const DetailsSection = withForm({
  ...lessonFormOpts,
  props: {
    isOpen: true as boolean,
    onOpenChange: (_open: boolean) => {},
    isReady: false as boolean,
  },
  render: ({ form, isOpen, onOpenChange, isReady }) => {
    const [showCustomDetails, setShowCustomDetails] = React.useState(false);

    const start = useStore(form.store, (s: any) => s.values.start);
    const duration = useStore(form.store, (s: any) => s.values.duration);
    const maxRiders = useStore(form.store, (s: any) => s.values.maxRiders);
    const isRecurring = useStore(form.store, (s: any) => s.values.isRecurring);

    // Summary when collapsed
    const summaryParts: string[] = [];
    if (start) summaryParts.push(format(new Date(start), "MM/dd/yyyy HH:mm"));
    if (duration) summaryParts.push(`${duration}min`);
    if (maxRiders) summaryParts.push(`${maxRiders} riders`);
    if (isRecurring) summaryParts.push("Weekly");

    const hasValues = duration > 0 || maxRiders > 0;

    return (
      <Collapsible
        className={cn(
          "rounded-lg border",
          !isReady && "pointer-events-none opacity-50"
        )}
        open={isOpen}
        onOpenChange={onOpenChange}
      >
        <CollapsibleTrigger
          render={
            <button className="flex w-full items-center justify-between px-4 py-3" />
          }
        >
          <div className="flex items-center gap-2">
            {hasValues ? (
              <CheckCircle2Icon className="size-4 text-emerald-500" />
            ) : (
              <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">Details</span>
            {!isOpen && summaryParts.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {summaryParts.join(" · ")}
              </span>
            )}
            {!isReady && (
              <span className="ml-2 text-xs text-muted-foreground">
                Select a service first
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_0.3fr_0.3fr]">
            <form.AppField
              name="start"
              children={(field) => <field.DatetimeField label="Start" />}
            />
            <form.AppField
              name="duration"
              children={(field) => (
                <field.TextField
                  type="number"
                  step={15}
                  label="Duration"
                  inputGroup
                  inputMode="numeric"
                >
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>minutes</InputGroupText>
                  </InputGroupAddon>
                </field.TextField>
              )}
            />
            <form.AppField
              name="maxRiders"
              children={(field) => (
                <field.TextField
                  type="number"
                  inputMode="numeric"
                  step={1}
                  min={1}
                  max={10}
                  label="Max Riders"
                />
              )}
            />
          </div>
          <form.AppField
            name="isRecurring"
            listeners={{
              onChange: ({ value }) => {
                form.setFieldValue(
                  "recurrenceFrequency",
                  value ? RecurrenceFrequency.WEEKLY : null
                );
              },
            }}
            children={(field) => <field.SwitchField label="Is Recurring" />}
          />

          <div className="flex items-center justify-between rounded-lg border p-4">
            <span className="text-sm font-medium">
              Customize lesson name and notes
            </span>
            <Switch
              checked={showCustomDetails}
              onCheckedChange={setShowCustomDetails}
            />
          </div>
          {showCustomDetails && (
            <>
              <form.AppField
                name="name"
                children={(field) => <field.TextField label="Name" />}
              />
              <form.AppField
                name="notes"
                children={(field) => <field.TextareaField label="Notes" />}
              />
            </>
          )}
        </CollapsibleContent>
      </Collapsible>
    );
  },
});
