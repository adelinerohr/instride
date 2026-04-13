import { useRouter } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/shared/lib/utils";

import { Button } from "../ui/button";

function Page({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {children}
    </div>
  );
}

function PageHeader({
  title,
  description,
  action,
  className,
  backButton = true,
  children,
}: React.ComponentProps<"div"> & {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  backButton?: boolean;
}) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-border p-4",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {backButton && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.history.back()}
          >
            <ChevronLeftIcon />
          </Button>
        )}
        <div className="min-w-0 max-w-xl">
          <h1 className="text-lg font-semibold leading-none">{title}</h1>
          {description && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

export { Page, PageHeader };
