import {
  boardsOptions,
  getUser,
  membersOptions,
  levelOptions,
  servicesOptions,
  useUpdateService,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeftIcon, CircleIcon, CoinsIcon } from "lucide-react";
import { toast } from "sonner";

import {
  buildServiceDefaultValues,
  serviceFormOpts,
} from "@/features/organization/lib/service.form";
import { UserAvatarItem } from "@/shared/components/fragments/user-avatar";
import { DetailLayout } from "@/shared/components/layout/detail-layout";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { FieldGroup } from "@/shared/components/ui/field";
import {
  InputGroupAddon,
  InputGroupText,
} from "@/shared/components/ui/input-group";
import { useAppForm } from "@/shared/hooks/use-form";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/services/$id/edit"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(servicesOptions.byId(params.id));
    await context.queryClient.ensureQueryData(membersOptions.trainers());
    await context.queryClient.ensureQueryData(boardsOptions.list());
    await context.queryClient.ensureQueryData(levelOptions.list());
  },
});

function RouteComponent() {
  const updateService = useUpdateService();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const { id } = Route.useParams();

  const { data: trainers } = useSuspenseQuery(membersOptions.trainers());
  const { data: boards } = useSuspenseQuery(boardsOptions.list());
  const { data: levels } = useSuspenseQuery(levelOptions.list());
  const { data: service } = useSuspenseQuery(servicesOptions.byId(id));

  const form = useAppForm({
    ...serviceFormOpts,
    defaultValues: buildServiceDefaultValues(service),
    onSubmit: async ({ value }) => {
      console.log("Submitting service form: ", value);
      updateService.mutateAsync(
        {
          serviceId: id,
          request: value,
        },
        {
          onSuccess: () => {
            toast.success("Service updated successfully");
            navigate({
              to: "/org/$slug/admin/services",
            });
          },
          onError: () => {
            toast.error("Failed to update service");
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
          <h1 className="font-semibold text-2xl">Edit Service</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link className={buttonVariants({ variant: "outline" })} to="..">
            Cancel
          </Link>
          <form.AppForm>
            <form.SubmitButton label="Save" loadingLabel="Saving..." />
          </form.AppForm>
        </div>
      </div>
      <DetailLayout
        title="About services"
        description="Services define the types of appointments that can be booked."
      >
        {/* Basic info */}
        <FieldGroup className="rounded-md border bg-card p-4 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>
          <form.AppField
            name="name"
            children={(field) => (
              <field.TextField
                label="Service Name"
                placeholder="Private Lesson, Flat Lesson, Training Ride..."
              />
            )}
          />
          <form.AppField
            name="description"
            children={(field) => (
              <field.TextareaField
                label="Description"
                placeholder="Describe the service"
              />
            )}
          />
        </FieldGroup>

        {/* Boards */}
        <FieldGroup className="rounded-md border bg-card p-4 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Boards</h2>
          <form.AppField
            name="boardIds"
            children={(field) => (
              <field.MultiSelectField
                items={boards}
                description="Choose which boards this service will be available on."
                itemToValue={(item) => item.id}
                itemToLabel={(item) => item.name}
                renderValue={(item) => item.name}
                placeholder="Select boards"
              />
            )}
          />
        </FieldGroup>

        {/* Trainers */}
        <FieldGroup className="rounded-md border bg-card p-4 flex flex-col gap-4">
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

        {/* Pricing */}
        <FieldGroup className="rounded-md border bg-card p-4 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Pricing</h2>
          <form.AppField
            name="price"
            children={(field) => (
              <field.TextField
                type="number"
                label="Price"
                placeholder="0"
                inputGroup
              >
                <InputGroupAddon align="inline-start">
                  <InputGroupText>$</InputGroupText>
                </InputGroupAddon>
              </field.TextField>
            )}
          />
          <form.AppField
            name="creditPrice"
            children={(field) => (
              <field.TextField
                type="number"
                label="Price in credits"
                placeholder="0"
                inputGroup
              >
                <InputGroupAddon align="inline-start">
                  <CoinsIcon className="size-4" />
                </InputGroupAddon>
              </field.TextField>
            )}
          />
          <form.AppField
            name="creditAdditionalPrice"
            children={(field) => (
              <field.TextField
                type="number"
                label="Additional charge when using credits"
                placeholder="0"
                inputGroup
              >
                <InputGroupAddon align="inline-start">
                  <InputGroupText>$</InputGroupText>
                </InputGroupAddon>
              </field.TextField>
            )}
          />
        </FieldGroup>

        {/* Booking Conditions */}
        <FieldGroup className="rounded-md border bg-card p-4 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Booking Conditions</h2>
          <form.AppField
            name="isPrivate"
            listeners={{
              onChange: ({ value }) => {
                if (value === false) {
                  form.setFieldValue("maxRiders", 1);
                }
              },
            }}
            children={(field) => (
              <field.SwitchField
                label="Make service private"
                onCheckedChange={(checked) => {
                  field.handleChange(checked);
                  if (checked) form.setFieldValue("maxRiders", 1);
                }}
              />
            )}
          />
          <form.AppField
            name="canRecurBook"
            children={(field) => (
              <field.SwitchField label="Allow riders to book recurring lessons" />
            )}
          />
          <form.AppField
            name="canRiderAdd"
            children={(field) => (
              <field.SwitchField label="Allow riders to add this lesson to the schedule" />
            )}
          />
          <form.AppField
            name="isRestricted"
            listeners={{
              onChange: ({ value }) => {
                if (value === false) {
                  form.setFieldValue("restrictedToLevelId", null);
                }
              },
            }}
            children={(field) => (
              <field.SwitchField label="Restrict booking to riders with specific levels" />
            )}
          />
          <form.Subscribe selector={(state) => state.values.isRestricted}>
            {(isRestricted) =>
              isRestricted && (
                <form.AppField
                  name="restrictedToLevelId"
                  children={(field) => (
                    <field.SelectField
                      placeholder="Select a level"
                      items={levels}
                      itemToValue={(level) => level.id}
                      renderValue={(level) => (
                        <div className="flex items-center gap-2">
                          <CircleIcon stroke={level.color} fill={level.color} />
                          <span>{level.name}</span>
                        </div>
                      )}
                    />
                  )}
                />
              )
            }
          </form.Subscribe>
          <form.Subscribe selector={(state) => state.values.isPrivate}>
            {(isPrivate) =>
              !isPrivate && (
                <form.AppField
                  name="maxRiders"
                  children={(field) => (
                    <field.TextField
                      type="number"
                      label="Maximum Riders"
                      placeholder="1"
                    />
                  )}
                />
              )
            }
          </form.Subscribe>
          <form.AppField
            name="duration"
            children={(field) => (
              <field.TextField
                type="number"
                label="Duration (minutes)"
                placeholder="30"
                inputGroup
              >
                <InputGroupAddon align="inline-end">
                  <InputGroupText>minutes</InputGroupText>
                </InputGroupAddon>
              </field.TextField>
            )}
          />
        </FieldGroup>
      </DetailLayout>
    </form>
  );
}
