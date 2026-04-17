import type { types } from "@instride/api";

import { cn } from "@/shared/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

function OrganizationLogo({
  organization,
  className,
  ...props
}: React.ComponentProps<typeof Avatar> & { organization: types.Organization }) {
  return (
    <Avatar
      className={cn("size-8 rounded-md group-focus:ring-2", className)}
      {...props}
    >
      <AvatarImage
        src={organization.logoUrl ?? undefined}
        alt={organization.name}
      />
      <AvatarFallback className="rounded-md bg-neutral-200 dark:bg-neutral-700 uppercase">
        {organization.name.slice(0, 1)}
      </AvatarFallback>
    </Avatar>
  );
}

export { OrganizationLogo };
