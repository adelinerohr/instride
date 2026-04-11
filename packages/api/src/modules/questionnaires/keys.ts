const getQuestionnaireRootKey = ["questionnaires"] as const;

export const questionnaireKeys = {
  list: () => getQuestionnaireRootKey,
  byId: (questionnaireId: string) =>
    [...getQuestionnaireRootKey, questionnaireId] as const,
};
