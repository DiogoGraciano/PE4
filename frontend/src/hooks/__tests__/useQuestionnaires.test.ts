import { waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  useQuestionnaires,
  useCreateQuestionnaire,
  useUpdateQuestionnaire,
  useDeleteQuestionnaire,
} from '../useQuestionnaires';
import { renderHookWithProviders, makeQuestionnaire } from '../../test/utils';
import apiService from '../../services/api';
import { queryKeys } from '../../lib/queryKeys';

vi.mock('../../services/api', () => ({
  default: {
    getQuestionnaires: vi.fn(),
    createQuestionnaire: vi.fn(),
    updateQuestionnaire: vi.fn(),
    deleteQuestionnaire: vi.fn(),
  },
}));

const api = vi.mocked(apiService);
const ok = <T>(data: T) => ({ data, message: '', success: true });

describe('useQuestionnaires', () => {
  it('fetches list', async () => {
    api.getQuestionnaires.mockResolvedValueOnce(ok([makeQuestionnaire()]));
    const { result } = renderHookWithProviders(() => useQuestionnaires());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('useCreateQuestionnaire', async () => {
    api.createQuestionnaire.mockResolvedValueOnce(ok(makeQuestionnaire()));
    const { result, queryClient } = renderHookWithProviders(() => useCreateQuestionnaire());
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    await act(async () => {
      await result.current.mutateAsync({ nome: 'q' });
    });
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.questionnaires.all });
  });

  it('useUpdateQuestionnaire', async () => {
    api.updateQuestionnaire.mockResolvedValueOnce(ok(makeQuestionnaire()));
    const { result, queryClient } = renderHookWithProviders(() => useUpdateQuestionnaire());
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    await act(async () => {
      await result.current.mutateAsync({ id: 1, data: { nome: 'x' } });
    });
    expect(api.updateQuestionnaire).toHaveBeenCalledWith(1, { nome: 'x' });
    expect(spy).toHaveBeenCalled();
  });

  it('useDeleteQuestionnaire', async () => {
    api.deleteQuestionnaire.mockResolvedValueOnce(ok(undefined));
    const { result, queryClient } = renderHookWithProviders(() => useDeleteQuestionnaire());
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    await act(async () => {
      await result.current.mutateAsync(3);
    });
    expect(api.deleteQuestionnaire).toHaveBeenCalledWith(3);
    expect(spy).toHaveBeenCalled();
  });
});
