import { Link, useLocation, useRouteContext } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";

import { useIsMobile } from "@/shared/hooks/use-mobile";
import { getDashboardLink } from "@/shared/lib/navigation/links";
import { getSettingsNavItems } from "@/shared/lib/navigation/settings";
import { cn } from "@/shared/lib/utils";

import { buttonVariants } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

export function SettingsPage({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const isMobile = useIsMobile();
  const { isAdmin, isTrainer, organization } = useRouteContext({
    from: "/org/$slug/(authenticated)/settings",
  });
  const { pathname } = useLocation();

  const navItems = getSettingsNavItems(organization.slug, isAdmin, isTrainer);

  const findCurrentItem = () => {
    for (const section of navItems) {
      for (const link of section.links) {
        const resolved = link.to.replace("$slug", organization.slug);
        if (pathname.startsWith(resolved)) return link;
      }
    }
    return null;
  };

  const currentNavItem = findCurrentItem();

  // Are we at the index (settings root) or inside a detail?
  const rootPath = `/org/${organization.slug}/settings`;
  const isAtIndex = pathname === rootPath || pathname === `${rootPath}/`;

  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-background">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background pl-2 pr-8">
          {isAtIndex ? (
            <div className="flex items-center justify-between gap-2 w-full">
              <Link
                {...getDashboardLink(organization.slug, isAdmin)}
                className={buttonVariants({ variant: "ghost" })}
              >
                <ChevronLeftIcon />
                Dashboard
              </Link>
              <h1 className="font-display font-semibold text-base">Settings</h1>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 w-full">
              <Link
                to="/org/$slug/settings"
                params={{ slug: organization.slug }}
                className={buttonVariants({ variant: "ghost" })}
              >
                <ChevronLeftIcon />
                Settings
              </Link>
              {currentNavItem && (
                <h1 className="font-display font-semibold text-base">
                  {currentNavItem.title}
                </h1>
              )}
            </div>
          )}
        </header>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">{children}</ScrollArea>
        </div>
      </div>
    );
  }

  // At `/settings` no nav link prefix matches until a child route loads. The
  // index route redirects desktop to profile, but it only runs if the Outlet
  // renders — so we must not return null here when sitting on the settings root.
  if (!currentNavItem) {
    if (isAtIndex) {
      return (
        <div className={cn("flex h-full flex-col", className)} {...props}>
          <div className="grow overflow-hidden">
            <ScrollArea className="h-full">{children}</ScrollArea>
          </div>
        </div>
      );
    }
    return null;
  }

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
                <currentNavItem.icon className="size-4" />
                <div className="text-sm font-semibold leading-none capitalize">
                  {currentSegment}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grow overflow-hidden">
        <ScrollArea className="h-full">{children}</ScrollArea>
      </div>
    </div>
  );
}
