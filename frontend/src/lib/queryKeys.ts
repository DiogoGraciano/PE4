export const queryKeys = {
  students: {
    all: ['students'] as const,
    detail: (id: number) => ['students', id] as const,
  },
  companies: {
    all: ['companies'] as const,
  },
  employees: {
    all: ['employees'] as const,
  },
  functions: {
    all: ['functions'] as const,
  },
  questionnaires: {
    all: ['questionnaires'] as const,
  },
  questions: {
    all: ['questions'] as const,
    byQuestionnaire: (id: number) => ['questions', { questionnaireId: id }] as const,
  },
  questionnaireResponses: {
    all: ['questionnaire-responses'] as const,
    byQuestionnaire: (id: number) => ['questionnaire-responses', { questionnaireId: id }] as const,
    detail: (id: number) => ['questionnaire-responses', id] as const,
  },
  referrals: {
    all: ['referrals'] as const,
    byStudent: (alunoId: number) => ['referrals', { alunoId }] as const,
  },
  events: {
    all: ['events'] as const,
    detail: (id: number) => ['events', id] as const,
  },
  smtpConfig: {
    all: ['smtp-config'] as const,
  },
} as const;
