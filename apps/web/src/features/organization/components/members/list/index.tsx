import { getUser, type Member } from "@instride/api";
import { MembershipRole, ROLE_LABELS } from "@instride/shared";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";
import * as React from "react";

import { Badge } from "@/shared/components/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/shared/components/ui/input-group";

import { MemberCard } from "./card";

interface MemberListProps {
  members: Member[];
}

export function MemberList({ members }: MemberListProps) {
  const search = useSearch({
    from: "/org/$slug/(authenticated)/admin/members/",
  });
  const navigate = useNavigate({ from: "/org/$slug/admin/members/" });

  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");

  React.useEffect(() => {
    const t = window.setTimeout(
      () => setDebouncedSearchQuery(searchQuery),
      300
    );
    return () => window.clearTimeout(t);
  }, [searchQuery]);

  const roleFilter =
    (search.filters?.role as MembershipRole[] | undefined) ?? [];
  const normalizedQuery = debouncedSearchQuery.trim().toLowerCase();

  const filteredMembers = React.useMemo(() => {
    return members.filter((member) => {
      const user = getUser({ member });

      const matchesRole =
        roleFilter.length === 0 ||
        roleFilter.some((role) => member.roles.includes(role));

      const matchesQuery =
        normalizedQuery.length === 0 ||
        user.name.toLowerCase().includes(normalizedQuery);

      return matchesRole && matchesQuery;
    });
  }, [members, roleFilter, normalizedQuery]);

  if (filteredMembers.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        No members found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <InputGroup>
        <InputGroupInput
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <InputGroupAddon align="inline-start">
          <InputGroupButton>
            <SearchIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <div className="flex items-center gap-2">
        <Badge
          variant={roleFilter.length === 0 ? "default" : "outline"}
          onClick={() =>
            navigate({ search: { ...search, filters: { role: [] } } })
          }
        >
          All
        </Badge>
        {Object.entries(MembershipRole).map(([key, value]) => (
          <Badge
            key={key}
            variant={roleFilter.includes(value) ? "default" : "outline"}
            onClick={() =>
              navigate({ search: { ...search, filters: { role: [value] } } })
            }
          >
            {ROLE_LABELS[value]}
          </Badge>
        ))}
      </div>
      <div className="divide-y bg-card rounded-lg border">
        {filteredMembers.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            expanded={expandedId === member.id}
            onToggle={() =>
              setExpandedId((curr) => (curr === member.id ? null : member.id))
            }
          />
        ))}
      </div>
    </div>
  );
}
