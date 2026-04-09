import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/shared/lib/utils";

const spinnerVariants = cva("flex-col items-center justify-center", {
  variants: {
    show: {
      true: "flex",
      false: "hidden",
    },
  },
  defaultVariants: {
    show: true,
  },
});

const loaderVariants = cva("animate-spin text-current", {
  variants: {
    size: {
      small: "size-2 shrink-0",
      medium: "size-4 shrink-0",
      large: "size-6 shrink-0",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

function Spinner({
  size,
  show,
  children,
  className,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof spinnerVariants> &
  VariantProps<typeof loaderVariants> & {
    children?: React.ReactNode;
  }) {
  return (
    <span className={cn(spinnerVariants({ show }), className)} {...props}>
      <Loader2 className={cn(loaderVariants({ size }))} />
      {children}
    </span>
  );
}

function CenteredSpinner({
  containerClassName,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof spinnerVariants> &
  VariantProps<typeof loaderVariants> & {
    children?: React.ReactNode;
    containerClassName?: string;
  }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex select-none items-center justify-center opacity-65",
        containerClassName
      )}
    >
      <Spinner {...props} />
    </div>
  );
}

export { CenteredSpinner, Spinner };
