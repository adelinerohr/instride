import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal";
import { apiClient } from "#client";
import {
  CreateQuestionnaireRequest,
  SubmitQuestionnaireResponseRequest,
  UpdateQuestionnaireRequest,
} from "#contracts";

import { questionnaireKeys } from "./keys";

export const questionnaireMutations = {
  create: async (request: CreateQuestionnaireRequest) => {
    const { questionnaire } =
      await apiClient.questionnaires.createQuestionnaire(request);
    return questionnaire;
  },
  update: async ({ id, ...request }: UpdateQuestionnaireRequest) => {
    const { questionnaire } =
      await apiClient.questionnaires.updateQuestionnaire(id, request);
    return questionnaire;
  },
  deactivate: async (questionnaireId: string) => {
    await apiClient.questionnaires.deactivateQuestionnaire(questionnaireId);
  },
  // ---- Responses ------------------------------------------------
  submitResponse: async ({
    questionnaireId,
    ...request
  }: SubmitQuestionnaireResponseRequest) => {
    return await apiClient.questionnaires.submitResponse(
      questionnaireId,
      request
    );
  },
};

export function useCreateQuestionnaire({
  mutationConfig,
}: MutationHookOptions<typeof questionnaireMutations.create> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(questionnaireMutations.create, {
    ...config,
    onSuccess: (questionnaire, ...args) => {
      queryClient.invalidateQueries({
        queryKey: questionnaireKeys.list(questionnaire.organizationId),
      });
      onSuccess?.(questionnaire, ...args);
    },
  });
}

export function useUpdateQuestionnaire({
  mutationConfig,
}: MutationHookOptions<typeof questionnaireMutations.update> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(questionnaireMutations.update, {
    ...config,
    onSuccess: (questionnaire, ...args) => {
      queryClient.invalidateQueries({
        queryKey: questionnaireKeys.byId(questionnaire.id),
      });
      onSuccess?.(questionnaire, ...args);
    },
  });
}

export function useDeactivateQuestionnaire({
  mutationConfig,
}: MutationHookOptions<typeof questionnaireMutations.deactivate> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(questionnaireMutations.deactivate, {
    ...config,
    onSuccess: (questionnaireId, ...args) => {
      queryClient.invalidateQueries({
        queryKey: questionnaireKeys.root(),
      });
      onSuccess?.(questionnaireId, ...args);
    },
  });
}

export function useSubmitQuestionnaireResponse({
  mutationConfig,
}: MutationHookOptions<typeof questionnaireMutations.submitResponse> = {}) {
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(questionnaireMutations.submitResponse, {
    ...config,
    onSuccess: (response, ...args) => {
      onSuccess?.(response, ...args);
    },
  });
}
