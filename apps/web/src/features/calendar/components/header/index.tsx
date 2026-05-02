import { hasOnlyRole, type Member } from "@instride/api";
import { KioskScope, MembershipRole } from "@instride/shared";
import { Link, useParams, useRouteContext } from "@tanstack/react-router";
import {
  CalendarPlusIcon,
  ClockIcon,
  PartyPopperIcon,
  PlusIcon,
} from "lucide-react";

import { EventModal } from "@/features/organization/components/availability/events/modal";
import { CreateTimeBlockModal } from "@/features/organization/components/availability/time-blocks/modal";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
} from "@/shared/components/ui/dropdown-menu";

import { useCalendar } from "../../hooks/use-calendar";
import { DateNavigator } from "./date-navigator";
import { CalendarFilters } from "./filters";
import { ViewSwitcher } from "./view-switcher";

export function CalendarHeader() {
  const { slug } = useParams({ strict: false });
  const { kioskSession, kioskPermissions, member } = useRouteContext({
    strict: false,
  });
  const { type } = useCalendar();

  if (!member) {
    throw new Error("Member not found");
  }

  const isOnlyTrainer = hasOnlyRole(member, MembershipRole.TRAINER);

  const getVisibility = () => {
    if (type === "admin") {
      return "dropdown";
    }

    if (type === "portal") {
      return "link";
    }

    if (type === "kiosk" && kioskSession) {
      if (kioskSession.scope === KioskScope.DEFAULT) {
        return "none";
      }
      if (kioskSession.scope === KioskScope.STAFF) {
        return "dropdown";
      }
      if (kioskSession.scope === KioskScope.SELF && kioskPermissions) {
        return kioskPermissions.canCreateLesson ? "link" : "none";
      }
    }
  };

  const visibility = getVisibility();

  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <DateNavigator />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-2">
        <div className="options flex items-center gap-4 md:gap-2">
          <ViewSwitcher />
          <CalendarFilters />

          {visibility === "dropdown" ? (
            <AdminDropdown isOnlyTrainer={isOnlyTrainer} member={member} />
          ) : visibility === "link" ? (
            <Link
              to="/org/$slug/portal/lessons/create"
              params={{ slug: slug ?? "" }}
              className={buttonVariants({ variant: "default", size: "icon" })}
            >
              <PlusIcon />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AdminDropdown(props: { isOnlyTrainer: boolean; member: Member }) {
  const createTimeBlockModal = CreateTimeBlockModal.useModal();
  const eventModal = EventModal.useModal();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button />}>
        <PlusIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-fit">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => eventModal.open({})}>
            <PartyPopperIcon />
            <span>Add new event</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CalendarPlusIcon />
            <span>Add new lesson</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              createTimeBlockModal.open({
                isOnlyTrainer: props.isOnlyTrainer,
                trainerId: props.isOnlyTrainer
                  ? props.member.trainer?.id
                  : undefined,
              })
            }
          >
            <ClockIcon />
            <span>Add new time block</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
