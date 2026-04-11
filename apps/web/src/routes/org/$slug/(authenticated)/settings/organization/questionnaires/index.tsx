import { questionnaireOptions } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArchiveIcon,
  ClipboardIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react";

import { PageHeader } from "@/shared/components/layout/page";
import { buttonVariants } from "@/shared/components/ui/button";
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

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/settings/organization/questionnaires/"
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(questionnaireOptions.list());
  },
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const { data: questionnaires } = useSuspenseQuery(
    questionnaireOptions.list()
  );

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Questionnaires"
        description="Manage questionnaires that riders must complete."
        action={
          <Link
            to="/org/$slug/settings/organization/questionnaires/new"
            params={{ slug }}
            className={buttonVariants({ variant: "default" })}
          >
            <PlusIcon />
            New questionnaire
          </Link>
        }
      />
      <div className="flex-1 overflow-auto p-6">
        {questionnaires.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardIcon />
              </EmptyMedia>
              <EmptyTitle>No questionnaires yet</EmptyTitle>
              <EmptyDescription>
                Create your first questionnaire to start automatically assigning
                riders to boards during onboarding.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                to="/org/$slug/settings/organization/questionnaires/new"
                params={{ slug }}
                className={buttonVariants({ variant: "default" })}
              >
                <PlusIcon />
                New questionnaire
              </Link>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Questions
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Rules
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {questionnaires.map((questionnaire) => (
                  <tr
                    key={questionnaire.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{questionnaire.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      {questionnaire.boardAssignmentRules.length}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {questionnaire.questions.length}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {questionnaire.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          <EllipsisVerticalIcon className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-fit">
                          <DropdownMenuItem
                            nativeButton={false}
                            render={
                              <Link
                                to="/org/$slug/settings/organization/questionnaires/$id/edit"
                                params={{ slug, id: questionnaire.id }}
                              />
                            }
                          >
                            <PencilIcon />
                            Edit questionnaire
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">
                            <ArchiveIcon />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
