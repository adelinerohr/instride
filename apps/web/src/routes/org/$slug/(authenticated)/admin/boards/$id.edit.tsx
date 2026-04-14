import {
  useUpdateBoard,
  boardsOptions,
  membersOptions,
  servicesOptions,
} from "@instride/api";
import { getUser } from "@instride/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import {
  boardFormOpts,
  buildBoardDefaultValues,
} from "@/features/organization/lib/board.form";
import { UserAvatarItem } from "@/shared/components/fragments/user-avatar";
import { DetailLayout } from "@/shared/components/layout/detail-layout";
import { Page, PageHeader } from "@/shared/components/layout/page";
import { buttonVariants } from "@/shared/components/ui/button";
import { FieldGroup } from "@/shared/components/ui/field";
import { useAppForm } from "@/shared/hooks/form";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/boards/$id/edit"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(boardsOptions.byId(params.id));
    await context.queryClient.ensureQueryData(membersOptions.trainers());
    await context.queryClient.ensureQueryData(servicesOptions.all());
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: board } = useSuspenseQuery(boardsOptions.byId(id));
  const { data: trainers } = useSuspenseQuery(membersOptions.trainers());
  const { data: services } = useSuspenseQuery(servicesOptions.all());

  const updateBoard = useUpdateBoard();
  const navigate = Route.useNavigate();

  const form = useAppForm({
    ...boardFormOpts,
    defaultValues: buildBoardDefaultValues(board),
    onSubmit: async ({ value }) => {
      updateBoard.mutateAsync(
        {
          boardId: board.id,
          request: {
            name: value.name,
            canRiderAdd: false,
            trainerIds: value.trainerIds,
            serviceIds: value.serviceIds,
          },
        },
        {
          onSuccess: () => {
            toast.success("Board updated successfully");
            navigate({
              to: "/org/$slug/admin/boards",
            });
          },
          onError: () => {
            toast.error("Failed to update board");
          },
        }
      );
    },
  });

  return (
    <Page>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <PageHeader title="Edit Board">
          <div className="flex items-center gap-2">
            <Link className={buttonVariants({ variant: "outline" })} to="..">
              Cancel
            </Link>
            <form.AppForm>
              <form.SubmitButton label="Save" loadingLabel="Saving..." />
            </form.AppForm>
          </div>
        </PageHeader>
        <DetailLayout
          title="About boards"
          description="Add staff and/or venues to this board so they can be booked for appointments. Add services to define the types of appointments that will be bookable."
        >
          {/* Basic info */}
          <FieldGroup className="rounded-md border bg-card p-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <form.AppField
              name="name"
              children={(field) => (
                <field.TextField
                  label="Board Name"
                  placeholder="School Barn, Boarder Lessons..."
                />
              )}
            />
            <form.AppField
              name="canRiderAdd"
              children={(field) => (
                <field.SwitchField
                  label="Riders can add lessons"
                  description="Allow riders to add lessons to this board"
                />
              )}
            />
          </FieldGroup>
          <FieldGroup className="rounded-md border bg-card p-4">
            <h2 className="text-xl font-semibold">Trainers</h2>
            <form.AppField
              name="trainerIds"
              children={(field) => (
                <field.MultiSelectField
                  items={trainers}
                  description="Choose which trainers will be available for this board."
                  itemToValue={(item) => item.id}
                  itemToLabel={(item) => getUser({ trainer: item }).name}
                  renderValue={(item) => (
                    <UserAvatarItem user={getUser({ trainer: item })} />
                  )}
                  placeholder="Select trainers"
                />
              )}
            />
          </FieldGroup>
          <FieldGroup className="rounded-md border bg-card p-4">
            <h2 className="text-xl font-semibold">Services</h2>
            <form.AppField
              name="serviceIds"
              children={(field) => (
                <field.MultiSelectField
                  items={services}
                  description="Choose which services will be available for this board."
                  itemToValue={(item) => item.id}
                  itemToLabel={(item) => item.name}
                  renderValue={(item) => item.name}
                  placeholder="Select services"
                />
              )}
            />
          </FieldGroup>
        </DetailLayout>
      </form>
    </Page>
  );
}
