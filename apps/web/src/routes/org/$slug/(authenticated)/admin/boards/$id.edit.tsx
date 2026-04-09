import { useUpdateBoard, boardsOptions } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { BoardForm } from "@/features/organization/components/boards/form";
import {
  boardFormOpts,
  buildBoardDefaultValues,
} from "@/features/organization/lib/board.form";
import { useAppForm } from "@/shared/hooks/form";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/boards/$id/edit"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(boardsOptions.byId(params.id));
  },
});

function RouteComponent() {
  const { organization } = Route.useRouteContext();
  const { id } = Route.useParams();
  const { data: board } = useSuspenseQuery(boardsOptions.byId(id));
  const updateBoard = useUpdateBoard();
  const navigate = useNavigate();

  const form = useAppForm({
    ...boardFormOpts,
    defaultValues: buildBoardDefaultValues(board),
    onSubmit: async ({ value }) => {
      await updateBoard.mutateAsync({
        boardId: id,
        request: value,
      });
      navigate({
        to: "/org/$slug/admin/boards",
        params: { slug: organization.slug },
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <BoardForm
        form={form}
        trainers={board.assignments}
        serviceAssignments={board.serviceBoardAssignments}
      />
      <form.AppForm>
        <form.SubmitButton
          label="Create Board"
          loadingLabel="Creating Board..."
        />
      </form.AppForm>
    </form>
  );
}
