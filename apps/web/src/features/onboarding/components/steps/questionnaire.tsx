import { questionnaireOptions } from "@instride/api";
import type { types } from "@instride/api";
import {
  QuestionnaireQuestionType,
  replaceYouWithThey,
} from "@instride/shared";
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
import { withFieldGroup } from "@/shared/hooks/form";

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
    const questions = activeQuestionnaire.questions;

    React.useEffect(() => {
      // Clean up responses for hidden questions when visibility changes
      const currentResponses = group.getFieldValue("responses");
      const updatedResponses = [...currentResponses];
      let hasChanges = false;

      questions.forEach((question) => {
        const isVisible = isQuestionVisible(question, currentResponses);
        const existingResponse = currentResponses.find(
          (r) => r.questionId === question.id
        );

        if (isVisible && !existingResponse) {
          // Initialize response for newly visible question
          updatedResponses.push({
            questionId: question.id,
            responseValue:
              question.type === QuestionnaireQuestionType.MULTIPLE_CHOICE
                ? ""
                : false,
          });
          hasChanges = true;
        } else if (!isVisible && existingResponse) {
          // Remove response for hidden question
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
      if (isDependent) {
        return replaceYouWithThey(text);
      }
      return text;
    };

    const updateResponse = (questionId: string, value: string | boolean) => {
      const currentResponses = group.getFieldValue("responses");
      const responseIndex = currentResponses.findIndex(
        (r) => r.questionId === questionId
      );

      let updatedResponses: types.QuestionnaireQuestionResponse[];
      if (responseIndex !== -1) {
        updatedResponses = [...currentResponses];
        updatedResponses[responseIndex] = { questionId, responseValue: value };
      } else {
        updatedResponses = [
          ...currentResponses,
          { questionId, responseValue: value },
        ];
      }

      group.setFieldValue("responses", updatedResponses);
    };

    const orderedQuestions = [...questions].sort((a, b) => a.order - b.order);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Questionnaire</h2>
          <p className="mt-1 text-muted-foreground">
            Please answer the following questions to complete your onboarding.
          </p>
        </div>

        <FieldGroup>
          {orderedQuestions.map((question, index) => {
            const isVisible = isQuestionVisible(question, responses);

            if (!isVisible) {
              return null;
            }

            switch (question.type) {
              case QuestionnaireQuestionType.BOOLEAN:
                return (
                  <group.AppField
                    name={`responses[${index}].responseValue`}
                    children={(field) => (
                      <field.SwitchField
                        onCheckedChange={(value) =>
                          updateResponse(question.id, value)
                        }
                        label={renderedQuestion(question.text)}
                        required={question.required}
                      />
                    )}
                  />
                );
              case QuestionnaireQuestionType.MULTIPLE_CHOICE:
                return (
                  <group.Field
                    name={`responses[${index}].responseValue`}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel>
                            {renderedQuestion(question.text)}
                            {question.required && (
                              <span className="text-destructive">*</span>
                            )}
                          </FieldLabel>
                          <RadioGroup
                            value={field.state.value ?? ""}
                            onValueChange={(value) =>
                              updateResponse(question.id, value)
                            }
                          >
                            {question.options?.map((option) => (
                              <Field
                                key={option}
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
