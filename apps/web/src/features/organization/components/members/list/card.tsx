import { getUser, type Member } from "@instride/api";
import { ROLE_LABELS, ROLE_VARIANTS } from "@instride/shared";
import { Link, useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";

import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { Badge } from "@/shared/components/ui/badge";
import { buttonVariants } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface MemberCardProps {
  member: Member;
  expanded: boolean;
  onToggle: () => void;
}

export function MemberCard({ member, expanded, onToggle }: MemberCardProps) {
  const user = getUser({ member });
  const { slug } = useParams({ strict: false });

  return (
    <div className={cn("flex flex-col", expanded && "bg-muted/40")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-3 py-3 text-left"
      >
        <UserAvatar user={user} />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="truncate font-medium">{user.name}</div>
          <div className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            {member.roles.map((role) => (
              <Badge key={role} variant={ROLE_VARIANTS[role]}>
                {ROLE_LABELS[role]}
              </Badge>
            ))}
          </div>
        </div>
        <div className="shrink-0 text-muted-foreground">
          {expanded ? (
            <ChevronDownIcon className="size-4" />
          ) : (
            <ChevronRightIcon className="size-4" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 px-3 pb-3">
          <dl className="flex flex-col gap-2 text-sm">
            <Field label="Joined">
              {format(member.createdAt, "MMM d, yyyy")}
            </Field>
            <Field label="Email" className="truncate">
              {member.authUser?.email}
            </Field>
            <Field label="Roles" span={2}>
              <div className="flex flex-wrap gap-1">
                {member.roles.map((role) => (
                  <Badge key={role} variant={ROLE_VARIANTS[role]}>
                    {ROLE_LABELS[role]}
                  </Badge>
                ))}
              </div>
            </Field>
          </dl>
          <div className="flex gap-2">
            {member.rider && (
              <Link
                to="/org/$slug/admin/members/riders/$riderId"
                params={{ slug: slug ?? "", riderId: member.rider.id }}
                className={buttonVariants({
                  variant: "outline",
                  className: "flex-1",
                })}
              >
                View rider profile
              </Link>
            )}
            {member.trainer && (
              <Link
                to="/org/$slug/admin/members/trainers/$trainerId"
                params={{ slug: slug ?? "", trainerId: member.trainer.id }}
                className={buttonVariants({
                  variant: "outline",
                  className: "flex-1",
                })}
              >
                View trainer profile
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  span,
  className,
}: React.ComponentProps<"div"> & { label: string; span?: 1 | 2 }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5",
        span === 2 && "col-span-2",
        className
      )}
    >
      <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  );
}
