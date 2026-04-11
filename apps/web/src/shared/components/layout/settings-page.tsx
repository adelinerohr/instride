import { useLocation, useRouteContext } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";
import * as React from "react";

import { getSettingsNavItems } from "@/shared/lib/navigation/settings";
import { cn } from "@/shared/lib/utils";

export function SettingsPage({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { isAdmin, organization } = useRouteContext({
    from: "/org/$slug/(authenticated)/settings",
  });
  const { pathname } = useLocation();

  const navItems = getSettingsNavItems(organization.slug, isAdmin);

  let currentNavItem = null;

  for (const section of navItems) {
    for (const link of section.links) {
      const resolvedPath = link.to.replace("$slug", organization.slug);
      if (pathname.startsWith(resolvedPath)) {
        currentNavItem = link;
        break;
      }
    }
  }

  if (!currentNavItem) {
    return null;
  }

  const Icon = currentNavItem.icon;

  const navSegments = currentNavItem.to.split("/");
  const currentSegment = navSegments[navSegments.length - 1];
  const parentSegment = navSegments[navSegments.length - 2];

  return (
    <div className={cn("flex h-full flex-col", className)} {...props}>
      <div className="sticky top-0 z-20 bg-background">
        <div className="relative flex h-14 flex-row items-center gap-1 border-b px-4 sm:px-6">
          <div className="flex w-full flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-sm leading-none font-medium capitalize text-muted-foreground">
                {parentSegment}
              </div>
              <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <div className="flex items-center gap-1">
                <Icon className="size-4" />
                <div className="text-sm font-semibold leading-none capitalize">
                  {currentSegment}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grow overflow-hidden">
        <div className="h-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
