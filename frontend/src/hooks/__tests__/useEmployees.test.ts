import { waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from '../useEmployees';
import { renderHookWithProviders, makeEmployee } from '../../test/utils';
import apiService from '../../services/api';
import { queryKeys } from '../../lib/queryKeys';

vi.mock('../../services/api', () => ({
  default: {
    getEmployees: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
  },
}));

const api = vi.mocked(apiService);
const ok = <T>(data: T) => ({ data, message: '', success: true });

describe('useEmployees', () => {
  it('fetches list', async () => {
    api.getEmployees.mockResolvedValueOnce(ok([makeEmployee()]));
    const { result } = renderHookWithProviders(() => useEmployees());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it.each([
    ['create', useCreateEmployee, (m: { mutateAsync: (p: unknown) => unknown }) => m.mutateAsync({ nome: 'x' }), api.createEmployee],
    ['update', useUpdateEmployee, (m: { mutateAsync: (p: unknown) => unknown }) => m.mutateAsync({ id: 1, data: { nome: 'y' } }), api.updateEmployee],
    ['delete', useDeleteEmployee, (m: { mutateAsync: (p: unknown) => unknown }) => m.mutateAsync(2), api.deleteEmployee],
  ])('mutation %s invalidates cache', async (_label, hook, invoke, apiFn) => {
    (apiFn as unknown as { mockResolvedValueOnce: (v: unknown) => void }).mockResolvedValueOnce(
      ok(makeEmployee()),
    );
    const { result, queryClient } = renderHookWithProviders(() => hook());
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    await act(async () => {
      await invoke(result.current as { mutateAsync: (p: unknown) => unknown });
    });
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.employees.all });
  });
});
