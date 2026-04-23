import { ROLE_LABELS, type MembershipRole } from "@instride/shared";

import { getRoleColor } from "@/shared/lib/config/colors";

import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const MAX_VISIBLE_ROLES = 2;

interface RoleListProps {
  roles: MembershipRole[];
  memberId: string;
}

export function RoleList({ roles, memberId }: RoleListProps) {
  const visibleRoles = roles.slice(0, MAX_VISIBLE_ROLES);
  const overflowCount = roles.length - visibleRoles.length;

  return (
    <div className="flex items-center gap-2 flex-nowrap">
      {visibleRoles.map((role) => (
        <Badge key={`${memberId}-${role}`} variant={getRoleColor(role)}>
          {ROLE_LABELS[role]}
        </Badge>
      ))}
      {overflowCount > 0 && (
        <Tooltip>
          <TooltipTrigger
            render={<Badge variant="outline" className="cursor-pointer" />}
          >
            +{overflowCount}
          </TooltipTrigger>
          <TooltipContent>
            {roles
              .slice(MAX_VISIBLE_ROLES)
              .map((r) => ROLE_LABELS[r])
              .join(", ")}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
