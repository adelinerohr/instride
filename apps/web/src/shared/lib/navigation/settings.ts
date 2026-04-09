import { linkOptions } from "@tanstack/react-router";
import {
  BuildingIcon,
  ClockIcon,
  ShieldUserIcon,
  UserIcon,
} from "lucide-react";

export const getSettingsNavItems = (
  slug: string,
  canViewAdminSettings: boolean
) => {
  if (canViewAdminSettings) {
    return getAdminSettingsNavItems(slug);
  }

  return getPortalSettingsNavItems(slug);
};

export const getPortalSettingsNavItems = (slug: string) => {
  return [
    {
      title: "Personal",
      links: linkOptions([
        {
          title: "Profile",
          icon: UserIcon,
          to: "/org/$slug/settings/account/profile",
          params: { slug },
        },
      ]),
    },
  ];
};

export const getAdminSettingsNavItems = (slug: string) => {
  return [
    {
      title: "Personal",
      links: linkOptions([
        {
          title: "Profile",
          icon: UserIcon,
          to: "/org/$slug/settings/account/profile",
          params: { slug },
        },
        {
          title: "Guardian",
          icon: ShieldUserIcon,
          to: "/org/$slug/settings/account/guardian",
          params: { slug },
        },
      ]),
    },
    {
      title: "Organization",
      links: linkOptions([
        {
          title: "General",
          icon: BuildingIcon,
          to: "/org/$slug/settings/organization/general",
          params: { slug },
        },
        {
          title: "Business Hours",
          icon: ClockIcon,
          to: "/org/$slug/settings/organization/business-hours",
          params: { slug },
        },
      ]),
    },
  ];
};
