import { CheckIcon, PlusCircleIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import { Badge } from "./badge";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Separator } from "./separator";

function FacetedFilter({
  title,
  selectedValues,
  options,
  onChange,
}: {
  title: string;
  selectedValues: Set<string>;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  onChange: (values: Set<string>) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline" className="h-8 border-dashed" />}
      >
        <PlusCircleIcon className="mr-2 h-4 w-4" />
        {title}
        {selectedValues?.size > 0 && (
          <>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Badge
              variant="secondary"
              className="rounded-sm px-1 font-normal lg:hidden"
            >
              {selectedValues.size}
            </Badge>
            <div className="hidden space-x-1 lg:flex">
              {selectedValues.size > 2 ? (
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {selectedValues.size} {"Selected"}
                </Badge>
              ) : (
                options
                  .filter((option) => selectedValues.has(option.value))
                  .map((option) => (
                    <Badge
                      variant="secondary"
                      key={option.value}
                      className="rounded-sm px-1 font-normal"
                    >
                      {option.label}
                    </Badge>
                  ))
              )}
            </div>
          </>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>{"No Filter results"}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      const newValues = new Set(selectedValues);
                      if (isSelected) {
                        newValues.delete(option.value);
                      } else {
                        newValues.add(option.value);
                      }
                      onChange(newValues);
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className={cn("h-4 w-4 text-white")} />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange(new Set())}
                    className="justify-center text-center"
                  >
                    {"Clear Filters"}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { FacetedFilter };
