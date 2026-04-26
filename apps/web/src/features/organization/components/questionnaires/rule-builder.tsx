import type { Board } from "@instride/api";
import { QuestionnaireQuestionOperator } from "@instride/shared";
import { useStore } from "@tanstack/react-store";
import { PlusIcon, TrashIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { FieldGroup } from "@/shared/components/ui/field";
import { withForm } from "@/shared/hooks/use-form";

import { questionnaireFormOpts } from "../../lib/questionnaire.form";
import { createEmptyRule } from "../../utils/questionnaire";
import { ConditionsBuilder } from "./conditions-builder";

export const RuleBuilder = withForm({
  ...questionnaireFormOpts,
  props: {
    boards: [] as Board[],
  },
  render: ({ form, boards }) => {
    const questions = useStore(form.store, (state) => state.values.questions);

    const rules = useStore(
      form.store,
      (state) => state.values.boardAssignmentRules
    );

    const addRule = () => {
      form.setFieldValue("boardAssignmentRules", [
        ...rules,
        createEmptyRule(rules.length, boards),
      ]);
    };

    const removeRule = (ruleIndex: number) => {
      const nextRules = rules
        .filter((_, index) => index !== ruleIndex)
        .map((rule, index) => ({
          ...rule,
          priority: rule.priority ?? index,
        }));

      form.setFieldValue("boardAssignmentRules", nextRules);
    };

    if (boards.length === 0) {
      return (
        <div className="text-sm text-muted-foreground">
          No boards available. Please create boards first.
        </div>
      );
    }

    const sortedRules = [...rules]
      .map((rule, index) => ({ rule, index }))
      .sort((a, b) => (b.rule.priority ?? 0) - (a.rule.priority ?? 0));

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Board Assignment Rules</h3>
            <p className="text-sm text-muted-foreground">
              Define rules to automatically assign riders to boards based on
              their answers
            </p>
          </div>
          <Button onClick={addRule} type="button" variant="outline">
            <PlusIcon />
            Add Rule
          </Button>
        </div>

        <div className="space-y-4">
          {rules.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No rules defined. Click &quot;Add Rule&quot; to create your
                first rule.
              </p>
            </div>
          ) : null}

          {sortedRules.map(({ rule, index: ruleIndex }) => (
            <div key={rule.id} className="space-y-4 rounded-xl border p-4">
              <FieldGroup>
                <div className="flex items-start gap-4">
                  <form.AppField
                    name={`boardAssignmentRules[${ruleIndex}].name`}
                    children={(field) => (
                      <field.TextField
                        label="Rule Name"
                        placeholder="e.g., Assign experienced riders to Advanced Board"
                      />
                    )}
                  />

                  <Button
                    variant="ghost"
                    type="button"
                    size="icon"
                    onClick={() => removeRule(ruleIndex)}
                  >
                    <TrashIcon className="text-destructive" />
                  </Button>
                </div>

                <form.AppField
                  name={`boardAssignmentRules[${ruleIndex}].priority`}
                  children={(field) => (
                    <field.TextField
                      label="Priority"
                      type="number"
                      placeholder="Higher priority rules are evaluated first"
                      description="Higher numbers = higher priority (evaluated first)"
                    />
                  )}
                />

                <form.AppField
                  name={`boardAssignmentRules[${ruleIndex}].boardId`}
                  children={(field) => (
                    <field.SelectField
                      label="Assign to Board"
                      placeholder="Select a board"
                      items={boards}
                      renderValue={(value) => value.name}
                      itemToValue={(item) => item.id}
                    />
                  )}
                />

                <ConditionsBuilder form={form} ruleIndex={ruleIndex} />
              </FieldGroup>

              <div className="flex items-center gap-4">
                <div className="flex-1 rounded-lg bg-muted p-2.5 text-xs text-muted-foreground">
                  <strong>Rule Summary:</strong> If{" "}
                  {rule.conditions.length === 0 ? (
                    <span>always</span>
                  ) : (
                    rule.conditions.map((condition, conditionIndex) => {
                      const question = questions.find(
                        (item) => item.id === condition.questionId
                      );

                      return (
                        <span key={`${condition.questionId}-${conditionIndex}`}>
                          {conditionIndex > 0 ? " AND " : null}
                          <strong>
                            {question?.text || "Unknown question"}
                          </strong>{" "}
                          {condition.operator ===
                          QuestionnaireQuestionOperator.EQUALS
                            ? "="
                            : "≠"}{" "}
                          <strong>
                            {typeof condition.responseValue === "boolean"
                              ? condition.responseValue
                                ? "Yes"
                                : "No"
                              : condition.responseValue || "empty"}
                          </strong>
                        </span>
                      );
                    })
                  )}
                  , assign to board{" "}
                  <strong>
                    {boards.find((board) => board.id === rule.boardId)?.name ||
                      "Unknown"}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {rules.length > 1 ? (
          <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm">
            <strong>Evaluation Order:</strong> Rules are evaluated by priority
            (highest first). The first matching rule assigns the board.
          </div>
        ) : null}
      </div>
    );
  },
});
