import { waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
} from '../useCompanies';
import { renderHookWithProviders, makeCompany } from '../../test/utils';
import apiService from '../../services/api';
import { queryKeys } from '../../lib/queryKeys';

vi.mock('../../services/api', () => ({
  default: {
    getCompanies: vi.fn(),
    createCompany: vi.fn(),
    updateCompany: vi.fn(),
    deleteCompany: vi.fn(),
  },
}));

const api = vi.mocked(apiService);
const ok = <T>(data: T) => ({ data, message: '', success: true });

describe('useCompanies & mutations', () => {
  it('fetches list', async () => {
    api.getCompanies.mockResolvedValueOnce(ok([makeCompany()]));
    const { result } = renderHookWithProviders(() => useCompanies());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('useCreateCompany invalidates cache', async () => {
    api.createCompany.mockResolvedValueOnce(ok(makeCompany()));
    const { result, queryClient } = renderHookWithProviders(() => useCreateCompany());
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    await act(async () => {
      await result.current.mutateAsync({ razao_social: 'x' });
    });
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.companies.all });
  });

  it('useUpdateCompany', async () => {
    api.updateCompany.mockResolvedValueOnce(ok(makeCompany()));
    const { result, queryClient } = renderHookWithProviders(() => useUpdateCompany());
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    await act(async () => {
      await result.current.mutateAsync({ id: 1, data: { cnpj: '00' } });
    });
    expect(api.updateCompany).toHaveBeenCalledWith(1, { cnpj: '00' });
    expect(spy).toHaveBeenCalled();
  });

  it('useDeleteCompany', async () => {
    api.deleteCompany.mockResolvedValueOnce(ok(undefined));
    const { result, queryClient } = renderHookWithProviders(() => useDeleteCompany());
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    await act(async () => {
      await result.current.mutateAsync(2);
    });
    expect(api.deleteCompany).toHaveBeenCalledWith(2);
    expect(spy).toHaveBeenCalled();
  });
});
