import type { types } from "@instride/api";
import { QuestionnaireQuestionType } from "@instride/shared";
import { useStore } from "@tanstack/react-store";
import { TrashIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/shared/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { withForm } from "@/shared/hooks/use-form";

import { questionnaireFormOpts } from "../../lib/questionnaire.form";
import {
  normalizeQuestions,
  removeDeletedQuestionFromRules,
  removeDeletedQuestionReferences,
} from "../../utils/questionnaire";

export const QuestionBuilder = withForm({
  ...questionnaireFormOpts,
  props: {
    index: 0,
    question: {} as types.QuestionnaireQuestion,
  },
  render: ({ form, index, question }) => {
    const questions = useStore(form.store, (state) => state.values.questions);
    const previousQuestions = questions.slice(0, index);

    const referencedQuestion = previousQuestions.find(
      (question) => question.id === question.showIf?.questionId
    );

    const canMoveUp = index > 0;
    const canMoveDown = index < questions.length - 1;

    const moveQuestion = (questionId: string, direction: "up" | "down") => {
      const index = questions.findIndex(
        (question) => question.id === questionId
      );
      if (index === -1) return;

      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= questions.length) return;

      const nextQuestions = [...questions];
      const [moved] = nextQuestions.splice(index, 1);
      nextQuestions.splice(nextIndex, 0, moved);

      form.setFieldValue("questions", normalizeQuestions(nextQuestions));
    };

    const deleteQuestion = (questionId: string) => {
      const nextQuestions = questions.filter(
        (question) => question.id !== questionId
      );
      form.setFieldValue(
        "questions",
        removeDeletedQuestionReferences(nextQuestions, questionId)
      );

      const rules = form.state.values.boardAssignmentRules;
      form.setFieldValue(
        "boardAssignmentRules",
        removeDeletedQuestionFromRules(rules, questionId)
      );
    };
    return (
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Question {index + 1}
          </span>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => moveQuestion(question.id, "up")}
              disabled={!canMoveUp}
            >
              ↑
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => moveQuestion(question.id, "down")}
              disabled={!canMoveDown}
            >
              ↓
            </Button>
          </div>
        </div>
        <FieldGroup className="rounded-md border p-4">
          <div className="flex items-start gap-4">
            <form.AppField
              name={`questions[${index}].text`}
              children={(field) => (
                <field.TextField
                  label="Question"
                  placeholder="Enter question text"
                />
              )}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => deleteQuestion(question.id)}
            >
              <TrashIcon className="text-destructive" />
            </Button>
          </div>

          <form.Field name={`questions[${index}].type`}>
            {(field) => (
              <FieldSet data-invalid={field.state.meta.errors.length > 0}>
                <FieldLegend>Question Type</FieldLegend>
                <RadioGroup
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(value) => {
                    const nextType = value as QuestionnaireQuestionType;
                    field.handleChange(nextType);

                    if (nextType === QuestionnaireQuestionType.BOOLEAN) {
                      form.setFieldValue(`questions[${index}].options`, null);
                    }

                    if (
                      nextType === QuestionnaireQuestionType.MULTIPLE_CHOICE
                    ) {
                      const currentOptions = form.getFieldValue(
                        `questions[${index}].options`
                      );

                      if (!currentOptions?.length) {
                        form.setFieldValue(`questions[${index}].options`, []);
                      }
                    }
                  }}
                >
                  <Field orientation="horizontal">
                    <RadioGroupItem
                      value={QuestionnaireQuestionType.BOOLEAN}
                      id={`${question.id}-boolean`}
                    />
                    <FieldLabel htmlFor={`${question.id}-boolean`}>
                      Yes/No
                    </FieldLabel>
                  </Field>
                  <Field orientation="horizontal">
                    <RadioGroupItem
                      value={QuestionnaireQuestionType.MULTIPLE_CHOICE}
                      id={`${question.id}-multiplechoice`}
                    />
                    <FieldLabel htmlFor={`${question.id}-multiplechoice`}>
                      Multiple Choice
                    </FieldLabel>
                  </Field>
                </RadioGroup>
              </FieldSet>
            )}
          </form.Field>
          {question?.type === QuestionnaireQuestionType.MULTIPLE_CHOICE ? (
            <form.AppField
              name={`questions[${index}].options`}
              children={(field) => (
                <field.TextareaField
                  label="Options (one per line)"
                  placeholder={`Beginner\nIntermediate\nAdvanced`}
                  onChange={(e) => {
                    field.handleChange(
                      e.target.value
                        .split("\n")
                        .map((item) => item.trim())
                        .filter(Boolean)
                    );
                  }}
                  value={field.state.value?.join("\n") ?? ""}
                />
              )}
            />
          ) : null}

          <form.AppField
            name={`questions[${index}].required`}
            children={(field) => <field.CheckboxField label="Required" />}
          />

          {questions.slice(0, index).length > 0 ? (
            <form.AppField
              name={`questions[${index}].showIf.questionId`}
              children={(field) => (
                <field.ClearableSelectField
                  label="Show this question only if..."
                  placeholder="Always show this question"
                  items={questions.slice(0, index)}
                  itemToValue={(item) => item?.id ?? null}
                  renderValue={(item) => item?.text}
                  onChange={(value) => {
                    if (value === null) {
                      form.setFieldValue(`questions[${index}].showIf`, null);
                      return null;
                    }

                    const selectedQuestion = questions
                      .slice(0, index)
                      .find((item) => item.id === value);

                    form.setFieldValue(`questions[${index}].showIf`, {
                      questionId: value,
                      responseValue:
                        selectedQuestion?.type ===
                        QuestionnaireQuestionType.BOOLEAN
                          ? true
                          : (selectedQuestion?.options?.[0] ?? ""),
                    });

                    return value;
                  }}
                />
              )}
            />
          ) : null}

          {question?.showIf &&
          referencedQuestion?.type === QuestionnaireQuestionType.BOOLEAN ? (
            <form.AppField
              name={`questions[${index}].showIf.responseValue`}
              children={(field) => (
                <FieldSet>
                  <FieldLegend>Answer that triggers this question</FieldLegend>
                  <field.BooleanRadioField trueLabel="Yes" falseLabel="No" />
                </FieldSet>
              )}
            />
          ) : null}

          {question?.showIf &&
          referencedQuestion?.type ===
            QuestionnaireQuestionType.MULTIPLE_CHOICE ? (
            <form.AppField
              name={`questions[${index}].showIf.responseValue`}
              children={(field) => (
                <field.SelectField
                  label="Answer that triggers this question"
                  placeholder="Select an answer"
                  items={
                    referencedQuestion.options?.map((option) => ({
                      label: option,
                      value: option,
                    })) ?? []
                  }
                  itemToValue={(item) => item.value}
                  renderValue={(item) => item.label}
                />
              )}
            />
          ) : null}
        </FieldGroup>
      </div>
    );
  },
});
