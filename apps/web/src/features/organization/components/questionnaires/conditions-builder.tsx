import {
  QuestionnaireQuestionOperator,
  QuestionnaireQuestionType,
} from "@instride/shared";
import { useStore } from "@tanstack/react-store";
import { PlusIcon, TrashIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { withForm } from "@/shared/hooks/use-form";

import { questionnaireFormOpts } from "../../lib/questionnaire.form";

export const ConditionsBuilder = withForm({
  ...questionnaireFormOpts,
  props: {
    ruleIndex: 0,
  },
  render: ({ form, ruleIndex }) => {
    const questions = useStore(form.store, (state) => state.values.questions);
    const conditions = useStore(
      form.store,
      (state) => state.values.boardAssignmentRules[ruleIndex].conditions
    );

    const setConditions = (nextConditions: typeof conditions) => {
      form.setFieldValue(
        `boardAssignmentRules[${ruleIndex}].conditions`,
        nextConditions
      );
    };

    const addCondition = () => {
      const firstQuestion = questions[0];
      if (!firstQuestion) return;

      setConditions([
        ...conditions,
        {
          questionId: firstQuestion.id,
          operator: QuestionnaireQuestionOperator.EQUALS,
          responseValue:
            firstQuestion.type === QuestionnaireQuestionType.BOOLEAN
              ? false
              : (firstQuestion.options?.[0] ?? ""),
        },
      ]);
    };

    const removeCondition = (conditionIndex: number) => {
      setConditions(conditions.filter((_, index) => index !== conditionIndex));
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <FieldLabel>Conditions (all must match)</FieldLabel>
          <Button
            onClick={addCondition}
            size="sm"
            type="button"
            variant="outline"
            disabled={questions.length === 0}
          >
            <PlusIcon className="mr-2 size-3" />
            Add Condition
          </Button>
        </div>

        {conditions.length === 0 ? (
          <div className="rounded border border-dashed p-4 text-center">
            <p className="text-xs text-muted-foreground">
              No conditions. This rule will match all responses.
            </p>
          </div>
        ) : null}

        <FieldGroup>
          {conditions.map((condition, conditionIndex) => {
            const selectedQuestion = questions.find(
              (question) => question.id === condition.questionId
            );

            return (
              <div
                key={`${condition.questionId}-${conditionIndex}`}
                className="flex items-start gap-4 rounded-md border p-3"
              >
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <form.AppField
                      name={`boardAssignmentRules[${ruleIndex}].conditions[${conditionIndex}].questionId`}
                      children={(field) => (
                        <field.SelectField
                          label="Question"
                          placeholder="Select a question"
                          disabled={questions.length === 0}
                          onChange={(value) => {
                            const nextQuestion = questions.find(
                              (question) => question.id === value
                            );

                            field.handleChange(value);
                            form.setFieldValue(
                              `boardAssignmentRules[${ruleIndex}].conditions[${conditionIndex}].responseValue`,
                              nextQuestion?.type ===
                                QuestionnaireQuestionType.BOOLEAN
                                ? false
                                : (nextQuestion?.options?.[0] ?? "")
                            );

                            return value;
                          }}
                          items={questions}
                          renderValue={(value) => value.text}
                          itemToValue={(item) => item.id}
                        />
                      )}
                    />

                    <form.AppField
                      name={`boardAssignmentRules[${ruleIndex}].conditions[${conditionIndex}].operator`}
                      children={(field) => (
                        <field.SelectField
                          label="Operator"
                          items={[
                            {
                              label: "Equals",
                              value: QuestionnaireQuestionOperator.EQUALS,
                            },
                            {
                              label: "Not Equals",
                              value: QuestionnaireQuestionOperator.NOT_EQUALS,
                            },
                          ]}
                          renderValue={(value) => value.label}
                          itemToValue={(item) => item.value}
                        />
                      )}
                    />
                  </div>

                  {selectedQuestion?.type ===
                  QuestionnaireQuestionType.BOOLEAN ? (
                    <form.AppField
                      name={`boardAssignmentRules[${ruleIndex}].conditions[${conditionIndex}].responseValue`}
                      children={(field) => (
                        <field.BooleanRadioField
                          label="Value"
                          trueConfig={{ label: "Yes" }}
                          falseConfig={{ label: "No" }}
                        />
                      )}
                    />
                  ) : null}

                  {selectedQuestion?.type ===
                  QuestionnaireQuestionType.MULTIPLE_CHOICE ? (
                    <form.AppField
                      name={`boardAssignmentRules[${ruleIndex}].conditions[${conditionIndex}].responseValue`}
                      children={(field) => (
                        <field.SelectField
                          label="Value"
                          placeholder="Select an option"
                          items={(selectedQuestion.options ?? []).map(
                            (option) => ({
                              label: option,
                              value: option,
                            })
                          )}
                          renderValue={(value) => value.label}
                          itemToValue={(item) => item.value}
                        />
                      )}
                    />
                  ) : null}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => removeCondition(conditionIndex)}
                >
                  <TrashIcon className="text-destructive" />
                </Button>
              </div>
            );
          })}
        </FieldGroup>
      </div>
    );
  },
});
