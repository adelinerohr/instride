import { Link, useRouteContext } from "@tanstack/react-router";
import { CommandIcon } from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "../ui/sidebar";
import { AdminNav } from "./admin-nav";
import { NavUser } from "./nav-user";
import { PortalNav } from "./portal-nav";

interface AppSidebarProps {
  type: "admin" | "portal";
}

export function AppSidebar({ type }: AppSidebarProps) {
  const { organization } = useRouteContext({
    from: "/org/$slug/(authenticated)",
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 border-sidebar-border border-b justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link params={{ slug: organization.slug }} to="/org/$slug" />
              }
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <CommandIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {organization.name}
                </span>
                <span className="truncate text-xs">Enterprise</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {type === "admin" ? <AdminNav /> : <PortalNav />}
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
