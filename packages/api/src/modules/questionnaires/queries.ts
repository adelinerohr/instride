import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";

import { questionnaireKeys } from "./keys";

export const questionnaireOptions = {
  list: () =>
    queryOptions({
      queryKey: questionnaireKeys.list(),
      queryFn: async () => {
        const { questionnaires } =
          await apiClient.questionnaires.listQuestionnaires();
        return questionnaires;
      },
    }),
  byId: (questionnaireId: string) =>
    queryOptions({
      queryKey: questionnaireKeys.byId(questionnaireId),
      queryFn: async () => {
        const { questionnaire } =
          await apiClient.questionnaires.getQuestionnaire(questionnaireId);
        return questionnaire;
      },
    }),
};

export function useQuestionnaires() {
  return useQuery(questionnaireOptions.list());
}

export function useQuestionnaire(questionnaireId: string) {
  return useQuery(questionnaireOptions.byId(questionnaireId));
}
