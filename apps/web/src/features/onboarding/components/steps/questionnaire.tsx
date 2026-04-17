import { questionnaireOptions } from "@instride/api";
import type { types } from "@instride/api";
import { QuestionnaireQuestionType } from "@instride/shared";
import { replaceYouWithThey } from "@instride/shared";
import { useStore } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { withFieldGroup } from "@/shared/hooks/use-form";
import { formatError } from "@/shared/lib/utils/errors";

import { isQuestionVisible } from "../../lib/member/questionnaire.schema";

export const QuestionnaireStep = withFieldGroup({
  defaultValues: {
    questionnaireId: "",
    responses: [] as types.QuestionnaireQuestionResponse[],
  },
  props: {
    isDependent: false,
  },
  render: function Render({ group, isDependent }) {
    const { data: questionnaires } = useSuspenseQuery(
      questionnaireOptions.list()
    );
    const activeQuestionnaire =
      questionnaires.find((q) => q.isActive) ?? questionnaires[0];

    const responses = useStore(group.store, (state) => state.values.responses);
    const questions = activeQuestionnaire?.questions ?? [];

    React.useEffect(() => {
      if (!activeQuestionnaire?.id) return;

      if (group.getFieldValue("questionnaireId") !== activeQuestionnaire.id) {
        group.setFieldValue("questionnaireId", activeQuestionnaire.id);
      }
    }, [activeQuestionnaire?.id, group]);

    React.useEffect(() => {
      const currentResponses = group.getFieldValue("responses");
      const updatedResponses = [...currentResponses];
      let hasChanges = false;

      questions.forEach((question) => {
        const isVisible = isQuestionVisible({
          question,
          questions,
          responses: currentResponses,
        });
        const existingResponse = currentResponses.find(
          (r) => r.questionId === question.id
        );

        if (isVisible && !existingResponse) {
          updatedResponses.push({
            questionId: question.id,
            responseValue:
              question.type === QuestionnaireQuestionType.MULTIPLE_CHOICE
                ? ""
                : false,
          });
          hasChanges = true;
        } else if (!isVisible && existingResponse) {
          const index = updatedResponses.findIndex(
            (r) => r.questionId === question.id
          );
          if (index !== -1) {
            updatedResponses.splice(index, 1);
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        group.setFieldValue("responses", updatedResponses);
      }
    }, [questions, group, responses]);

    const renderedQuestion = (text: string) => {
      return isDependent ? replaceYouWithThey(text) : text;
    };

    const updateResponse = (questionId: string, value: string | boolean) => {
      const currentResponses = group.getFieldValue("responses");
      const responseIndex = currentResponses.findIndex(
        (r) => r.questionId === questionId
      );

      const updatedResponses =
        responseIndex !== -1
          ? currentResponses.map((r, i) =>
              i === responseIndex ? { questionId, responseValue: value } : r
            )
          : [...currentResponses, { questionId, responseValue: value }];

      group.setFieldValue("responses", updatedResponses);
    };

    const orderedQuestions = [...questions].sort((a, b) => a.order - b.order);

    if (!activeQuestionnaire) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Questionnaire</h2>
            <p className="mt-1 text-muted-foreground">
              No questionnaire available.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Questionnaire</h2>
          <p className="mt-1 text-muted-foreground">
            Please answer the following questions to complete your onboarding.
          </p>
        </div>

        <FieldGroup>
          {orderedQuestions.map((question) => {
            const isVisible = isQuestionVisible({
              question,
              questions,
              responses,
            });

            if (!isVisible) return null;

            const responseIndex = responses.findIndex(
              (r) => r.questionId === question.id
            );

            if (responseIndex === -1) return null;

            const responseValuePath =
              `responses[${responseIndex}].responseValue` as const;

            switch (question.type) {
              case QuestionnaireQuestionType.BOOLEAN:
                return (
                  <group.AppField
                    key={question.id}
                    name={responseValuePath}
                    validators={{
                      onSubmit: ({ value }) => {
                        if (question.required && !value) {
                          return formatError("This field is required");
                        }
                      },
                    }}
                    children={(field) => (
                      <field.BooleanRadioField
                        label={renderedQuestion(question.text)}
                        required={question.required}
                      />
                    )}
                  />
                );

              case QuestionnaireQuestionType.MULTIPLE_CHOICE:
                return (
                  <group.Field
                    key={question.id}
                    name={responseValuePath}
                    validators={{
                      onSubmit: ({ value }) => {
                        if (
                          question.required &&
                          (!value ||
                            (typeof value === "string" &&
                              value.trim().length === 0))
                        ) {
                          return formatError("Please select an option");
                        }
                      },
                    }}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel>
                            {renderedQuestion(question.text)}
                            {question.required && (
                              <span className="text-destructive">*</span>
                            )}
                          </FieldLabel>
                          <RadioGroup
                            value={
                              typeof field.state.value === "string"
                                ? field.state.value
                                : ""
                            }
                            onValueChange={(value) =>
                              updateResponse(question.id, value)
                            }
                          >
                            {question.options?.map((option) => (
                              <Field
                                key={`${question.id}-${option}`}
                                orientation="horizontal"
                                data-invalid={isInvalid}
                              >
                                <RadioGroupItem
                                  value={option}
                                  id={`${question.id}-${option}`}
                                />
                                <FieldLabel
                                  htmlFor={`${question.id}-${option}`}
                                >
                                  {option}
                                </FieldLabel>
                              </Field>
                            ))}
                          </RadioGroup>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  />
                );
            }
          })}
        </FieldGroup>
      </div>
    );
  },
});
