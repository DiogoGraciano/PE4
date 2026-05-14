import { waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  useReferrals,
  useCreateReferral,
  useUpdateReferral,
  useDeleteReferral,
} from '../useReferrals';
import { renderHookWithProviders, makeReferral } from '../../test/utils';
import apiService from '../../services/api';
import { queryKeys } from '../../lib/queryKeys';

vi.mock('../../services/api', () => ({
  default: {
    getReferrals: vi.fn(),
    createReferral: vi.fn(),
    updateReferral: vi.fn(),
    deleteReferral: vi.fn(),
  },
}));

const api = vi.mocked(apiService);
const ok = <T>(data: T) => ({ data, message: '', success: true });

describe('useReferrals', () => {
  it('fetches without filter', async () => {
    api.getReferrals.mockResolvedValueOnce(ok([makeReferral()]));
    const { result, queryClient } = renderHookWithProviders(() => useReferrals());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getReferrals).toHaveBeenCalledWith(undefined);
    expect(queryClient.getQueryData(queryKeys.referrals.all)).toHaveLength(1);
  });

  it('fetches by aluno_id and uses parameterized key', async () => {
    api.getReferrals.mockResolvedValueOnce(ok([makeReferral()]));
    const { result, queryClient } = renderHookWithProviders(() => useReferrals(3));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getReferrals).toHaveBeenCalledWith(3);
    expect(queryClient.getQueryData(queryKeys.referrals.byStudent(3))).toHaveLength(1);
  });

  it('mutations invalidate the cache', async () => {
    api.createReferral.mockResolvedValueOnce(ok(makeReferral()));
    api.updateReferral.mockResolvedValueOnce(ok(makeReferral()));
    api.deleteReferral.mockResolvedValueOnce(ok(undefined));

    const create = renderHookWithProviders(() => useCreateReferral());
    const update = renderHookWithProviders(() => useUpdateReferral());
    const del = renderHookWithProviders(() => useDeleteReferral());

    const createSpy = vi.spyOn(create.queryClient, 'invalidateQueries');
    const updateSpy = vi.spyOn(update.queryClient, 'invalidateQueries');
    const deleteSpy = vi.spyOn(del.queryClient, 'invalidateQueries');

    await act(async () => {
      await create.result.current.mutateAsync({ aluno_id: 1 });
    });
    await act(async () => {
      await update.result.current.mutateAsync({ id: 2, data: { aluno_id: 1 } });
    });
    await act(async () => {
      await del.result.current.mutateAsync(3);
    });

    expect(createSpy).toHaveBeenCalledWith({ queryKey: queryKeys.referrals.all });
    expect(updateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.referrals.all });
    expect(deleteSpy).toHaveBeenCalledWith({ queryKey: queryKeys.referrals.all });
    expect(api.updateReferral).toHaveBeenCalledWith(2, { aluno_id: 1 });
    expect(api.deleteReferral).toHaveBeenCalledWith(3);
  });
});
