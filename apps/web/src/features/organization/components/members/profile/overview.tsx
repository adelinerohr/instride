import type { Member } from "@instride/api";
import { format } from "date-fns";
import { MailIcon, PhoneIcon } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { ROLE_LABELS, ROLE_VARIANTS } from "@/shared/lib/auth/roles";

type MemberOverviewProps = {
  member: Member;
};

export function MemberOverview({ member }: MemberOverviewProps) {
  return (
    <div className="max-w-xl space-y-6">
      {/* Profile card */}
      <section className="rounded-xl border border-border p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-primary">
              {member.authUser?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-base">{member.authUser?.name}</p>
            <div className="flex items-center gap-2 mt-1">
              {member.roles.map((role) => (
                <Badge key={role} variant={ROLE_VARIANTS[role]}>
                  {ROLE_LABELS[role]}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground flex items-center gap-1.5">
              <MailIcon className="size-3.5" />
              Email
            </dt>
            <dd className="mt-0.5 font-medium">{member.authUser?.email}</dd>
          </div>
          {member.authUser?.phone && (
            <div>
              <dt className="text-muted-foreground flex items-center gap-1.5">
                <PhoneIcon className="size-3.5" />
                Phone
              </dt>
              <dd className="mt-0.5 font-medium">{member.authUser?.phone}</dd>
            </div>
          )}
          <div>
            <dt className="text-muted-foreground">Joined</dt>
            <dd className="mt-0.5 font-medium">
              {format(new Date(member.createdAt), "MMMM d, yyyy")}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
