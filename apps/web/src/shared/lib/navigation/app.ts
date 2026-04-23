import { linkOptions } from "@tanstack/react-router";
import {
  CalendarClock,
  Clipboard,
  HelpCircle,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Ticket,
  UsersIcon,
} from "lucide-react";

export const getPortalNavItems = (slug: string) =>
  linkOptions([
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      to: "/org/$slug/portal",
      params: { slug },
      activeOptions: { exact: true },
      primary: true,
    },
    {
      title: "Feed",
      icon: MessageCircle,
      to: "/org/$slug/portal/feed",
      params: { slug },
      primary: true,
    },
    {
      title: "Calendar",
      icon: CalendarClock,
      to: "/org/$slug/portal/calendar",
      params: { slug },
      primary: true,
    },
    {
      title: "Settings",
      icon: Settings,
      to: "/org/$slug/settings",
      params: { slug },
      primary: true,
    },
  ]);

export const getAdminNavItems = (slug: string) => ({
  main: linkOptions([
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      to: "/org/$slug/admin",
      params: { slug },
      activeOptions: { exact: true },
      primary: true,
    },
    {
      title: "Feed",
      icon: MessageCircle,
      to: "/org/$slug/admin/feed",
      params: { slug },
      primary: true,
    },
    {
      title: "Calendar",
      icon: CalendarClock,
      to: "/org/$slug/admin/calendar",
      params: { slug },
      primary: true,
    },
    {
      title: "Settings",
      icon: Settings,
      to: "/org/$slug/settings",
      params: { slug },
      primary: true,
    },
  ]),
  groups: [
    {
      title: "Organization",
      links: [
        linkOptions({
          title: "Boards",
          icon: Clipboard,
          to: "/org/$slug/admin/boards",
          params: { slug },
        }),
        linkOptions({
          title: "Services",
          icon: Ticket,
          to: "/org/$slug/admin/services",
          params: { slug },
        }),
        {
          title: "Members",
          icon: UsersIcon,
          links: [
            linkOptions({
              title: "All members",
              to: "/org/$slug/admin/members",
              icon: UsersIcon,
              params: { slug },
              activeOptions: { exact: true },
            }),
            linkOptions({
              title: "Trainers",
              to: "/org/$slug/admin/members/trainers",
              icon: UsersIcon,
              params: { slug },
            }),
            linkOptions({
              title: "Riders",
              to: "/org/$slug/admin/members/riders",
              icon: UsersIcon,
              params: { slug },
            }),
          ],
        },
      ],
    },
  ],
  footer: linkOptions({
    title: "Get help",
    icon: HelpCircle,
    to: "/org/$slug",
    params: { slug },
  }),
});
