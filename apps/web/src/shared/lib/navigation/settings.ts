import { linkOptions } from "@tanstack/react-router";
import {
  BuildingIcon,
  ClipboardIcon,
  ClockIcon,
  FileTextIcon,
  LaptopIcon,
  ShieldIcon,
  ShieldUserIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

export const getSettingsNavItems = (
  slug: string,
  canViewAdminSettings: boolean,
  isTrainer: boolean
) => {
  if (canViewAdminSettings) {
    return getAdminSettingsNavItems(slug, isTrainer);
  }

  return getPortalSettingsNavItems(slug, isTrainer);
};

export const getPortalSettingsNavItems = (slug: string, isTrainer: boolean) => {
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
          title: "Security",
          icon: ShieldIcon,
          to: "/org/$slug/settings/account/security",
          params: { slug },
        },
        {
          title: "Guardian",
          icon: ShieldUserIcon,
          to: "/org/$slug/settings/account/guardian",
          params: { slug },
        },
        ...(isTrainer
          ? [
              {
                title: "Trainer Availability",
                icon: ClockIcon,
                to: "/org/$slug/settings/account/availability",
                params: { slug },
              },
            ]
          : []),
      ]),
    },
  ];
};

export const getAdminSettingsNavItems = (slug: string, isTrainer: boolean) => {
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
          title: "Security",
          icon: ShieldIcon,
          to: "/org/$slug/settings/account/security",
          params: { slug },
        },
        {
          title: "Guardian",
          icon: ShieldUserIcon,
          to: "/org/$slug/settings/account/guardian",
          params: { slug },
        },
        ...(isTrainer
          ? [
              {
                title: "Trainer Availability",
                icon: ClockIcon,
                to: "/org/$slug/settings/account/availability",
                params: { slug },
              },
            ]
          : []),
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
          title: "Members",
          icon: UsersIcon,
          to: "/org/$slug/settings/organization/members",
          params: { slug },
        },
        {
          title: "Kiosks",
          icon: LaptopIcon,
          to: "/org/$slug/settings/organization/kiosk",
          params: { slug },
        },
        {
          title: "Business Hours",
          icon: ClockIcon,
          to: "/org/$slug/settings/organization/business-hours",
          params: { slug },
        },
        {
          title: "Waivers",
          icon: FileTextIcon,
          to: "/org/$slug/settings/organization/waivers",
          params: { slug },
        },
        {
          title: "Questionnaires",
          icon: ClipboardIcon,
          to: "/org/$slug/settings/organization/questionnaires",
          params: { slug },
        },
      ]),
    },
  ];
};
