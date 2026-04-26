import { boardsOptions, useCreateQuestionnaire } from "@instride/api";
import { useStore } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { QuestionBuilder } from "@/features/organization/components/questionnaires/question-builder";
import { RuleBuilder } from "@/features/organization/components/questionnaires/rule-builder";
import { questionnaireFormOpts } from "@/features/organization/lib/questionnaire.form";
import { createEmptyQuestion } from "@/features/organization/utils/questionnaire";
import { PageHeader } from "@/shared/components/layout/page";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { FieldGroup } from "@/shared/components/ui/field";
import { useAppForm } from "@/shared/hooks/use-form";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/settings/organization/questionnaires/new"
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(boardsOptions.list());
  },
});

function RouteComponent() {
  const { data: boards } = useSuspenseQuery(boardsOptions.list());
  const createQuestionnaire = useCreateQuestionnaire();
  const navigate = Route.useNavigate();

  const form = useAppForm({
    ...questionnaireFormOpts,
    onSubmit: ({ value }) => {
      createQuestionnaire.mutateAsync(value, {
        onSuccess: () => {
          toast.success("Questionnaire created successfully");
          navigate({ to: "/org/$slug/settings/organization/questionnaires" });
        },
        onError: (error) => {
          toast.error("Failed to create questionnaire", {
            description: error.message,
          });
          console.error(error);
        },
      });
    },
  });

  const questions = useStore(form.store, (state) => state.values.questions);

  const addQuestion = () => {
    form.setFieldValue("questions", [
      ...questions,
      createEmptyQuestion(questions.length),
    ]);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <PageHeader
        title="New Questionnaire"
        description="Create a new questionnaire to assess rider experience and automatically assign them to appropriate boards during onboarding."
        action={
          <div className="flex items-center gap-2">
            <Link
              to=".."
              className={buttonVariants({ variant: "destructive" })}
            >
              Cancel
            </Link>
            <form.AppForm>
              <form.SubmitButton
                label="Create Questionnaire"
                loadingLabel="Creating..."
              />
            </form.AppForm>
          </div>
        }
      />
      <div className="space-y-4 p-4">
        <Card>
          <CardContent>
            <FieldGroup>
              <form.AppField
                name="name"
                children={(field) => (
                  <field.TextField
                    label="Questionnaire Name"
                    placeholder="e.g., Rider Experience Assessment"
                  />
                )}
              />
              <form.AppField
                name="defaultBoardId"
                children={(field) => (
                  <field.ClearableSelectField
                    label="Default Board (Fallback)"
                    placeholder="Select a default board (optional)"
                    description="Assign to this board if no rules match the user's answers"
                    items={boards}
                    itemToValue={(board) => board?.id ?? null}
                    renderValue={(board) =>
                      board?.name ?? "No default (required rules match)"
                    }
                  />
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Questions</h3>
                <p className="text-sm text-muted-foreground">
                  Create questions that riders will answer during onboarding
                </p>
              </div>
              <Button type="button" onClick={addQuestion} variant="outline">
                <PlusIcon />
                Add Question
              </Button>
            </div>
            <FieldGroup className="space-y-4">
              {questions.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No questions yet. Click "Add Question" to create your first
                    question.
                  </p>
                </div>
              )}

              {questions
                .sort((a, b) => a.order - b.order)
                .map((question, index) => (
                  <QuestionBuilder
                    form={form}
                    key={question.id}
                    index={index}
                    question={question}
                  />
                ))}
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <RuleBuilder form={form} boards={boards} />
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
