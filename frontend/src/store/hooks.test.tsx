import { describe, expect, it } from 'vitest';
import { renderHookWithProviders, createTestStore } from '../test/utils';
import { useAppDispatch, useAppSelector } from './hooks';

describe('store typed hooks', () => {
  it('useAppDispatch returns the store dispatch', () => {
    const store = createTestStore();
    const { result } = renderHookWithProviders(() => useAppDispatch(), { store });
    expect(result.current).toBe(store.dispatch);
  });

  it('useAppSelector reads from store state', () => {
    const { result } = renderHookWithProviders(() => useAppSelector((s) => s.ui.sidebarOpen));
    expect(result.current).toBe(true);
  });
});
