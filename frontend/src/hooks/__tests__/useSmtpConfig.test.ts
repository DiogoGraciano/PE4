import { waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  useSmtpConfig,
  useSaveSmtpConfig,
  useTestSmtpConnection,
} from '../useSmtpConfig';
import { renderHookWithProviders } from '../../test/utils';
import apiService from '../../services/api';
import { queryKeys } from '../../lib/queryKeys';

vi.mock('../../services/api', () => ({
  default: {
    getSmtpConfig: vi.fn(),
    saveSmtpConfig: vi.fn(),
    testSmtpConnection: vi.fn(),
  },
}));

const api = vi.mocked(apiService);
const ok = <T>(data: T) => ({ data, message: '', success: true });

describe('useSmtpConfig', () => {
  it('fetches config', async () => {
    api.getSmtpConfig.mockResolvedValueOnce(ok({ host: 'smtp' }));
    const { result } = renderHookWithProviders(() => useSmtpConfig());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ host: 'smtp' });
  });

  it('useSaveSmtpConfig calls api and invalidates', async () => {
    api.saveSmtpConfig.mockResolvedValueOnce(ok({}));
    const { result, queryClient } = renderHookWithProviders(() => useSaveSmtpConfig());
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    await act(async () => {
      await result.current.mutateAsync({ host: 'x' });
    });
    expect(api.saveSmtpConfig).toHaveBeenCalledWith({ host: 'x' });
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.smtpConfig.all });
  });

  it('useTestSmtpConnection calls api but does not invalidate', async () => {
    api.testSmtpConnection.mockResolvedValueOnce(ok({ ok: true }));
    const { result, queryClient } = renderHookWithProviders(() => useTestSmtpConnection());
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    await act(async () => {
      await result.current.mutateAsync({ host: 'x' });
    });
    expect(api.testSmtpConnection).toHaveBeenCalledWith({ host: 'x' });
    expect(spy).not.toHaveBeenCalled();
  });
});
