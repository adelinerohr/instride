import { useChangeRole } from "@instride/api";
import { MembershipRole, type MemberWithUser } from "@instride/shared";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHandler,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useAppForm } from "@/shared/hooks/form";
import { getFirstName } from "@/shared/lib/utils/format";

const allRoles = [
  { value: MembershipRole.ADMIN, label: "Admin" },
  { value: MembershipRole.TRAINER, label: "Trainer" },
  { value: MembershipRole.RIDER, label: "Rider" },
];

export const changeRoleModalHandler = DialogHandler.createHandle<{
  member: MemberWithUser;
}>();

export function ChangeRoleModal() {
  return (
    <Dialog handle={changeRoleModalHandler}>
      {({ payload }) => {
        const member = payload?.member;
        if (!member) return null;

        return (
          <DialogPortal>
            <ChangeRoleForm
              member={member}
              onSuccess={() => changeRoleModalHandler.close()}
            />
          </DialogPortal>
        );
      }}
    </Dialog>
  );
}

function ChangeRoleForm({
  member,
  onSuccess,
}: {
  member: MemberWithUser;
  onSuccess: () => void;
}) {
  const changeRole = useChangeRole();

  const form = useAppForm({
    defaultValues: {
      roles: member.roles ?? [],
    },
    validators: {
      onSubmit: z.object({
        roles: z.array(z.enum(MembershipRole)).min(1),
      }),
    },
    onSubmit: async ({ value }) => {
      changeRole.mutate(
        { memberId: member.id, request: { roles: value.roles } },
        {
          onSuccess: () => {
            toast.success("Roles updated successfully");
            onSuccess();
          },
          onError: (error) => toast.error(error.message),
        }
      );
    },
  });

  return (
    <DialogContent>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <DialogHeader>
          <DialogTitle>
            Change {getFirstName(member.authUser.name)}'s role(s)
          </DialogTitle>
        </DialogHeader>
        <form.AppField
          name="roles"
          children={(field) => (
            <field.MultiSelectField
              placeholder="Select role(s)"
              items={allRoles}
              itemToValue={(item) => item.value}
              itemToLabel={(item) => item.label}
              renderValue={(item) => item.label}
            />
          )}
        />
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <form.AppForm>
            <form.SubmitButton label="Save changes" loadingLabel="Saving..." />
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
