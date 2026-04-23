import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";

import { questionnaireKeys } from "./keys";

export const questionnaireOptions = {
  list: (organizationId: string) =>
    queryOptions({
      queryKey: questionnaireKeys.list(organizationId),
      queryFn: async () => {
        const { questionnaires } =
          await apiClient.questionnaires.listQuestionnaires(organizationId);
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

export function useQuestionnaires(organizationId: string) {
  return useQuery(questionnaireOptions.list(organizationId));
}

export function useQuestionnaire(questionnaireId: string) {
  return useQuery(questionnaireOptions.byId(questionnaireId));
}
