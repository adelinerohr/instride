import { useDeleteBoard, boardsOptions, type types } from "@instride/api";
import { getUser } from "@instride/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ClipboardIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";

import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { AvatarGroup } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/boards/"
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    return await context.queryClient.ensureQueryData(boardsOptions.list());
  },
});

function RouteComponent() {
  const { organization } = Route.useRouteContext();
  const deleteBoard = useDeleteBoard();
  const { data: boards, isLoading } = useSuspenseQuery(boardsOptions.list());

  if (isLoading || !boards) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <h1 className="font-bold text-2xl">Boards</h1>
        <Link
          className={buttonVariants({ variant: "default" })}
          params={{ slug: organization.slug }}
          to="/org/$slug/admin/boards/new"
        >
          <PlusIcon />
          New Board
        </Link>
      </div>
      <div className="p-4 flex flex-col gap-4">
        {boards.length > 0 ? (
          <div className="flex flex-col gap-4">
            {boards.map((board) => {
              const assignedTrainers =
                board.assignments
                  ?.map((assignment) => assignment.trainer)
                  .filter((t): t is types.Trainer => t != null) ?? [];
              const assignedRiders = board.assignments?.filter(
                (assignment) => assignment.riderId !== null
              );

              return (
                <Link
                  key={board.id}
                  params={{ slug: organization.slug, id: board.id }}
                  to="/org/$slug/admin/boards/$id"
                  className="flex items-center justify-between rounded-md border bg-white p-4 hover:border-secondary-border"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-lg">{board.name}</h2>
                      <Badge variant="outline">
                        {assignedRiders?.length ?? 0} riders assigned
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <AvatarGroup>
                        {assignedTrainers.map((trainer) => (
                          <UserAvatar
                            key={trainer.id}
                            size="sm"
                            user={getUser({ trainer })}
                          />
                        ))}
                      </AvatarGroup>
                      <span className="text-sm text-muted-foreground">
                        {assignedTrainers.length} trainer
                        {assignedTrainers.length > 1 ? "s" : ""} assigned
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.preventDefault()}
                      render={<Button size="icon" variant="ghost" />}
                    >
                      <EllipsisVerticalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <Link
                        params={{
                          slug: organization.slug,
                          id: board.id,
                        }}
                        to="/org/$slug/admin/boards/$id"
                      >
                        <DropdownMenuItem>
                          <EyeIcon />
                          View
                        </DropdownMenuItem>
                      </Link>
                      <Link
                        params={{
                          slug: organization.slug,
                          id: board.id,
                        }}
                        to="/org/$slug/admin/boards/$id/edit"
                      >
                        <DropdownMenuItem>
                          <PencilIcon />
                          Edit
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteBoard.mutateAsync(board.id);
                        }}
                        variant="destructive"
                      >
                        <TrashIcon />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Link>
              );
            })}
          </div>
        ) : (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardIcon className="size-6" />
              </EmptyMedia>
              <EmptyTitle>No boards found</EmptyTitle>
              <EmptyDescription>
                Create a new board to get started or adjust search.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                className={buttonVariants({ variant: "default" })}
                params={{
                  slug: organization.slug,
                }}
                to="/org/$slug/admin/boards/new"
              >
                <PlusIcon />
                Add new board
              </Link>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </div>
  );
}
