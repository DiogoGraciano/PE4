import { describe, expect, it } from 'vitest';
import { store } from './index';

describe('redux store', () => {
  it('combines auth and ui slices with expected initial shape', () => {
    const state = store.getState();
    expect(state.auth).toEqual({
      user: null,
      token: null,
      isLoading: false,
    });
    expect(state.ui).toEqual({ sidebarOpen: true });
  });

  it('dispatches actions through the store', () => {
    store.dispatch({ type: 'ui/toggleSidebar' });
    expect(store.getState().ui.sidebarOpen).toBe(false);
    store.dispatch({ type: 'ui/toggleSidebar' });
    expect(store.getState().ui.sidebarOpen).toBe(true);
  });
});
