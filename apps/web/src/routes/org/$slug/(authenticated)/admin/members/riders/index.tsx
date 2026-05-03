import {
  boardsOptions,
  getUser,
  levelOptions,
  membersOptions,
  type Rider,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { XIcon } from "lucide-react";

import {
  BoardBadge,
  LevelBadge,
} from "@/features/organization/components/fragments/badges";
import {
  riderSearchParams,
  type RiderSearchParams,
} from "@/features/organization/lib/search/riders";
import { DataTable, type Column } from "@/shared/components/data-table";
import { CategoryDot } from "@/shared/components/fragments/category-dot";
import { InputSearch } from "@/shared/components/fragments/input-search";
import { UserAvatarItem } from "@/shared/components/fragments/user-avatar";
import { Page, PageBody, PageHeader } from "@/shared/components/layout/page";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/members/riders/"
)({
  component: RouteComponent,
  validateSearch: riderSearchParams,
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ context, deps }) => {
    const { search } = deps;
    const riders = await context.queryClient.ensureQueryData(
      membersOptions.riders()
    );

    await Promise.all([
      context.queryClient.ensureQueryData(levelOptions.list()),
      context.queryClient.ensureQueryData(boardsOptions.list()),
    ]);

    const filteredRiders = riders.filter((rider) => {
      if (
        search.query &&
        !getUser({ rider })
          .name.toLowerCase()
          .includes(search.query.toLowerCase())
      ) {
        return false;
      }
      if (search.levelId && rider.ridingLevelId !== search.levelId) {
        return false;
      }
      if (
        search.boardId &&
        !rider.boardAssignments.some(
          (assignment) => assignment.boardId === search.boardId
        )
      ) {
        return false;
      }
      return true;
    });

    return { riders: filteredRiders };
  },
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { riders } = Route.useLoaderData();

  const { data: levels } = useSuspenseQuery(levelOptions.list());
  const { data: boards } = useSuspenseQuery(boardsOptions.list());

  const columns: Column<Rider>[] = [
    {
      id: "rider",
      header: "Rider",
      sortKey: "name",
      cell: (row) => <UserAvatarItem user={getUser({ rider: row })} />,
    },
    {
      id: "level",
      header: "Level",
      cell: (row) => <LevelBadge level={row.level} />,
    },
    {
      id: "boards",
      header: "Boards",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.boardAssignments.map((assignment) => (
            <BoardBadge board={assignment.board} />
          ))}
        </div>
      ),
    },
  ];

  const setSearch = (next: Partial<RiderSearchParams>) => {
    navigate({ search: (prev) => ({ ...prev, ...next, page: 1 }) });
  };

  const hasActiveFilters = Boolean(
    search.query || search.levelId || search.boardId
  );

  return (
    <Page>
      <PageHeader title="Riders" backButton={false} />
      <PageBody>
        <div className="flex flex-wrap items-center gap-2">
          <InputSearch
            placeholder="Search riders..."
            value={search.query ?? ""}
            onChange={(e) => setSearch({ query: e.target.value || undefined })}
          />
          <Select
            value={levels.find((level) => level.id === search.levelId) ?? null}
            onValueChange={(value) =>
              setSearch({ levelId: value === null ? undefined : value.id })
            }
            itemToStringLabel={(level) => level.name}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {levels.map((level) => (
                <SelectItem key={level.id} value={level.id}>
                  <div className="flex items-center gap-2">
                    <CategoryDot size="sm" color={level.color} />
                    {level.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={boards.find((board) => board.id === search.boardId) ?? null}
            onValueChange={(value) =>
              setSearch({ boardId: value === null ? undefined : value.id })
            }
            itemToStringLabel={(board) => board.name}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select board" />
            </SelectTrigger>
            <SelectContent>
              {boards.map((board) => (
                <SelectItem key={board.id} value={board.id}>
                  {board.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={() =>
                setSearch({
                  query: undefined,
                  levelId: undefined,
                  boardId: undefined,
                })
              }
            >
              Clear filters
              <XIcon />
            </Button>
          )}
        </div>
        <DataTable
          columns={columns}
          rows={riders}
          rowKey={(row) => row.id}
          onRowClick={(row) =>
            navigate({ to: "./$riderId", params: { riderId: row.id } })
          }
          sort={{ by: "createdAt", dir: "desc" }}
          onSortChange={(by) =>
            setSearch({
              sortBy: by as "name" | "createdAt",
              sortDir:
                search.sortBy === by && search.sortDir === "desc"
                  ? "asc"
                  : "desc",
            })
          }
        />
      </PageBody>
    </Page>
  );
}
