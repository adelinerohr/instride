import {
  boardsOptions,
  membersOptions,
  servicesOptions,
  useDeleteBoard,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";

import {
  ConfirmationModal,
  confirmationModalHandler,
} from "@/shared/components/confirmation-modal";
import {
  DetailAvatarItem,
  DetailIconItem,
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
  "/org/$slug/(authenticated)/admin/boards/$id/"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(boardsOptions.byId(params.id));
    context.queryClient.ensureQueryData(membersOptions.trainers());
    context.queryClient.ensureQueryData(
      servicesOptions.assignedToBoard(params.id)
    );
  },
});

function RouteComponent() {
  const params = Route.useParams();
  const router = useRouter();
  const { data: board } = useSuspenseQuery(boardsOptions.byId(params.id));
  const { data: trainers } = useSuspenseQuery(membersOptions.trainers());
  const { data: services } = useSuspenseQuery(
    servicesOptions.assignedToBoard(params.id)
  );

  const deleteBoard = useDeleteBoard();

  const assignedTrainers = trainers.filter((trainer) =>
    board.assignments?.some((assignment) => assignment.trainerId === trainer.id)
  );

  return (
    <Page>
      <PageHeader title={board.name}>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.history.back()}
          >
            <ChevronLeftIcon />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="font-bold text-2xl">{board.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/org/$slug/admin/boards/new"
            params={{ slug: params.slug }}
            className={buttonVariants({ variant: "default" })}
          >
            <PlusIcon />
            <span className="hidden sm:inline">Add new board</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="icon" />}
            >
              <EllipsisVerticalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link
                to="/org/$slug/admin/boards/$id/edit"
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
                  title: `Delete board: ${board.name}`,
                  description: `Are you sure you want to delete this board? This action cannot be undone.`,
                  confirmLabel: "Delete",
                  cancelLabel: "Cancel",
                  onConfirm: () => deleteBoard.mutateAsync(board.id),
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
        title="About boards"
        description="Add staff and/or venues to this board so they can be booked for appointments. Add services to define the types of appointments that will be bookable."
      >
        <DetailRelationCard
          title="Trainers"
          description="Trainers are the staff members who will open for bookings on this board."
          renderEmpty={assignedTrainers.length === 0}
          emptyTitle="No trainers assigned"
          emptyDescription="Add trainers to this board."
          emptyIcon={ClipboardIcon}
        >
          {assignedTrainers.map((trainer) => (
            <DetailAvatarItem
              key={trainer.id}
              name={trainer.member?.authUser?.name || "Trainer"}
              imageSrc={trainer.member?.authUser?.image}
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
          title="Services"
          description="Services are the types of appointments that can be booked on this board."
          renderEmpty={services.length === 0}
          emptyTitle="No services assigned"
          emptyDescription="Add services to this board to start booking appointments."
          emptyIcon={ClipboardIcon}
        >
          {services.map((service) => (
            <DetailIconItem
              key={service.id}
              title={service.name}
              icon={ClipboardIcon}
            />
          ))}
        </DetailRelationCard>
      </DetailLayout>
      <ConfirmationModal />
    </Page>
  );
}
