import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { withFieldGroup } from "@/shared/hooks/use-form";

export const DatetimeFields = withFieldGroup({
  defaultValues: {
    date: "",
    time: "",
  },
  render: ({ group }) => {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <group.Field name="date">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name} required>
                  Date
                </FieldLabel>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        className="justify-between font-normal"
                      />
                    }
                  >
                    {field.state.value.length > 0
                      ? format(new Date(field.state.value), "PPP")
                      : "Select date"}
                    <ChevronDownIcon />
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      required
                      selected={new Date(field.state.value)}
                      captionLayout="dropdown"
                      defaultMonth={new Date(field.state.value)}
                      onSelect={(date) => {
                        field.handleChange(date.toISOString());
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </group.Field>
        <group.Field name="time">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name} required>
                  Start time
                </FieldLabel>
                <Input
                  type="time"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </group.Field>
      </div>
    );
  },
});
