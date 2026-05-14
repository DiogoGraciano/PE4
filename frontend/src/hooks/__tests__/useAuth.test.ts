import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAuth } from '../useAuth';
import { renderHookWithProviders, createTestStore, makeEmployee } from '../../test/utils';
import apiService from '../../services/api';

vi.mock('../../services/api', () => ({
  default: { login: vi.fn(), logout: vi.fn() },
}));

const mockedApi = vi.mocked(apiService);

describe('useAuth', () => {
  it('exposes selectors derived from redux state', () => {
    const user = makeEmployee();
    const store = createTestStore({
      auth: { user, token: 'tk', isLoading: true },
      ui: { sidebarOpen: true },
    });
    const { result } = renderHookWithProviders(() => useAuth(), { store });
    expect(result.current.user).toEqual(user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(true);
  });

  it('login dispatches loginThunk and resolves on success', async () => {
    mockedApi.login.mockResolvedValueOnce({ user: makeEmployee(), token: 'tk' });
    const { result, store } = renderHookWithProviders(() => useAuth());
    await act(async () => {
      await result.current.login({ email: 'e@t.com', password: 'p' });
    });
    expect(store.getState().auth.token).toBe('tk');
  });

  it('login rethrows when thunk rejects', async () => {
    mockedApi.login.mockRejectedValueOnce(new Error('bad'));
    const { result } = renderHookWithProviders(() => useAuth());
    await expect(
      act(async () => {
        await result.current.login({ email: 'e@t.com', password: 'p' });
      }),
    ).rejects.toThrow();
  });

  it('logout dispatches logoutThunk', async () => {
    mockedApi.logout.mockResolvedValueOnce();
    const store = createTestStore({
      auth: { user: makeEmployee(), token: 'tk', isLoading: false },
      ui: { sidebarOpen: true },
    });
    const { result } = renderHookWithProviders(() => useAuth(), { store });
    await act(async () => {
      await result.current.logout();
    });
    expect(store.getState().auth.user).toBeNull();
  });
});
