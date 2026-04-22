import {
  getUser,
  membersOptions,
  servicesOptions,
  useCreateBoard,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";

import { boardFormOpts } from "@/features/organization/lib/board.form";
import { UserAvatarItem } from "@/shared/components/fragments/user-avatar";
import { DetailLayout } from "@/shared/components/layout/detail-layout";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { FieldGroup } from "@/shared/components/ui/field";
import { useAppForm } from "@/shared/hooks/use-form";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/boards/new"
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(membersOptions.trainers());
    await context.queryClient.ensureQueryData(servicesOptions.all());
  },
});

function RouteComponent() {
  const createBoard = useCreateBoard();
  const navigate = Route.useNavigate();
  const router = useRouter();

  const { data: trainers } = useSuspenseQuery(membersOptions.trainers());
  const { data: services } = useSuspenseQuery(servicesOptions.all());

  const form = useAppForm({
    ...boardFormOpts,
    onSubmit: async ({ value }) => {
      createBoard.mutateAsync(
        {
          name: value.name,
          canRiderAdd: false,
          trainerIds: value.trainerIds,
          serviceIds: value.serviceIds,
        },
        {
          onSuccess: () => {
            toast.success("Board created successfully");
            navigate({
              to: "/org/$slug/admin/boards",
            });
          },
          onError: () => {
            toast.error("Failed to create board");
          },
        }
      );
    },
  });

  return (
    <form
      className="relative flex h-full flex-col overflow-hidden"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="flex items-center justify-between border-b px-2 py-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.history.back()}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ArrowLeftIcon />
          </Button>
          <h1 className="font-semibold text-2xl">Create New Board</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link className={buttonVariants({ variant: "outline" })} to="..">
            Cancel
          </Link>
          <form.AppForm>
            <form.SubmitButton label="Add" loadingLabel="Adding..." />
          </form.AppForm>
        </div>
      </div>
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
  );
}
