import {
  boardsOptions,
  useDeleteService,
  servicesOptions,
  type types,
} from "@instride/api";
import { getUser } from "@instride/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CircleIcon,
  ClipboardIcon,
  EllipsisIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { Page, PageHeader } from "@/shared/components/layout/page";
import { AvatarGroup } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { FacetedFilter } from "@/shared/components/ui/faceted-filter";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/shared/components/ui/input-group";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/services/"
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    const [services, boards] = await Promise.all([
      context.queryClient.ensureQueryData(servicesOptions.all()),
      context.queryClient.ensureQueryData(boardsOptions.list()),
    ]);
    return { services, boards };
  },
});

function RouteComponent() {
  const { organization } = Route.useRouteContext();
  const { data: services, isLoading: isServicesLoading } = useSuspenseQuery(
    servicesOptions.all()
  );
  const { data: boards, isLoading: isBoardsLoading } = useSuspenseQuery(
    boardsOptions.list()
  );

  const deleteService = useDeleteService();

  const [selectedBoardIds, setSelectedBoardIds] = React.useState<Set<string>>(
    new Set()
  );

  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const filteredServices = services.filter((service) => {
    // Filter by search query
    const matchesSearch =
      !searchQuery ||
      service?.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1;

    // Filter by selected boards (if any are selected)
    const matchesBoards =
      selectedBoardIds.size === 0 ||
      service.boardAssignments?.some((assignment) =>
        selectedBoardIds.has(assignment.boardId)
      );

    return matchesSearch && matchesBoards;
  });

  const handleSearchQueryChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSearchQuery(e.target?.value || "");
  };

  if (isServicesLoading || isBoardsLoading || !services || !boards) {
    return <div>Loading...</div>;
  }

  return (
    <Page>
      <PageHeader title="Services" backButton={false}>
        <div className="flex items-center gap-4">
          <InputGroup className="w-fit bg-white">
            <InputGroupInput
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchQueryChange}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          <FacetedFilter
            title="Boards"
            selectedValues={selectedBoardIds}
            options={boards.map((board) => ({
              label: board.name,
              value: board.id,
            }))}
            onChange={setSelectedBoardIds}
          />
          {(selectedBoardIds.size > 0 || searchQuery !== "") && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedBoardIds(new Set());
                setSearchQuery("");
              }}
              className="h-8 px-2 lg:px-3"
            >
              {"Clear Filters"}
              <XIcon className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Link
            params={{ slug: organization.slug }}
            to="/org/$slug/admin/services/new"
            className={buttonVariants({ variant: "default" })}
          >
            <PlusIcon />
            New Service
          </Link>
        </div>
      </PageHeader>
      <div className="px-4">
        {filteredServices.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredServices.map((service) => {
              const assignedTrainers =
                service.trainerAssignments
                  ?.map((assignment) => assignment.trainer)
                  .filter((t): t is types.Trainer => t != null) ?? [];

              return (
                <Link
                  params={{
                    slug: organization.slug,
                    id: service.id,
                  }}
                  to="/org/$slug/admin/services/$id"
                  key={service.id}
                  className="group hover:border-secondary-border border p-4 bg-white rounded-md flex items-start justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold group-hover:text-primary">
                        {service.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        {service.restrictedToLevel && (
                          <Badge variant="secondary">
                            <CircleIcon
                              fill={service.restrictedToLevel.color}
                              stroke={service.restrictedToLevel.color}
                            />
                            {service.restrictedToLevel.name}
                          </Badge>
                        )}
                        {service.boardAssignments?.map((assignment) => (
                          <Badge variant="outline" key={assignment.boardId}>
                            {assignment.board?.name ?? ""}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-muted-foreground text-sm">
                        {service.duration} minutes
                      </p>
                      &middot;
                      <p className="text-muted-foreground text-sm">
                        ${service.price}
                      </p>
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
                      <span className="text-muted-foreground text-sm">
                        {assignedTrainers.length} trainer
                        {assignedTrainers.length > 1 ? "s" : ""} assigned
                      </span>
                      &middot;
                      <p className="text-muted-foreground text-sm">
                        {service.canRiderAdd
                          ? `Riders can add a ${service.name}`
                          : `Only instructors can add a ${service.name}`}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.preventDefault()}
                      render={<Button variant="ghost" size="icon" />}
                    >
                      <EllipsisIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link
                        params={{
                          slug: organization.slug,
                          id: service.id,
                        }}
                        to="/org/$slug/admin/services/$id"
                      >
                        <DropdownMenuItem>
                          <EyeIcon />
                          View
                        </DropdownMenuItem>
                      </Link>
                      <Link
                        params={{
                          slug: organization.slug,
                          id: service.id,
                        }}
                        to="/org/$slug/admin/services/$id/edit"
                      >
                        <DropdownMenuItem>
                          <PencilIcon />
                          Edit
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() =>
                          deleteService.mutateAsync(service.id, {
                            onSuccess: () => {
                              toast.success("Service deleted successfully");
                            },
                            onError: () => {
                              toast.error("Failed to delete service");
                            },
                          })
                        }
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
          <Empty className="w-full border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardIcon className="size-6" />
              </EmptyMedia>
              <EmptyTitle>No services found</EmptyTitle>
              <EmptyDescription>
                Create a new service to get started or adjust search.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                params={{
                  slug: organization.slug,
                }}
                to="/org/$slug/admin/services/new"
                className={buttonVariants({ variant: "default" })}
              >
                <PlusIcon />
                Add new service
              </Link>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </Page>
  );
}
