import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { useFieldContext } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

import { Field, FieldError, FieldLabel } from "../ui/field";

interface DateFieldProps extends Omit<
  React.ComponentProps<typeof Calendar>,
  "mode" | "selected" | "onSelect"
> {
  label: string;
  placeholder?: string;
  className?: string;
}

export function DateField({
  label,
  placeholder = "Select date",
  className,
  ...props
}: DateFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              data-empty={!field.state.value}
              className={cn(
                "justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
                className
              )}
            />
          }
        >
          <CalendarIcon />
          {field.state.value ? (
            format(new Date(field.state.value), "PPP")
          ) : (
            <span>{placeholder}</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={new Date(field.state.value)}
            onSelect={(date) => field.handleChange(date?.toISOString() ?? "")}
            {...props}
          />
        </PopoverContent>
      </Popover>
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}
