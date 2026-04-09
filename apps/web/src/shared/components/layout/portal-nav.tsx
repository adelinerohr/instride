import { Link, useRouteContext } from "@tanstack/react-router";

import { getPortalNavItems } from "@/shared/lib/navigation/app";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export function PortalNav() {
  const { organization } = useRouteContext({
    from: "/org/$slug/(authenticated)/portal",
  });
  const navItems = getPortalNavItems(organization.slug);

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {navItems.map((link) => (
              <SidebarMenuItem key={link.title}>
                <Link {...link}>
                  {({ isActive }) => (
                    <SidebarMenuButton isActive={isActive}>
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
    </SidebarContent>
  );
}
