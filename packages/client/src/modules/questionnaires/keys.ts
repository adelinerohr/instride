const getQuestionnaireRootKey = ["questionnaires"] as const;

export const questionnaireKeys = {
  root: () => getQuestionnaireRootKey,
  list: (organizationId: string) =>
    [...getQuestionnaireRootKey, organizationId] as const,
  byId: (questionnaireId: string) =>
    [...getQuestionnaireRootKey, questionnaireId] as const,
};
