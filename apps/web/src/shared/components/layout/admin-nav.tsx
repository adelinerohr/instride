import { Link, useRouteContext } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";

import { getAdminNavItems } from "@/shared/lib/navigation/app";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../ui/sidebar";

export function AdminNav() {
  const { organization } = useRouteContext({
    from: "/org/$slug/(authenticated)/admin",
  });
  const navItems = getAdminNavItems(organization.slug);

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {navItems.main.map((link) => (
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
      {navItems.groups.map((group) => (
        <SidebarGroup key={group.title}>
          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.links.map((item) =>
                "links" in item ? (
                  <Collapsible
                    key={item.title}
                    defaultOpen
                    render={<SidebarMenuItem />}
                  >
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton
                          tooltip={item.title}
                          className="group"
                        />
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                      <ChevronRightIcon className="ml-auto transition-transform group-data-panel-open:rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.links.map((link) => (
                          <SidebarMenuSubItem key={link.title}>
                            <Link {...link}>
                              {({ isActive }) => (
                                <SidebarMenuSubButton
                                  isActive={isActive}
                                  render={<div />}
                                >
                                  {link.title}
                                </SidebarMenuSubButton>
                              )}
                            </Link>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <Link {...item}>
                      {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive} render={<div />}>
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      )}
                    </Link>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}
