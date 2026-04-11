import { boardsOptions, questionnaireOptions } from "@instride/api";
import { useStore } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

import { QuestionBuilder } from "@/features/organization/components/questionnaires/question-builder";
import { RuleBuilder } from "@/features/organization/components/questionnaires/rule-builder";
import {
  buildQuestionnaireDefaultValues,
  questionnaireFormOpts,
} from "@/features/organization/lib/questionnaire.form";
import { createEmptyQuestion } from "@/features/organization/utils/questionnaire";
import { PageHeader } from "@/shared/components/layout/page";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { FieldGroup } from "@/shared/components/ui/field";
import { useAppForm } from "@/shared/hooks/form";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/settings/organization/questionnaires/$id/edit"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      questionnaireOptions.byId(params.id)
    );
    await context.queryClient.ensureQueryData(boardsOptions.list());
  },
});

function RouteComponent() {
  const { id, slug } = Route.useParams();
  const { data: boards } = useSuspenseQuery(boardsOptions.list());
  const { data: questionnaire } = useSuspenseQuery(
    questionnaireOptions.byId(id)
  );

  const form = useAppForm({
    ...questionnaireFormOpts,
    defaultValues: buildQuestionnaireDefaultValues(questionnaire),
    onSubmit: ({ value }) => {
      console.log(value);
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
        title={questionnaire.name}
        description="Edit the questionnaire to assess rider experience and automatically assign them to appropriate boards during onboarding."
        action={
          <div className="flex items-center gap-2">
            <Link
              to="/org/$slug/settings/organization/questionnaires"
              params={{ slug }}
              className={buttonVariants({ variant: "destructive" })}
            >
              Cancel
            </Link>
            <form.AppForm>
              <form.SubmitButton
                label="Update Questionnaire"
                loadingLabel="Updating..."
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
                  <field.SelectField
                    label="Default Board (Fallback)"
                    placeholder="Select a default board (optional)"
                    description="Assign to this board if no rules match the user's answers"
                    items={[
                      {
                        label: "No default (required rules match)",
                        value: "reset",
                      },
                      ...boards.map((board) => ({
                        label: board.name,
                        value: board.id,
                      })),
                    ]}
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
