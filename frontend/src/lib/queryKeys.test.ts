import { describe, expect, it } from 'vitest';
import { queryKeys } from './queryKeys';

describe('queryKeys', () => {
  it('exposes consistent static keys', () => {
    expect(queryKeys.students.all).toEqual(['students']);
    expect(queryKeys.companies.all).toEqual(['companies']);
    expect(queryKeys.employees.all).toEqual(['employees']);
    expect(queryKeys.functions.all).toEqual(['functions']);
    expect(queryKeys.questionnaires.all).toEqual(['questionnaires']);
    expect(queryKeys.questions.all).toEqual(['questions']);
    expect(queryKeys.questionnaireResponses.all).toEqual(['questionnaire-responses']);
    expect(queryKeys.referrals.all).toEqual(['referrals']);
    expect(queryKeys.events.all).toEqual(['events']);
    expect(queryKeys.smtpConfig.all).toEqual(['smtp-config']);
  });

  it('generates parameterized keys', () => {
    expect(queryKeys.students.detail(7)).toEqual(['students', 7]);
    expect(queryKeys.questions.byQuestionnaire(2)).toEqual([
      'questions',
      { questionnaireId: 2 },
    ]);
    expect(queryKeys.questionnaireResponses.byQuestionnaire(3)).toEqual([
      'questionnaire-responses',
      { questionnaireId: 3 },
    ]);
    expect(queryKeys.questionnaireResponses.detail(4)).toEqual([
      'questionnaire-responses',
      4,
    ]);
    expect(queryKeys.referrals.byStudent(5)).toEqual(['referrals', { alunoId: 5 }]);
    expect(queryKeys.events.detail(6)).toEqual(['events', 6]);
  });
});
