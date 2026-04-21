import type { types } from "@instride/api";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

function OrganizationLogo({
  organization,
  className,
  ...props
}: React.ComponentProps<typeof Avatar> & { organization: types.Organization }) {
  return (
    <Avatar className={className} shape="square" size="default" {...props}>
      <AvatarImage
        src={organization.logoUrl ?? undefined}
        alt={organization.name}
      />
      <AvatarFallback className="bg-primary text-primary-foreground uppercase font-display">
        {organization.name.slice(0, 1)}
      </AvatarFallback>
    </Avatar>
  );
}

export { OrganizationLogo };
