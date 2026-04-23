const getQuestionnaireRootKey = ["questionnaires"] as const;

export const questionnaireKeys = {
  list: (organizationId: string) =>
    [...getQuestionnaireRootKey, organizationId] as const,
  byId: (questionnaireId: string) =>
    [...getQuestionnaireRootKey, questionnaireId] as const,
};
