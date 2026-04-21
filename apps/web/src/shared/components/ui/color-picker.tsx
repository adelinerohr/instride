import { CheckIcon } from "lucide-react";

import {
  CATEGORY_COLORS,
  CATEGORY_COLOR_LABELS,
  type CategoryColor,
  isCategoryColor,
} from "@/shared/lib/config/colors";
import { cn } from "@/shared/lib/utils";

import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface ColorPickerProps {
  value: string;
  onChange: (value: CategoryColor) => void;
  className?: string;
}

function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const selected = isCategoryColor(value) ? value : null;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selected && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <div className="flex w-full items-center gap-2">
          {selected ? (
            <>
              <Swatch color={selected} className="size-4" />
              <span className="flex-1 truncate">
                {CATEGORY_COLOR_LABELS[selected]}
              </span>
            </>
          ) : (
            <span className="flex-1 text-muted-foreground">Pick a color</span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="grid grid-cols-3 gap-2">
          {CATEGORY_COLORS.map((color) => {
            const isSelected = color === selected;
            return (
              <button
                key={color}
                type="button"
                onClick={() => onChange(color)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-md p-2 transition-colors",
                  "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
                aria-label={CATEGORY_COLOR_LABELS[color]}
                aria-pressed={isSelected}
              >
                <div className="relative">
                  <Swatch color={color} className="size-8" />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckIcon
                        className="size-4 text-category-{color}-fg"
                        strokeWidth={3}
                      />
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {CATEGORY_COLOR_LABELS[color]}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Swatch({
  color,
  className,
}: {
  color: CategoryColor;
  className?: string;
}) {
  // Build the class string explicitly so Tailwind's JIT picks it up
  const bgMap: Record<CategoryColor, string> = {
    amber: "bg-category-amber-bg border-category-amber-border",
    sage: "bg-category-sage-bg border-category-sage-border",
    slate: "bg-category-slate-bg border-category-slate-border",
    terracotta: "bg-category-terracotta-bg border-category-terracotta-border",
    plum: "bg-category-plum-bg border-category-plum-border",
    clay: "bg-category-clay-bg border-category-clay-border",
  };
  return (
    <div
      className={cn("rounded-md border", bgMap[color], className)}
      aria-hidden="true"
    />
  );
}

export { ColorPicker };
