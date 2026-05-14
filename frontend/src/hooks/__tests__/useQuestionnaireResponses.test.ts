import { waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  useQuestionnaireResponses,
  useQuestionnaireResponse,
  useCreateQuestionnaireResponse,
} from '../useQuestionnaireResponses';
import { renderHookWithProviders, makeQuestionnaireResponse } from '../../test/utils';
import apiService from '../../services/api';
import { queryKeys } from '../../lib/queryKeys';

vi.mock('../../services/api', () => ({
  default: {
    getQuestionnaireResponses: vi.fn(),
    getQuestionnaireResponse: vi.fn(),
    createQuestionnaireResponse: vi.fn(),
  },
}));

const api = vi.mocked(apiService);
const ok = <T>(data: T) => ({ data, message: '', success: true });

describe('useQuestionnaireResponses', () => {
  it('fetches without filter and uses correct key', async () => {
    api.getQuestionnaireResponses.mockResolvedValueOnce(ok([makeQuestionnaireResponse()]));
    const { result, queryClient } = renderHookWithProviders(() => useQuestionnaireResponses());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getQuestionnaireResponses).toHaveBeenCalledWith(undefined);
    expect(queryClient.getQueryData(queryKeys.questionnaireResponses.all)).toHaveLength(1);
  });

  it('fetches with filter and uses parameterized key', async () => {
    api.getQuestionnaireResponses.mockResolvedValueOnce(ok([makeQuestionnaireResponse()]));
    const { result, queryClient } = renderHookWithProviders(() => useQuestionnaireResponses(8));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getQuestionnaireResponses).toHaveBeenCalledWith(8);
    expect(
      queryClient.getQueryData(queryKeys.questionnaireResponses.byQuestionnaire(8)),
    ).toHaveLength(1);
  });

  it('useQuestionnaireResponse fetches by id', async () => {
    api.getQuestionnaireResponse.mockResolvedValueOnce(ok(makeQuestionnaireResponse({ id: 9 })));
    const { result } = renderHookWithProviders(() => useQuestionnaireResponse(9));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getQuestionnaireResponse).toHaveBeenCalledWith(9);
  });

  it('useQuestionnaireResponse is disabled when id is 0', () => {
    const { result } = renderHookWithProviders(() => useQuestionnaireResponse(0));
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('useCreateQuestionnaireResponse invalidates cache', async () => {
    api.createQuestionnaireResponse.mockResolvedValueOnce(ok(makeQuestionnaireResponse()));
    const { result, queryClient } = renderHookWithProviders(() => useCreateQuestionnaireResponse());
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    await act(async () => {
      await result.current.mutateAsync({ aluno_id: 1 });
    });
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.questionnaireResponses.all });
  });
});
