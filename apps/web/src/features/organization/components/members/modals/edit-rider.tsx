import {
  getUser,
  useAssignToBoard,
  useBoards,
  useLevels,
  useRemoveFromBoard,
  useUpdateRider,
  type Rider,
} from "@instride/api";
import { CircleIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHandler,
  DialogPortal,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/shared/components/ui/dialog";
import { FieldGroup } from "@/shared/components/ui/field";
import { useAppForm } from "@/shared/hooks/use-form";

interface EditRiderModalPayload {
  rider: Rider;
}

export const editRiderModalHandler =
  DialogHandler.createHandle<EditRiderModalPayload>();

export function EditRiderModal() {
  return (
    <Dialog handle={editRiderModalHandler}>
      {({ payload }) => (
        <DialogPortal>
          {payload && <EditRiderModalForm {...payload} />}
        </DialogPortal>
      )}
    </Dialog>
  );
}

export function EditRiderModalForm({ rider }: EditRiderModalPayload) {
  const riderUser = getUser({ rider });
  const updateRider = useUpdateRider();
  const assignToBoard = useAssignToBoard();
  const unassignFromBoard = useRemoveFromBoard();

  const { data: levels } = useLevels();
  const { data: boards } = useBoards();

  const form = useAppForm({
    defaultValues: {
      name: riderUser.name,
      ridingLevelId: rider.ridingLevelId,
      boardIds: (rider.boardAssignments ?? []).map(
        (assignment) => assignment.boardId
      ),
    },
    onSubmit: ({ value }) => {
      // TODO: Update user name
      try {
        // Update rider level
        updateRider.mutateAsync({
          riderId: rider.id,
          ridingLevelId: value.ridingLevelId,
        });

        // Boards to assign
        const newBoards = value.boardIds.filter(
          (boardId) =>
            !rider.boardAssignments?.some(
              (assignment) => assignment.boardId === boardId
            )
        );
        // Boards to unassign
        const boardsToUnassign = rider.boardAssignments?.filter(
          (assignment) => !value.boardIds.includes(assignment.boardId)
        );

        // Assign new boards
        newBoards.forEach((boardId) => {
          assignToBoard.mutateAsync({
            boardId,
            riderId: rider.id,
          });
        });

        // Unassign boards
        boardsToUnassign?.forEach((assignment) => {
          unassignFromBoard.mutateAsync({
            assignmentId: assignment.id,
          });
        });

        toast.success("Rider updated successfully");
        editRiderModalHandler.close();
      } catch (error) {
        console.error(error);
        toast.error("Failed to update rider");
      }
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
          <DialogTitle>Edit Rider: {riderUser.name}</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <form.AppField
            name="name"
            children={(field) => (
              <field.TextField label="Name" placeholder="Enter name" />
            )}
          />
          <form.AppField
            name="ridingLevelId"
            children={(field) => (
              <field.ClearableSelectField
                label="Riding Level"
                placeholder="Unrestricted"
                clearableLabel="Unrestricted"
                items={levels ?? []}
                itemToValue={(level) => level?.id ?? null}
                renderValue={(level) => (
                  <div className="flex items-center gap-2">
                    <CircleIcon stroke={level?.color} fill={level?.color} />
                    {level?.name}
                  </div>
                )}
              />
            )}
          />
          <form.AppField
            name="boardIds"
            children={(field) => (
              <field.MultiSelectField
                label="Boards"
                placeholder="Select the boards for the rider"
                items={boards ?? []}
                itemToValue={(board) => board.id}
                itemToLabel={(board) => board.name}
                renderValue={(board) => board.name}
              />
            )}
          />
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <form.AppForm>
            <form.SubmitButton
              label="Save Changes"
              loadingLabel="Saving Changes..."
            />
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
