import {
  Link,
  linkOptions,
  useParams,
  useRouteContext,
} from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";

import { getSettingsNavItems } from "@/shared/lib/navigation/settings";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export function SettingsSidebar() {
  const { slug } = useParams({ from: "/org/$slug/(authenticated)/settings" });
  const { isAdmin, isTrainer } = useRouteContext({
    from: "/org/$slug/(authenticated)/settings",
  });

  const navItems = getSettingsNavItems(slug, isAdmin, isTrainer);

  const portalDashboardLink = linkOptions({
    to: "/org/$slug/portal",
    params: { slug },
  });

  const adminDashboardLink = linkOptions({
    to: "/org/$slug/admin",
    params: { slug },
  });

  return (
    <Sidebar collapsible="none" className="border-r">
      <SidebarHeader className="flex h-14 flex-row items-center py-0">
        <SidebarMenuButton
          render={
            <Link {...(isAdmin ? adminDashboardLink : portalDashboardLink)} />
          }
        >
          <ChevronLeftIcon />
          <span>Dashboard</span>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        {navItems.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.links.map((link) => (
                  <SidebarMenuItem key={link.title}>
                    <Link {...link}>
                      {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive} render={<div />}>
                          <link.icon />
                          <span>{link.title}</span>
                        </SidebarMenuButton>
                      )}
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
