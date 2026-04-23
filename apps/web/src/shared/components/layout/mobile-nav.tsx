import { Link, useRouteContext } from "@tanstack/react-router";
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import * as React from "react";

import {
  getAdminNavItems,
  getPortalNavItems,
} from "@/shared/lib/navigation/app";
import { cn } from "@/shared/lib/utils";

import { Button } from "../ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "../ui/item";
import { Sheet, SheetContent, SheetHeader } from "../ui/sheet";

interface MobileTabBarProps {
  type: "admin" | "portal";
}

export function MobileTabBar({ type }: MobileTabBarProps) {
  const [isAdminNavExpanded, setIsAdminNavExpanded] = React.useState(false);

  const { organization } = useRouteContext({
    from: "/org/$slug/(authenticated)",
  });

  const primaryNavItems =
    type === "admin"
      ? getAdminNavItems(organization.slug).main
      : getPortalNavItems(organization.slug);

  const adminMoreItems = getAdminNavItems(organization.slug).groups.flatMap(
    (group) =>
      group.links.flatMap((item: any) => {
        if ("links" in item) return item.links;
        return [item];
      })
  );

  console.log(adminMoreItems);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-60 md:hidden flex items-stretch h-mobile-nav bg-background border-t pb-[env(safe-area-inset-bottom)]">
      {primaryNavItems.map((item) => (
        <Link key={item.title} {...item} className="flex-1">
          {({ isActive }) => (
            <div
              className={cn(
                "h-full flex flex-col items-center justify-center gap-1 pt-1 relative",
                isActive ? "text-accent" : "text-muted-foreground"
              )}
            >
              <item.icon className="size-5" strokeWidth={2} />
              <span className="text-[10px] font-medium tracking-wide">
                {item.title}
              </span>
            </div>
          )}
        </Link>
      ))}
      {type === "admin" && (
        <button
          type="button"
          className="flex-1"
          aria-expanded={isAdminNavExpanded}
          onClick={() => setIsAdminNavExpanded(!isAdminNavExpanded)}
        >
          <div
            className={cn(
              "h-full flex flex-col items-center justify-center gap-1 pt-1 relative",
              isAdminNavExpanded ? "text-accent" : "text-muted-foreground"
            )}
          >
            <MoreHorizontalIcon className="size-5" strokeWidth={2} />
            <span className="text-[10px] font-medium tracking-wide">More</span>
          </div>
        </button>
      )}
      <Sheet open={isAdminNavExpanded} onOpenChange={setIsAdminNavExpanded}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          showMobileNav
          className="rounded-t-2xl max-h-[85dvh] overflow-y-auto pb-mobile-nav divide-y gap-0"
        >
          <SheetHeader className="sr-only">Admin Navigation</SheetHeader>
          {adminMoreItems.map((item) => (
            <Item
              key={item.title}
              className="not-last:border-b not-last:border-border not-last:border-t-0 not-last:border-r-0 not-last:border-l-0 rounded-none"
              render={
                <Link {...item} onClick={() => setIsAdminNavExpanded(false)} />
              }
            >
              <ItemMedia variant="icon">
                <item.icon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{item.title}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <Button variant="ghost" size="icon">
                  <ChevronRightIcon />
                </Button>
              </ItemActions>
            </Item>
          ))}
        </SheetContent>
      </Sheet>
    </nav>
  );
}
