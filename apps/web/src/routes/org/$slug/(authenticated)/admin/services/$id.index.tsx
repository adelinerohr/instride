import {
  boardsOptions,
  membersOptions,
  servicesOptions,
  useDeleteService,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BanIcon,
  BanknoteIcon,
  ChevronRightIcon,
  ClipboardIcon,
  ClockIcon,
  CoinsIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
} from "lucide-react";

import { confirmationModalHandler } from "@/shared/components/confirmation-modal";
import {
  DetailAvatarItem,
  DetailCard,
  DetailIconItem,
  DetailItem,
  DetailLayout,
  DetailRelationCard,
} from "@/shared/components/layout/detail-layout";
import { Page, PageHeader } from "@/shared/components/layout/page";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { DialogTrigger } from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/services/$id/"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(servicesOptions.byId(params.id));
    context.queryClient.ensureQueryData(membersOptions.trainers());
    context.queryClient.ensureQueryData(boardsOptions.list());
  },
});

function RouteComponent() {
  const params = Route.useParams();
  const { data: service } = useSuspenseQuery(servicesOptions.byId(params.id));
  const { data: boards } = useSuspenseQuery(boardsOptions.list());
  const { data: trainers } = useSuspenseQuery(membersOptions.trainers());

  const deleteService = useDeleteService();

  const assignedBoards = boards.filter((board) =>
    service.boardAssignments?.some(
      (assignment) => assignment.boardId === board.id
    )
  );

  const assignedTrainers = trainers.filter((trainer) =>
    service.trainerAssignments?.some(
      (assignment) => assignment.trainerId === trainer.id
    )
  );

  return (
    <Page>
      <PageHeader title={service.name}>
        <div className="flex items-center gap-2">
          <Link
            to="/org/$slug/admin/services/new"
            params={{ slug: params.slug }}
            className={buttonVariants({ variant: "default" })}
          >
            <PlusIcon />
            <span className="hidden sm:inline">Add new service</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="icon" />}
            >
              <EllipsisVerticalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link
                to="/org/$slug/admin/services/$id/edit"
                params={{ slug: params.slug, id: params.id }}
              >
                <DropdownMenuItem>
                  <PencilIcon />
                  Edit
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DialogTrigger
                handle={confirmationModalHandler}
                payload={{
                  title: `Delete service: ${service.name}`,
                  description: `Are you sure you want to delete this board? This action cannot be undone.`,
                  confirmLabel: "Delete",
                  cancelLabel: "Cancel",
                  onConfirm: () => deleteService.mutateAsync(service.id),
                }}
                render={<DropdownMenuItem variant="destructive" />}
                nativeButton={false}
              >
                <TrashIcon />
                Delete
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </PageHeader>
      <DetailLayout
        title="About services"
        description="Services define the types of appointments that can be booked."
      >
        <DetailCard title="Pricing & Customers">
          <DetailItem
            title="Price"
            content={`$${service.price}`}
            icon={BanknoteIcon}
          />
          <DetailItem
            title="Price in credits"
            content={`${service.creditPrice}${service.creditAdditionalPrice && service.creditAdditionalPrice > 0 ? ` + $${service.creditAdditionalPrice}` : ""}`}
            icon={CoinsIcon}
          />
          <DetailItem
            title="Max. customers"
            content={service.maxRiders}
            icon={UsersIcon}
          />
        </DetailCard>
        <DetailCard title="Booking Details">
          <DetailItem
            title="Duration"
            content={`${service.duration} minutes`}
            icon={ClockIcon}
          />
          <DetailItem
            title="Restricted?"
            content={service.isRestricted ? "Yes" : "No"}
            icon={BanIcon}
          />
          <DetailItem
            title="Can riders add?"
            content={service.canRiderAdd ? "Yes" : "No"}
            icon={PlusIcon}
          />
        </DetailCard>
        <DetailRelationCard
          title="Trainers"
          renderEmpty={assignedTrainers.length === 0}
          emptyTitle="No trainers assigned"
          emptyDescription="Add trainers to this service."
          emptyIcon={ClipboardIcon}
        >
          {assignedTrainers.map((trainer) => (
            <DetailAvatarItem
              key={trainer.id}
              imageSrc={trainer.member?.authUser?.image}
              name={trainer.member?.authUser?.name || "Trainer"}
              content={trainer.member?.authUser?.email || "Email"}
              action={
                <Link
                  to="/org/$slug/admin/members/$id"
                  params={{ slug: params.slug, id: trainer.memberId }}
                  className={buttonVariants({
                    variant: "outline",
                    size: "icon-lg",
                  })}
                >
                  <ChevronRightIcon />
                </Link>
              }
            />
          ))}
        </DetailRelationCard>
        <DetailRelationCard
          title="Boards"
          renderEmpty={assignedBoards.length === 0}
          emptyTitle="No boards assigned"
          emptyDescription="Add boards to this service."
          emptyIcon={ClipboardIcon}
        >
          {assignedBoards.map((board) => (
            <DetailIconItem
              key={board.id}
              title={board.name}
              icon={ClipboardIcon}
              action={
                <Link
                  to="/org/$slug/admin/boards/$id"
                  params={{ slug: params.slug, id: board.id }}
                  className={buttonVariants({
                    variant: "outline",
                    size: "icon-lg",
                  })}
                >
                  <ChevronRightIcon />
                </Link>
              }
            />
          ))}
        </DetailRelationCard>
      </DetailLayout>
    </Page>
  );
}
