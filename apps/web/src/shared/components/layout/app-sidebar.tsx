import { Link, useRouteContext } from "@tanstack/react-router";

import { OrganizationLogo } from "../fragments/org-logo";
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
              <OrganizationLogo organization={organization} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold font-display">
                  {organization.name}
                </span>
                <span className="truncate text-xs">
                  {type === "admin" ? "Admin" : "Rider Portal"}
                </span>
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
