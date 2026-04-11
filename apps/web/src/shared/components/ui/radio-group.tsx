import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import * as React from "react";

import { cn } from "@/shared/lib/utils";

function getScrollableAncestors(el: Element) {
  const results: Array<{ el: Element; top: number }> = [];
  let ancestor: Element | null = el.parentElement;
  while (ancestor) {
    const { overflowY } = window.getComputedStyle(ancestor);
    if (overflowY === "auto" || overflowY === "scroll") {
      results.push({ el: ancestor, top: ancestor.scrollTop });
    }
    ancestor = ancestor.parentElement;
  }
  return results;
}

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  // Use native event listeners so Base UI cannot intercept them. Save scroll
  // positions of all scrollable ancestors on pointerdown, then restore on the
  // first focusin — this neutralises the browser's click-to-focus scroll
  // regardless of how Base UI internally manages focus on its radio items.
  const ref = React.useCallback((el: HTMLElement | null) => {
    if (!el) return;

    let saved: Array<{ el: Element; top: number }> = [];

    const onPointerDown = () => {
      saved = getScrollableAncestors(el);
    };

    const onFocusIn = () => {
      for (const { el: container, top } of saved) {
        container.scrollTop = top;
      }
      saved = [];
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("focusin", onFocusIn);
  }, []);

  return (
    <RadioGroupPrimitive
      ref={ref}
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  );
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-input outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-4 items-center justify-center"
      >
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
